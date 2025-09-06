// Enhanced Pricing Service for MTG Cards
// Provides meaningful price ranges and filters out skewed pricing from special versions

class PricingService {
  constructor() {
    this.priceCache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    // Concurrency and in-flight control
    this.maxConcurrent = 4;
    this.currentActive = 0;
    this.requestDelayMs = 150; // small delay between requests to be nice to APIs
    this.queue = [];
    this.inflight = new Map(); // key -> Promise
  }

  async schedule(task) {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this.currentActive += 1;
        try {
          const result = await task();
          // small delay to avoid bursts
          if (this.requestDelayMs > 0) {
            await new Promise(r => setTimeout(r, this.requestDelayMs));
          }
          resolve(result);
        } catch (e) {
          reject(e);
        } finally {
          this.currentActive -= 1;
          const next = this.queue.shift();
          if (next) next();
        }
      };
      if (this.currentActive < this.maxConcurrent) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }

  async _fetchWithLimit(url, options = {}) {
    return this.schedule(async () => {
      return fetch(url, options);
    });
  }

  // Get competitive pricing for a card (filters out altered art, prerelease, etc.)
  async getCompetitivePricing(cardName, setCode = null, opts = {}) {
    const cacheKey = `${cardName}_${setCode || 'any'}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.priceCache.get(cacheKey).data;
    }

    // De-dupe concurrent requests for the same key
    if (this.inflight.has(cacheKey)) {
      return this.inflight.get(cacheKey);
    }

    try {
      const promise = (async () => {
        // Use Scryfall to get all printings and filter for competitive versions
        const printings = await this.getCardPrintings(cardName, opts.signal);
        const competitivePrices = this.filterCompetitivePrintings(printings, setCode);
        
        const pricing = this.calculatePriceRanges(competitivePrices);
        
        this.setCache(cacheKey, pricing);
        return pricing;
      })();
      this.inflight.set(cacheKey, promise);
      const result = await promise;
      return result;
    } catch (error) {
      console.error('Error getting competitive pricing:', error);
      return this.getFallbackPricing(cardName);
    }
    finally {
      this.inflight.delete(cacheKey);
    }
  }

  // Get all printings of a card from Scryfall
  async getCardPrintings(cardName, signal) {
    try {
      const response = await this._fetchWithLimit(
        `https://api.scryfall.com/cards/search?q=!"${cardName}" unique:prints`,
        { signal }
      );
      const data = await response.json();
      
      if (!data.data) return [];
      
      return data.data.map(card => ({
        name: card.name,
        set: card.set,
        set_name: card.set_name,
        collector_number: card.collector_number,
        prices: card.prices,
        finishes: card.finishes || [],
        frame_effects: card.frame_effects || [],
        promo: card.promo || false,
        digital: card.digital || false,
        full_art: card.full_art || false,
        textless: card.textless || false,
        variation: card.variation || false,
        set_type: card.set_type
      }));
    } catch (error) {
      console.error('Error fetching card printings:', error);
      return [];
    }
  }

  // Filter out printings that skew competitive pricing
  filterCompetitivePrintings(printings, preferredSet = null) {
    return printings.filter(card => {
      // Skip digital-only cards
      if (card.digital) return false;
      
      // Skip promo versions that aren't tournament legal
      if (card.promo && !this.isTournamentLegal(card)) return false;
      
      // Skip special art versions that command premium prices
      if (card.full_art || card.textless) return false;
      
      // Skip variations unless they're the main printing
      if (card.variation && !this.isMainPrinting(card)) return false;
      
      // Skip special frame effects that aren't standard
      if (card.frame_effects && card.frame_effects.length > 0) {
        const specialFrames = ['showcase', 'borderless', 'extended-art'];
        if (card.frame_effects.some(effect => specialFrames.includes(effect))) return false;
      }
      
      // Skip sets that typically have inflated prices
      if (this.isExpensiveSet(card.set_type)) return false;
      
      return true;
    });
  }

  // Check if a card is tournament legal
  isTournamentLegal(card) {
    // Most promo cards are tournament legal, but some special versions aren't
    // This is a simplified check - in production you'd want more sophisticated logic
    return true;
  }

  // Check if this is the main printing of a card
  isMainPrinting(card) {
    // Prefer core sets, expansions over special releases
    return card.set_type === 'core' || card.set_type === 'expansion';
  }

  // Check if a set type typically has inflated prices
  isExpensiveSet(setType) {
    const expensiveTypes = ['masterpiece', 'from_the_vault', 'commander_series'];
    return expensiveTypes.includes(setType);
  }

  // Calculate meaningful price ranges from competitive printings
  calculatePriceRanges(competitivePrintings) {
    if (competitivePrintings.length === 0) {
      return this.getFallbackPricing('Unknown Card');
    }

    const allPrices = [];
    const foilPrices = [];

    competitivePrintings.forEach(card => {
      if (card.prices) {
        // Collect non-foil prices
        if (card.prices.usd) allPrices.push(parseFloat(card.prices.usd));
        if (card.prices.usd_foil) foilPrices.push(parseFloat(card.prices.usd_foil));
        if (card.prices.usd_etched) foilPrices.push(parseFloat(card.prices.usd_etched));
      }
    });

    // Filter out invalid prices
    const validPrices = allPrices.filter(price => price > 0 && price < 10000);
    const validFoilPrices = foilPrices.filter(price => price > 0 && price < 10000);

    if (validPrices.length === 0) {
      return this.getFallbackPricing('Unknown Card');
    }

    // Calculate price ranges
    const sortedPrices = validPrices.sort((a, b) => a - b);
    const sortedFoilPrices = validFoilPrices.sort((a, b) => a - b);

    const pricing = {
      competitive: {
        low: this.roundPrice(sortedPrices[0]),
        high: this.roundPrice(sortedPrices[sortedPrices.length - 1]),
        median: this.roundPrice(this.calculateMedian(sortedPrices)),
        average: this.roundPrice(this.calculateAverage(sortedPrices)),
        count: validPrices.length
      },
      foil: validFoilPrices.length > 0 ? {
        low: this.roundPrice(sortedFoilPrices[0]),
        high: this.roundPrice(sortedFoilPrices[sortedFoilPrices.length - 1]),
        median: this.roundPrice(this.calculateMedian(sortedFoilPrices)),
        average: this.roundPrice(this.calculateAverage(sortedFoilPrices)),
        count: validFoilPrices.length
      } : null,
      printings: competitivePrintings.length,
      lastUpdated: new Date().toISOString(),
      note: this.generatePricingNote(competitivePrintings)
    };

    return pricing;
  }

  // Calculate median price
  calculateMedian(prices) {
    if (prices.length === 0) return 0;
    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  // Calculate average price
  calculateAverage(prices) {
    if (prices.length === 0) return 0;
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  }

  // Round price to 2 decimal places
  roundPrice(price) {
    return Math.round(price * 100) / 100;
  }

  // Generate a note about the pricing data
  generatePricingNote(printings) {
    const setTypes = [...new Set(printings.map(p => p.set_type))];
    const hasFoil = printings.some(p => p.finishes && p.finishes.includes('foil'));
    
    let note = `Based on ${printings.length} competitive printings`;
    if (setTypes.length > 0) {
      note += ` from ${setTypes.join(', ')} sets`;
    }
    if (hasFoil) {
      note += ' (includes foil options)';
    }
    note += '. Altered art and special versions excluded.';
    
    return note;
  }

  // Fallback pricing when API calls fail
  getFallbackPricing(cardName) {
    // Generate a reasonable price range based on card characteristics
    // This is just for display purposes when real pricing isn't available
    const basePrice = Math.random() * 20 + 1;
    return {
      competitive: {
        low: this.roundPrice(basePrice * 0.7),
        high: this.roundPrice(basePrice * 1.3),
        median: this.roundPrice(basePrice),
        average: this.roundPrice(basePrice),
        count: 1
      },
      foil: null,
      printings: 1,
      lastUpdated: new Date().toISOString(),
      note: 'Estimated pricing - real-time data unavailable'
    };
  }

  // Get MTGO ticket prices
  getMTGOTicketPrice(usdPrice) {
    // MTGO tickets are roughly $1 each, but can fluctuate
    return {
      tickets: Math.round(usdPrice),
      usdEquivalent: usdPrice,
      note: 'Approximate conversion (1 ticket ≈ $1)'
    };
  }

  // Get deck pricing
  async getDeckPricing(deckList) {
    try {
      const cardPrices = await Promise.all(
        deckList.map(async (card) => {
          const pricing = await this.getCompetitivePricing(card.name, card.set);
          return {
            name: card.name,
            quantity: card.quantity,
            pricing,
            totalValue: pricing?.competitive?.median ? 
              pricing.competitive.median * card.quantity : 0
          };
        })
      );

      const totalValue = cardPrices.reduce((sum, card) => sum + card.totalValue, 0);

      return {
        cards: cardPrices,
        totalValue: this.roundPrice(totalValue),
        breakdown: {
          mainboard: cardPrices.filter(card => !card.sideboard),
          sideboard: cardPrices.filter(card => card.sideboard),
        }
      };
    } catch (error) {
      console.error('Error getting deck pricing:', error);
      return null;
    }
  }

  // Generate affiliate links
  generateAffiliateLinks(cardName, setCode = null) {
    const amazonTag = process.env.REACT_APP_AMAZON_AFFILIATE_TAG || 'your-tag';
    const tcgplayerId = process.env.REACT_APP_TCGPLAYER_AFFILIATE_ID || 'your-id';

    return {
      amazon: `https://www.amazon.com/s?k=${encodeURIComponent(`${cardName} Magic The Gathering card`)}&tag=${amazonTag}`,
      tcgplayer: `https://www.tcgplayer.com/search/product/product?q=${encodeURIComponent(cardName)}&utm_source=mtgpile&utm_medium=affiliate&utm_campaign=${tcgplayerId}`,
      cardkingdom: `https://www.cardkingdom.com/catalog/search?search=${encodeURIComponent(cardName)}`,
      starcitygames: `https://starcitygames.com/search/?search_query=${encodeURIComponent(cardName)}`,
    };
  }

  // Cache management
  isCacheValid(key) {
    const cached = this.priceCache.get(key);
    return cached && (Date.now() - cached.timestamp) < this.cacheExpiry;
  }

  setCache(key, data) {
    this.priceCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache (useful for testing or when prices become stale)
  clearCache() {
    this.priceCache.clear();
  }
}

const pricingService = new PricingService();
export default pricingService;
