// Scryfall API Service with best practices
// Documentation: https://scryfall.com/docs/api

const SCRYFALL_BASE_URL = 'https://api.scryfall.com';

// Simple rate limiting to be respectful to Scryfall API
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests

const rateLimitedFetch = async (url) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${delay}ms before next request`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
  return fetch(url);
};

// Helper function to handle API responses with better error handling
const handleApiResponse = async (response) => {
  if (response.status === 404) {
    console.warn('Resource not found - invalid query parameters');
    return null; // Card not found
  }
  
  if (!response.ok) {
    if (response.status === 429) {
      console.warn('Rate limited by Scryfall API. Please wait before making more requests.');
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    if (response.status >= 500) {
      console.warn('Scryfall API server error - using fallback');
      throw new Error('API server error - please try again later');
    }
    console.warn(`API Error: ${response.status} - ${response.statusText}`);
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }
  
  return response.json();
};

// Helper function to build Scryfall queries
const buildScryfallQuery = (filters) => {
  const queryParts = [];
  
  // Name search - use fuzzy search for better results
  if (filters.name && filters.name.trim()) {
    queryParts.push(`name:"${filters.name.trim()}"`);
  }
  
  // Format filter - use Scryfall's format syntax
  if (filters.format) {
    const formatMap = {
      'standard': 'f:standard',
      'modern': 'f:modern', 
      'pioneer': 'f:pioneer',
      'legacy': 'f:legacy',
      'vintage': 'f:vintage',
      'commander': 'f:commander',
      'pauper': 'f:pauper',
      'limited': 'is:booster'
    };
    
    const formatQuery = formatMap[filters.format.toLowerCase()];
    if (formatQuery) {
      queryParts.push(formatQuery);
    }
  }
  
  // Set filter - use set code for exact matches
  if (filters.set) {
    queryParts.push(`set:${filters.set}`);
  }
  
  // Color filter - use Scryfall's color syntax
  if (filters.color) {
    queryParts.push(`c:${filters.color}`);
  }
  
  // Type filter - use type line search
  if (filters.type) {
    queryParts.push(`t:${filters.type}`);
  }
  
  // CMC filter - handle ranges properly
  if (filters.cmc) {
    if (filters.cmc === '6+') {
      queryParts.push('cmc>=6');
    } else {
      queryParts.push(`cmc:${filters.cmc}`);
    }
  }
  
  // Rarity filter
  if (filters.rarity) {
    queryParts.push(`r:${filters.rarity}`);
  }
  
  // Default query if no filters - show popular competitive cards
  if (queryParts.length === 0) {
    queryParts.push('is:commander -is:funny -is:acorn');
  }
  
  return queryParts.join(' ');
};

const getCards = async (filterObj) => {
  try {
    const query = buildScryfallQuery(filterObj);
    console.log('Scryfall query:', query);
    
    // Use proper URL encoding and add ordering for better results
    const url = `${SCRYFALL_BASE_URL}/cards/search?q=${encodeURIComponent(query)}&unique=cards`;
    
    const response = await rateLimitedFetch(url);
    const data = await handleApiResponse(response);
    
    if (!data) return [];
    
    // Filter out cards without images and add error handling
    const validCards = data.data?.filter(card => 
      card.image_uris && 
      (card.image_uris.normal || card.image_uris.small)
    ) || [];
    
    console.log(`Found ${validCards.length} valid cards out of ${data.data?.length || 0} total`);
    return validCards;
    
  } catch (err) {
    console.error('Error fetching cards:', err);
    throw new Error(`Failed to fetch cards: ${err.message}`);
  }
};

const getCardByName = async (name) => {
  try {
    const url = `${SCRYFALL_BASE_URL}/cards/named?fuzzy=${encodeURIComponent(name)}`;
    const response = await rateLimitedFetch(url);
    return await handleApiResponse(response);
  } catch (err) {
    console.error('Error fetching card:', err);
    throw new Error(`Failed to fetch card: ${err.message}`);
  }
};

const getSets = async () => {
  try {
    const url = `${SCRYFALL_BASE_URL}/sets`;
    const response = await rateLimitedFetch(url);
    const data = await handleApiResponse(response);
    
    if (!data) return [];
    
    // Filter for recent standard-legal sets and popular sets
    const recentSets = data.data
      ?.filter(set => set.set_type === 'core' || set.set_type === 'expansion')
      .sort((a, b) => new Date(b.released_at) - new Date(a.released_at))
      .slice(0, 30) // Get last 30 sets for better variety
      || [];
    
    return recentSets;
  } catch (err) {
    console.error('Error fetching sets:', err);
    throw new Error(`Failed to fetch sets: ${err.message}`);
  }
};

// Function to find competitive alternatives to a card
const findCompetitiveAlternatives = async (cardName, format = 'modern') => {
  try {
    // Get the original card first
    const originalCard = await getCardByName(cardName);
    if (!originalCard) {
      throw new Error('Original card not found');
    }
    
    // Build query to find similar cards with lower CMC or better stats
    const cardType = originalCard.type_line?.split(' ')[0] || 'Creature';
    const cmc = originalCard.cmc || 0;
    
    const query = `t:${cardType} cmc<=${cmc} -name:"${originalCard.name}" f:${format} -is:funny`;
    
    const url = `${SCRYFALL_BASE_URL}/cards/search?q=${encodeURIComponent(query)}&unique=cards`;
    
    const response = await rateLimitedFetch(url);
    const data = await handleApiResponse(response);
    
    if (!data) return [];
    
    // Filter for cards with images and limit results
    const alternatives = data.data
      ?.filter(card => card.image_uris && (card.image_uris.normal || card.image_uris.small))
      .slice(0, 8) || []; // Limit to 8 alternatives
    
    return alternatives;
  } catch (err) {
    console.error('Error finding alternatives:', err);
    throw new Error(`Failed to find alternatives: ${err.message}`);
  }
};

// Function to get latest set cards (for initial load)
const getLatestSetCards = async (count = 50) => {
  try {
    // Get the latest set first
    const setsResponse = await rateLimitedFetch(`${SCRYFALL_BASE_URL}/sets`);
    const setsData = await handleApiResponse(setsResponse);
    
    if (!setsData || !setsData.data) {
      console.warn('No sets data available, using popular cards');
      return getPopularCards(count);
    }
    
    // Find the latest standard-legal set with better validation
    const validSets = setsData.data.filter(set => 
      set.set_type === 'expansion' && 
      set.standard_legal && 
      set.code && 
      set.code.length >= 3 && // Valid set codes are usually 3+ characters
      !set.code.includes('ecl') // Exclude invalid codes
    );
    
    const latestSet = validSets
      .sort((a, b) => new Date(b.released_at) - new Date(a.released_at))[0];
    
    if (!latestSet) {
      // Fallback to any recent set with validation
      const recentValidSets = setsData.data.filter(set => 
        set.set_type === 'expansion' && 
        set.code && 
        set.code.length >= 3 &&
        !set.code.includes('ecl')
      );
      
      const recentSet = recentValidSets
        .sort((a, b) => new Date(b.released_at) - new Date(a.released_at))[0];
      
      if (!recentSet) {
        console.warn('No valid recent sets found, using popular cards');
        return getPopularCards(count);
      }
      
      console.log(`Using recent set: ${recentSet.name} (${recentSet.code})`);
      const url = `${SCRYFALL_BASE_URL}/cards/search?q=set:${recentSet.code} -is:funny -is:acorn&unique=cards`;
      const response = await rateLimitedFetch(url);
      
      if (!response.ok) {
        console.warn(`Failed to fetch cards from set ${recentSet.code}, using popular cards`);
        return getPopularCards(count);
      }
      
      const data = await handleApiResponse(response);
      
      return data?.data?.filter(card => 
        card.image_uris && (card.image_uris.normal || card.image_uris.small)
      ).slice(0, count) || [];
    }
    
    console.log(`Using latest standard set: ${latestSet.name} (${latestSet.code})`);
    // Get cards from the latest set
    const url = `${SCRYFALL_BASE_URL}/cards/search?q=set:${latestSet.code} -is:funny -is:acorn&unique=cards`;
    const response = await rateLimitedFetch(url);
    
    if (!response.ok) {
      console.warn(`Failed to fetch cards from set ${latestSet.code}, using popular cards`);
      return getPopularCards(count);
    }
    
    const data = await handleApiResponse(response);
    
    return data?.data?.filter(card => 
      card.image_uris && (card.image_uris.normal || card.image_uris.small)
    ).slice(0, count) || [];
  } catch (err) {
    console.error('Error fetching latest set cards:', err);
    // Fallback to popular cards
    return getPopularCards(count);
  }
};

// Function to get popular cards (fallback)
const getPopularCards = async (count = 50) => {
  try {
    // Try multiple popular card queries as fallbacks
    const queries = [
      'is:commander -is:funny -is:acorn',
      'is:commander',
      'format:commander',
      'is:creature -is:funny -is:acorn',
      'is:planeswalker -is:funny -is:acorn'
    ];
    
    for (const query of queries) {
      try {
        const url = `${SCRYFALL_BASE_URL}/cards/search?q=${query}&unique=cards`;
        const response = await rateLimitedFetch(url);
        
        if (!response.ok) {
          console.warn(`Query failed: ${query}`);
          continue;
        }
        
        const data = await handleApiResponse(response);
        
        if (data?.data && data.data.length > 0) {
          console.log(`Successfully fetched cards using query: ${query}`);
          return data.data.filter(card => 
            card.image_uris && (card.image_uris.normal || card.image_uris.small)
          ).slice(0, count);
        }
      } catch (queryErr) {
        console.warn(`Query error for ${query}:`, queryErr);
        continue;
      }
    }
    
    console.warn('All card queries failed, returning empty array');
    return [];
  } catch (err) {
    console.error('Error fetching popular cards:', err);
    return [];
  }
};

// Function to get random cards (useful for discovery)
const getRandomCards = async (count = 20) => {
  try {
    const url = `${SCRYFALL_BASE_URL}/cards/random?q=is:commander&size=${count}`;
    const response = await rateLimitedFetch(url);
    const data = await handleApiResponse(response);
    
    if (!data) return [];
    
    // Ensure we have an array of cards
    const cards = Array.isArray(data) ? data : [data];
    
    // Filter for cards with images
    return cards.filter(card => 
      card.image_uris && (card.image_uris.normal || card.image_uris.small)
    );
  } catch (err) {
    console.error('Error fetching random cards:', err);
    return [];
  }
};

const mtgService = {
  getCards,
  getCardByName,
  getSets,
  findCompetitiveAlternatives,
  getRandomCards,
  getLatestSetCards,
  getPopularCards
};

export default mtgService;