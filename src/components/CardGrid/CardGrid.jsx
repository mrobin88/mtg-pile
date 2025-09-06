import React, { useState } from 'react';
import styles from './CardGrid.module.css';
import { toast } from 'react-toastify';
import ManaSymbol from '../ManaSymbol/ManaSymbol';

const CardGrid = ({ cards = [], onCardClick, loading = false }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleCardHover = (cardId) => {
    setHoveredCard(cardId);
  };

  const handleCardLeave = () => {
    setHoveredCard(null);
  };

  const handleCardClick = (card) => {
    if (onCardClick) {
      onCardClick(card);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading cards...</p>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🃏</div>
        <h3>No cards found</h3>
        <p>Try adjusting your search or browse the latest set</p>
      </div>
    );
  }

  return (
    <div className={styles.cardGrid}>
      {cards.map((card, index) => (
        <div
          key={card.id || index}
          className={`${styles.cardContainer} ${hoveredCard === card.id ? styles.hovered : ''}`}
          onMouseEnter={() => handleCardHover(card.id)}
          onMouseLeave={handleCardLeave}
          onClick={() => handleCardClick(card)}
        >
          <div className={styles.cardWrapper}>
            <img
              src={card.image_uris?.normal || card.image_uris?.small}
              alt={card.name}
              className={styles.cardImage}
              onError={(e) => {
                e.target.src = '/static/media/cardBack.74d4121097f2e0cff420.jpg';
              }}
            />
            
            {/* Card Info Overlay */}
            <div className={styles.cardInfo}>
              <h4 className={styles.cardName}>{card.name}</h4>
              <p className={styles.cardType}>{card.type_line}</p>
              <div className={styles.cardMana}>
                <ManaSymbol symbol={card.mana_cost} size="small" />
                <span className={styles.cmc}>CMC: {card.cmc}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.cardActions}>
              <button 
                className={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info(`Added ${card.name} to collection`);
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGrid;
