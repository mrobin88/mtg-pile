import React, { useState, useEffect } from 'react';
import styles from './Card.module.css'
import { toast } from 'react-toastify';
import pricingService from '../../utils/pricingService';

const Card = (props) => {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [cardPricing, setCardPricing] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(false);

  // Load pricing when card changes
  useEffect(() => {
    const currentCard = props.details[0];
    if (currentCard) {
      loadCardPricing(currentCard);
    }
  }, [props.details]);

  const loadCardPricing = async (card) => {
    setLoadingPricing(true);
    try {
      const pricing = await pricingService.getCompetitivePricing(card.name, card.set);
      setCardPricing(pricing);
    } catch (error) {
      console.error('Error loading card pricing:', error);
    } finally {
      setLoadingPricing(false);
    }
  };

  const addCardToPile = () => {
    if(props.user && !props.usersPile.includes(props.details[0])){
      props.addCardToPile()
      toast.success("Card added to pile!");
    }else if (!props.user){
      toast.error("Please login to make piles");
    }else{
      toast.info("This card was already added");
    }
  }

  const findCompetitiveAlternatives = async () => {
    if (!props.details[0]) return;

    setLoadingAlternatives(true);
    try {
      const card = props.details[0];
      const cardType = card.type_line?.split(' ')[0] || 'Sorcery';
      const currentCmc = card.cmc || 0;

      const query = `t:${cardType} (cmc<${currentCmc} OR (cmc=${currentCmc} AND (is:commander OR is:modern))) -name:"${card.name}" -is:funny -is:acorn`;

      const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&unique=cards`);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const competitiveCards = data.data
          .filter(alt => alt.image_uris && (alt.image_uris.normal || alt.image_uris.small))
          .sort((a, b) => {
            if (a.cmc !== b.cmc) return a.cmc - b.cmc;
            return 0;
          })
          .slice(0, 6);

        setAlternatives(competitiveCards);
        setShowAlternatives(!showAlternatives);
      } else {
        toast.info("No competitive alternatives found for this card type");
      }
    } catch (error) {
      console.error('Error finding alternatives:', error);
      toast.error("Error finding alternatives");
    } finally {
      setLoadingAlternatives(false);
    }
  }

  const getTcgPlayerLink = (cardName) => {
    const searchQuery = encodeURIComponent(cardName);
    return `https://www.tcgplayer.com/search/product/product?q=${searchQuery}`;
  }

  // Format pricing display
  const formatPricingDisplay = () => {
    if (!cardPricing) return null;

    const { competitive, foil, note } = cardPricing;
    
    if (!competitive) return null;

    return (
      <div className={styles.pricingInfo}>
        <h4>💰 Competitive Pricing</h4>
        <div className={styles.priceRanges}>
          <div className={styles.priceRange}>
            <span className={styles.priceLabel}>Range:</span>
            <span className={styles.priceValue}>${competitive.low} - ${competitive.high}</span>
          </div>
          <div className={styles.priceRange}>
            <span className={styles.priceLabel}>Median:</span>
            <span className={styles.priceValue}>${competitive.median}</span>
          </div>
          {foil && foil.low > competitive.high * 1.5 && (
            <div className={styles.priceRange}>
              <span className={styles.priceLabel}>Foil:</span>
              <span className={styles.priceValue}>${foil.low} - ${foil.high}</span>
            </div>
          )}
        </div>
        <div className={styles.pricingNote}>
          <small>{note}</small>
        </div>
      </div>
    );
  };

  if (!props.details[0]) {
    return (
      <div className={styles.noCard}>
        <img alt='mtg card back' src={props.display} />
        <p>Select a card to view details</p>
      </div>
    );
  }

  const card = props.details[0];

  return (
    <div className={styles.cardContainer}>
      {/* Main Card Display */}
      <div className={styles.cardDisplay}>
        <img
          alt={`${card.name} - MTG Card`}
          src={card.image_uris?.normal || card.image_uris?.small || props.display}
          className={styles.cardImage}
        />

        {/* Card Actions */}
        <div className={styles.cardActions}>
          <button onClick={addCardToPile} className={styles.actionButton}>
            📦 Add to Pile
          </button>

          <button
            onClick={findCompetitiveAlternatives}
            className={styles.actionButton}
            disabled={loadingAlternatives}
          >
            {loadingAlternatives ? '🔍 Searching...' : '⚡ Find Alternatives'}
          </button>
        </div>

        {/* Pricing Information */}
        {loadingPricing ? (
          <div className={styles.pricingInfo}>
            <h4>💰 Pricing</h4>
            <p>Loading competitive pricing...</p>
          </div>
        ) : (
          formatPricingDisplay()
        )}

        {/* Purchase Link */}
        <div className={styles.purchaseSection}>
          <a
            href={getTcgPlayerLink(card.name)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.purchaseButton}
          >
            🛒 Buy on TCG Player
          </a>
        </div>
      </div>

      {/* Competitive Alternatives */}
      {showAlternatives && alternatives.length > 0 && (
        <div className={styles.alternativesSection}>
          <h4>⚡ Competitive Alternatives</h4>
          <div className={styles.alternativesGrid}>
            {alternatives.map((alt, index) => (
              <div key={index} className={styles.alternativeCard}>
                <img
                  src={alt.image_uris?.small || alt.image_uris?.normal}
                  alt={alt.name}
                  className={styles.alternativeImage}
                />
                <div className={styles.alternativeInfo}>
                  <h5>{alt.name}</h5>
                  <p>CMC: {alt.cmc} | {alt.type_line}</p>
                  <a
                    href={getTcgPlayerLink(alt.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.smallLink}
                  >
                    View on TCG Player
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Alternatives Message */}
      {showAlternatives && alternatives.length === 0 && (
        <div className={styles.noAlternatives}>
          <p>No competitive alternatives found. This card may already be optimal for its type and CMC.</p>
        </div>
      )}
    </div>
  );
};

export default Card;
