// Draft Evaluation Service for MTG
// Implements professional drafting heuristics and card evaluation logic

class DraftEvaluationService {
  constructor() {
    this.cache = new Map();
    this.formatWeights = this.initializeFormatWeights();
    this.cardTypeWeights = this.initializeCardTypeWeights();
  }

  // Initialize format-specific evaluation weights
  initializeFormatWeights() {
    return {
      limited: {
        curve: 0.25,
        synergy: 0.20,
        efficiency: 0.20,
        removal: 0.15,
        evasion: 0.10,
        flexibility: 0.10
      },
      standard: {
        power: 0.30,
        meta: 0.25,
        efficiency: 0.20,
        rotation: 0.15,
        synergy: 0.10
      },
      modern: {
        power: 0.35,
        combo: 0.25,
        efficiency: 0.20,
        meta: 0.15,
        flexibility: 0.05
      },
      commander: {
        synergy: 0.30,
        cardAdvantage: 0.25,
        flexibility: 0.20,
        power: 0.15,
        mana: 0.10
      }
    };
  }

  // Initialize card type evaluation weights
  initializeCardTypeWeights() {
    return {
      creature: {
        power: 0.30,
        toughness: 0.25,
        abilities: 0.25,
        cmc: 0.20
      },
      instant: {
        efficiency: 0.35,
        flexibility: 0.30,
        cmc: 0.20,
        targets: 0.15
      },
      sorcery: {
        power: 0.40,
        cmc: 0.30,
        targets: 0.20,
        flexibility: 0.10
      },
      enchantment: {
        effect: 0.40,
        cmc: 0.25,
        durability: 0.20,
        flexibility: 0.15
      },
      artifact: {
        effect: 0.35,
        cmc: 0.25,
        durability: 0.25,
        flexibility: 0.15
      }
    };
  }

  // Main evaluation function
  async evaluateCard(card, format = 'limited', context = {}) {
    const cacheKey = `${card.id}-${format}-${JSON.stringify(context)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const evaluation = {
      card: card,
      format: format,
      overallScore: 0,
      breadScore: this.calculateBREADScore(card, format),
      quadrantScore: this.calculateQuadrantScore(card, format),
      formatScore: this.calculateFormatScore(card, format, context),
      recommendations: this.generateRecommendations(card, format, context),
      timestamp: new Date().toISOString()
    };

    // Calculate overall score
    evaluation.overallScore = this.calculateOverallScore(evaluation);
    
    this.cache.set(cacheKey, evaluation);
    return evaluation;
  }

  // BREAD method evaluation
  calculateBREADScore(card, format) {
    let score = 0;
    const weights = this.formatWeights[format] || this.formatWeights.limited;

    // Bomb evaluation (game-winning cards)
    if (this.isBomb(card, format)) {
      score += 0.4 * weights.power;
    }

    // Removal evaluation
    if (this.isRemoval(card)) {
      score += 0.3 * weights.removal;
    }

    // Evasion evaluation
    if (this.hasEvasion(card)) {
      score += 0.2 * weights.evasion;
    }

    // Aggro evaluation (efficient creatures)
    if (this.isEfficientAggro(card)) {
      score += 0.15 * weights.efficiency;
    }

    // Flexibility bonus
    if (this.isFlexible(card)) {
      score += 0.1 * weights.flexibility;
    }

    return Math.min(score, 1.0);
  }

  // Quadrant theory evaluation
  calculateQuadrantScore(card, format) {
    let score = 0;
    const weights = this.formatWeights[format] || this.formatWeights.limited;

    // Opening (early game)
    if (this.isGoodOpening(card)) {
      score += 0.25 * weights.curve;
    }

    // Developing (mid-game)
    if (this.isGoodDeveloping(card)) {
      score += 0.25 * weights.efficiency;
    }

    // Parity (when behind)
    if (this.isGoodParity(card)) {
      score += 0.25 * weights.flexibility;
    }

    // Winning (when ahead)
    if (this.isGoodWinning(card)) {
      score += 0.25 * weights.power;
    }

    return Math.min(score, 1.0);
  }

  // Format-specific evaluation
  calculateFormatScore(card, format, context) {
    const weights = this.formatWeights[format] || this.formatWeights.limited;
    let score = 0;

    switch (format) {
      case 'limited':
        score = this.evaluateLimitedCard(card, context, weights);
        break;
      case 'standard':
        score = this.evaluateStandardCard(card, context, weights);
        break;
      case 'modern':
        score = this.evaluateModernCard(card, context, weights);
        break;
      case 'commander':
        score = this.evaluateCommanderCard(card, context, weights);
        break;
      default:
        score = this.evaluateLimitedCard(card, context, weights);
    }

    return Math.min(score, 1.0);
  }

  // Limited format evaluation
  evaluateLimitedCard(card, context, weights) {
    let score = 0;

    // Curve considerations
    if (card.cmc <= 3) {
      score += weights.curve * 0.3;
    } else if (card.cmc <= 5) {
      score += weights.curve * 0.2;
    } else {
      score += weights.curve * 0.1;
    }

    // Synergy considerations
    if (context.archetype && this.hasSynergy(card, context.archetype)) {
      score += weights.synergy * 0.4;
    }

    // Mana efficiency
    if (this.isManaEfficient(card)) {
      score += weights.efficiency * 0.3;
    }

    return score;
  }

  // Standard format evaluation
  evaluateStandardCard(card, context, weights) {
    let score = 0;

    // Power level
    if (this.isHighPower(card)) {
      score += weights.power * 0.4;
    }

    // Meta relevance
    if (context.meta && this.isMetaRelevant(card, context.meta)) {
      score += weights.meta * 0.3;
    }

    // Rotation safety
    if (this.isRotationSafe(card)) {
      score += weights.rotation * 0.2;
    }

    return score;
  }

  // Modern format evaluation
  evaluateModernCard(card, context, weights) {
    let score = 0;

    // Raw power
    if (this.isHighPower(card)) {
      score += weights.power * 0.4;
    }

    // Combo potential
    if (this.hasComboPotential(card)) {
      score += weights.combo * 0.3;
    }

    // Meta relevance
    if (context.meta && this.isMetaRelevant(card, context.meta)) {
      score += weights.meta * 0.2;
    }

    return score;
  }

  // Commander format evaluation
  evaluateCommanderCard(card, context, weights) {
    let score = 0;

    // Synergy with commander
    if (context.commander && this.hasCommanderSynergy(card, context.commander)) {
      score += weights.synergy * 0.4;
    }

    // Card advantage
    if (this.providesCardAdvantage(card)) {
      score += weights.cardAdvantage * 0.3;
    }

    // Flexibility
    if (this.isFlexible(card)) {
      score += weights.flexibility * 0.2;
    }

    return score;
  }

  // Helper methods for card evaluation
  isBomb(card, format) {
    if (format === 'limited') {
      return card.rarity === 'Mythic' || 
             (card.rarity === 'Rare' && card.cmc <= 6) ||
             this.hasGameWinningEffect(card);
    }
    return this.hasGameWinningEffect(card);
  }

  isRemoval(card) {
    // Use more specific removal patterns for better accuracy
    const removalPatterns = [
      'destroy target',
      'exile target',
      'damage to target',
      'return target to',
      'bounce target',
      'counter target',
      'sacrifice target',
      'tap target',
      'deal damage',
      'destroy all',
      'exile all',
      'wrath',
      'sweep'
    ];
    
    const text = card.text?.toLowerCase() || '';
    return removalPatterns.some(pattern => text.includes(pattern));
  }

  hasEvasion(card) {
    // Use keyword abilities for more accurate evasion detection
    const evasionKeywords = [
      'flying',
      'unblockable', 
      'menace',
      'shadow',
      'intimidate',
      'fear',
      'can\'t be blocked',
      'skulk',
      'landwalk'
    ];
    const text = card.text?.toLowerCase() || '';
    return evasionKeywords.some(keyword => text.includes(keyword));
  }

  isEfficientAggro(card) {
    if (card.type_line?.includes('Creature')) {
      const power = parseInt(card.power) || 0;
      const toughness = parseInt(card.toughness) || 0;
      return power >= card.cmc && toughness >= card.cmc - 1;
    }
    return false;
  }

  isFlexible(card) {
    const text = card.text?.toLowerCase() || '';
    return text.includes('choose') || text.includes('modal') || text.includes('kicker');
  }

  isGoodOpening(card) {
    return card.cmc <= 2 && this.isEfficientAggro(card);
  }

  isGoodDeveloping(card) {
    return card.cmc >= 3 && card.cmc <= 5 && this.isEfficientAggro(card);
  }

  isGoodParity(card) {
    return this.isRemoval(card) || this.providesCardAdvantage(card);
  }

  isGoodWinning(card) {
    return this.hasEvasion(card) || this.isBomb(card);
  }

  hasSynergy(card, archetype) {
    // Implement archetype-specific synergy checks
    const archetypeKeywords = {
      'aggro': ['haste', 'first strike', 'double strike'],
      'control': ['counter', 'draw', 'removal'],
      'midrange': ['value', 'card advantage', 'efficient'],
      'combo': ['tutor', 'search', 'combo piece']
    };
    
    const keywords = archetypeKeywords[archetype] || [];
    const text = card.text?.toLowerCase() || '';
    return keywords.some(keyword => text.includes(keyword));
  }

  isManaEfficient(card) {
    if (card.type_line?.includes('Creature')) {
      const power = parseInt(card.power) || 0;
      return power >= card.cmc;
    }
    return true;
  }

  isHighPower(card) {
    // Implement power level evaluation based on format
    return card.cmc <= 3 && this.isEfficientAggro(card);
  }

  isMetaRelevant(card, meta) {
    // Check if card fits current meta
    return true; // Simplified for now
  }

  isRotationSafe(card) {
    // Check if card will survive rotation
    return true; // Simplified for now
  }

  hasComboPotential(card) {
    const comboKeywords = ['tutor', 'search', 'combo', 'infinite'];
    const text = card.text?.toLowerCase() || '';
    return comboKeywords.some(keyword => text.includes(keyword));
  }

  hasCommanderSynergy(card, commander) {
    // Check synergy with specific commander
    return true; // Simplified for now
  }

  providesCardAdvantage(card) {
    const advantageKeywords = ['draw', 'search', 'tutor', 'scry'];
    const text = card.text?.toLowerCase() || '';
    return advantageKeywords.some(keyword => text.includes(keyword));
  }

  hasGameWinningEffect(card) {
    const gameWinningKeywords = ['win the game', 'lose the game', 'emblem', 'ultimate'];
    const text = card.text?.toLowerCase() || '';
    return gameWinningKeywords.some(keyword => text.includes(keyword));
  }

  // Calculate overall score
  calculateOverallScore(evaluation) {
    const weights = {
      bread: 0.35,
      quadrant: 0.35,
      format: 0.30
    };

    return (
      evaluation.breadScore * weights.bread +
      evaluation.quadrantScore * weights.quadrant +
      evaluation.formatScore * weights.format
    );
  }

  // Generate recommendations
  generateRecommendations(card, format, context) {
    const recommendations = [];

    if (evaluation.breadScore < 0.5) {
      recommendations.push('Consider passing - low BREAD score');
    }

    if (evaluation.quadrantScore < 0.5) {
      recommendations.push('Limited quadrant coverage - situational card');
    }

    if (evaluation.formatScore < 0.5) {
      recommendations.push(`May not be optimal for ${format} format`);
    }

    if (card.cmc > 6 && format === 'limited') {
      recommendations.push('High CMC - ensure good mana curve');
    }

    if (!this.isRemoval(card) && format === 'limited') {
      recommendations.push('Consider prioritizing removal spells');
    }

    return recommendations;
  }

  // Compare two cards for draft pick
  async compareCards(card1, card2, format = 'limited', context = {}) {
    const evaluation1 = await this.evaluateCard(card1, format, context);
    const evaluation2 = await this.evaluateCard(card2, format, context);

    const comparison = {
      card1: { card: card1, evaluation: evaluation1 },
      card2: { card: card2, evaluation: evaluation2 },
      winner: evaluation1.overallScore > evaluation2.overallScore ? card1 : card2,
      scoreDifference: Math.abs(evaluation1.overallScore - evaluation2.overallScore),
      reasoning: this.generateComparisonReasoning(evaluation1, evaluation2, format)
    };

    return comparison;
  }

  // Generate reasoning for comparison
  generateComparisonReasoning(evaluation1, evaluation2, format) {
    const reasons = [];

    if (evaluation1.breadScore > evaluation2.breadScore) {
      reasons.push(`${evaluation1.card.name} has better BREAD evaluation`);
    } else if (evaluation2.breadScore > evaluation1.breadScore) {
      reasons.push(`${evaluation2.card.name} has better BREAD evaluation`);
    }

    if (evaluation1.quadrantScore > evaluation2.quadrantScore) {
      reasons.push(`${evaluation1.card.name} covers more game states`);
    } else if (evaluation2.quadrantScore > evaluation1.quadrantScore) {
      reasons.push(`${evaluation2.card.name} covers more game states`);
    }

    if (evaluation1.formatScore > evaluation2.formatScore) {
      reasons.push(`${evaluation1.card.name} is better suited for ${format}`);
    } else if (evaluation2.formatScore > evaluation1.formatScore) {
      reasons.push(`${evaluation2.card.name} is better suited for ${format}`);
    }

    return reasons;
  }

  // Get draft pick recommendations for a pack
  async getDraftPickRecommendations(pack, format = 'limited', context = {}) {
    const evaluations = await Promise.all(
      pack.map(card => this.evaluateCard(card, format, context))
    );

    const sortedEvaluations = evaluations
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((evaluation, index) => ({
        ...evaluation,
        pickOrder: index + 1,
        pickReason: this.getPickReason(evaluation, index, format)
      }));

    return {
      pack: pack,
      format: format,
      recommendations: sortedEvaluations,
      topPick: sortedEvaluations[0],
      context: context
    };
  }

  // Get reason for pick order
  getPickReason(evaluation, pickOrder, format) {
    if (pickOrder === 1) {
      return 'First pick - highest overall value';
    } else if (pickOrder <= 3) {
      return 'Early pick - strong card for this format';
    } else if (pickOrder <= 7) {
      return 'Mid pick - solid role player';
    } else {
      return 'Late pick - situational or filler card';
    }
  }

  // Advanced Scryfall search using oracle text operators
  async findCardsWithText(textPattern, format = 'limited', context = {}) {
    try {
      // Use o: operator for oracle text search
      const query = `o:"${textPattern}" f:${format} -is:funny -is:acorn`;
      const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&unique=cards`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data || !data.data) return [];
      
      // Filter for cards with images and limit results
      return data.data
        .filter(card => card.image_uris && (card.image_uris.normal || card.image_uris.small))
        .slice(0, 10);
    } catch (error) {
      console.error('Error searching for cards with text:', error);
      return [];
    }
  }

  // Find removal spells using specific patterns
  async findRemovalSpells(format = 'limited', cmc = null) {
    const removalQueries = [
      'destroy target creature',
      'exile target creature', 
      'damage to target creature',
      'return target creature to owner\'s hand',
      'counter target spell'
    ];
    
    let allRemoval = [];
    
    for (const query of removalQueries) {
      const cards = await this.findCardsWithText(query, format);
      allRemoval = [...allRemoval, ...cards];
    }
    
    // Remove duplicates and filter by CMC if specified
    const uniqueRemoval = allRemoval.filter((card, index, self) => 
      index === self.findIndex(c => c.id === card.id)
    );
    
    if (cmc !== null) {
      return uniqueRemoval.filter(card => card.cmc <= cmc);
    }
    
    return uniqueRemoval;
  }

  // Find cards with specific keyword abilities
  async findCardsWithKeyword(keyword, format = 'limited') {
    try {
      // Use kw: operator for keyword search
      const query = `kw:${keyword} f:${format} -is:funny -is:acorn`;
      const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&unique=cards`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data || !data.data) return [];
      
      return data.data
        .filter(card => card.image_uris && (card.image_uris.normal || card.image_uris.small))
        .slice(0, 10);
    } catch (error) {
      console.error('Error searching for cards with keyword:', error);
      return [];
    }
  }

  // Enhanced card comparison using Scryfall search
  async compareCardsWithAlternatives(card, format = 'limited', context = {}) {
    const evaluation = await this.evaluateCard(card, format, context);
    
    // Find alternatives based on card type and function
    let alternatives = [];
    
    if (this.isRemoval(card)) {
      alternatives = await this.findRemovalSpells(format, card.cmc);
    } else if (this.hasEvasion(card)) {
      alternatives = await this.findCardsWithKeyword('flying', format);
    } else if (card.type_line?.includes('Creature')) {
      // Find similar creatures
      const query = `t:creature cmc:${card.cmc} f:${format} -name:"${card.name}"`;
      alternatives = await this.findCardsWithText(query, format);
    }
    
    return {
      originalCard: card,
      evaluation: evaluation,
      alternatives: alternatives.slice(0, 5), // Top 5 alternatives
      recommendations: this.generateAlternativeRecommendations(evaluation, alternatives, format)
    };
  }

  // Generate recommendations based on alternatives
  generateAlternativeRecommendations(evaluation, alternatives, format) {
    const recommendations = [];
    
    if (alternatives.length === 0) {
      recommendations.push('No direct alternatives found for this card type');
      return recommendations;
    }
    
    // Check if alternatives are better
    const bestAlternative = alternatives[0];
    if (bestAlternative.cmc < evaluation.card.cmc) {
      recommendations.push(`Consider ${bestAlternative.name} - lower CMC alternative`);
    }
    
    if (alternatives.some(alt => alt.rarity === 'Common' && evaluation.card.rarity !== 'Common')) {
      recommendations.push('Common alternatives available - good for budget decks');
    }
    
    if (alternatives.some(alt => alt.cmc <= 3 && evaluation.card.cmc > 3)) {
      recommendations.push('Lower CMC alternatives available - better for curve');
    }
    
    return recommendations;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default new DraftEvaluationService();
