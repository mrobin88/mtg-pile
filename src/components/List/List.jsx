import React, { useState, useEffect } from 'react';
import styles from './List.module.css'
import pricingService from '../../utils/pricingService';

const List = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [cardPrices, setCardPrices] = useState(new Map());
  const [loadingPrices, setLoadingPrices] = useState(false);
  const cardsPerPage = 12;

  // Calculate pagination
  const totalPages = Math.ceil(props.cards.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentCards = props.cards.slice(startIndex, endIndex);

  // Load pricing for current page cards with cancellation and reuse
  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();
    const { signal } = abortController;
    
    const loadPrices = async () => {
      if (currentCards.length === 0) return;
      setLoadingPrices(true);
      // Collect fetched results locally, then merge into state once
      const fetched = [];
      
      try {
        const pricePromises = currentCards.map(async (card) => {
          const key = card.id || card.name;
          const pricing = await pricingService.getCompetitivePricing(card.name, card.set, { signal });
          if (pricing) {
            fetched.push([key, pricing]);
          }
        });
        await Promise.allSettled(pricePromises);
        if (isActive) {
          setCardPrices(prev => {
            const map = new Map(prev);
            // Only set keys that are visible on this page or missing
            for (const [key, pricing] of fetched) {
              if (!map.has(key)) {
                map.set(key, pricing);
              }
            }
            return map;
          });
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error loading prices:', error);
        }
      } finally {
        if (isActive) setLoadingPrices(false);
      }
    };

    loadPrices();
    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [currentCards]);

  const getCardImage = (card) => {
    // Scryfall provides multiple image sizes
    if (card.image_uris?.normal) {
      return card.image_uris.normal;
    } else if (card.image_uris?.small) {
      return card.image_uris.small;
    } else if (card.image_uris?.png) {
      return card.image_uris.png;
    }
    // Fallback to card back if no image available
    return '/static/media/cardBack.74d4121097f2e0cff420.jpg';
  };

  const handleCardClick = (card) => {
    // Pass the card object instead of just the image src
    props.cardSelect(card);
  };

  const handleBuyClick = (e, card) => {
    e.stopPropagation(); // Prevent card selection
    // Generate TCGPlayer affiliate link
    const affiliateId = process.env.REACT_APP_TCGPLAYER_AFFILIATE_ID || 'your-id';
    const searchQuery = encodeURIComponent(card.name);
    const affiliateLink = `https://www.tcgplayer.com/search/product/product?q=${searchQuery}&utm_source=mtgpile&utm_medium=affiliate&utm_campaign=${affiliateId}`;
    window.open(affiliateLink, '_blank');
  };

  const handleViewClick = (e, card) => {
    e.stopPropagation(); // Prevent card selection
    handleCardClick(card);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Format price display
  const formatPriceDisplay = (card) => {
    const pricing = cardPrices.get(card.id || card.name);
    
    if (!pricing) {
      return loadingPrices ? '...' : 'N/A';
    }

    const { competitive, foil } = pricing;
    
    if (!competitive) return 'N/A';

    // Show price range for competitive versions
    let display = `$${competitive.low} - $${competitive.high}`;
    
    // Add foil price if available and significantly different
    if (foil && foil.low > competitive.high * 1.5) {
      display += ` | Foil: $${foil.low}`;
    }
    
    return display;
  };

  // Get price note for tooltip
  const getPriceNote = (card) => {
    const pricing = cardPrices.get(card.id || card.name);
    return pricing?.note || '';
  };

  const listedCard = currentCards.map(function(card, index){
    const cardImage = getCardImage(card);
    const globalIndex = startIndex + index;
    const priceDisplay = formatPriceDisplay(card);
    const priceNote = getPriceNote(card);
    
    return(
      <div key={card.id || globalIndex} className={styles.cardItem}>
        {/* Card Price Badge */}
        <div 
          className={styles.cardPrice}
          title={priceNote}
        >
          {priceDisplay}
        </div>

        {/* Card Image */}
        <img 
          src={cardImage} 
          alt={card.name || 'MTG Card'} 
          onClick={() => handleCardClick(card)}
          className={styles.cardImage}
          onError={(e) => {
            // Fallback to card back if image fails to load
            e.target.src = '/static/media/cardBack.74d4121097f2e0cff420.jpg';
          }}
        />

        {/* Card Info */}
        <div className={styles.cardInfo}>
          <h4>{card.name || 'Unknown Card'}</h4>
          <p className={styles.cardType}>{card.type_line || 'Unknown Type'}</p>
          <p className={styles.cardMana}>{card.mana_cost || ''}</p>
          {card.cmc !== undefined && (
            <span className={styles.cardCmc}>CMC: {card.cmc}</span>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button 
            className={`${styles.quickActionBtn} ${styles.viewBtn}`}
            onClick={(e) => handleViewClick(e, card)}
          >
            👁️ View
          </button>
          <button 
            className={`${styles.quickActionBtn} ${styles.buyBtn}`}
            onClick={(e) => handleBuyClick(e, card)}
          >
            💰 Buy
          </button>
        </div>
      </div>
    );
  });

  return(
    <div className={styles.listContainer}>
      {/* Results Count */}
      <div className={styles.resultsCount}>
        Showing {startIndex + 1}-{Math.min(endIndex, props.cards.length)} of {props.cards.length} cards
        {loadingPrices && <span className={styles.priceLoading}> • Loading prices...</span>}
      </div>

      {/* Cards Grid */}
      <div className={styles.cardGrid}>
        {listedCard}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.paginationButton}
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))}

          <button 
            className={styles.paginationButton}
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default List;