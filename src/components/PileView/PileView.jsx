import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './PileView.module.css';
import pileService from '../../utils/pileService';
// import pricingService from '../../utils/pricingService'; // TODO: Add pricing feature
import ManaSymbol from '../ManaSymbol/ManaSymbol';

const PileView = ({ user, currentPile, onPileUpdate }) => {
  const [piles, setPiles] = useState([]);
  const [selectedPile, setSelectedPile] = useState(null);
  const [pileName, setPileName] = useState('');
  const [pileNotes, setPileNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadPiles();
    }
  }, [user]);

  const loadPiles = async () => {
    setLoading(true);
    try {
      const userPiles = await pileService.getAll();
      setPiles(userPiles);
      console.log('✅ Loaded piles:', userPiles);
    } catch (error) {
      console.error('Error loading piles:', error);
      toast.error('Failed to load piles');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePile = async () => {
    if (!pileName.trim()) {
      toast.error('Please enter a pile name');
      return;
    }

    if (!currentPile || currentPile.length === 0) {
      toast.error('Your pile is empty! Add some cards first.');
      return;
    }

    setLoading(true);
    try {
      const pileData = {
        name: pileName,
        notes: pileNotes,
        cards: currentPile
      };

      await pileService.create(pileData);
      toast.success(`Pile "${pileName}" saved!`);
      setPileName('');
      setPileNotes('');
      setShowSaveDialog(false);
      loadPiles(); // Refresh pile list
    } catch (error) {
      console.error('Error saving pile:', error);
      toast.error('Failed to save pile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePile = async (pileId, pileName) => {
    if (!window.confirm(`Delete pile "${pileName}"? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await pileService.deletePile(pileId);
      toast.success(`Pile "${pileName}" deleted`);
      loadPiles(); // Refresh pile list
      if (selectedPile && selectedPile._id === pileId) {
        setSelectedPile(null);
      }
    } catch (error) {
      console.error('Error deleting pile:', error);
      toast.error('Failed to delete pile');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPile = (pile) => {
    setSelectedPile(pile);
    console.log('📋 Loaded pile:', pile);
  };

  const calculatePileStats = (cards) => {
    if (!cards || cards.length === 0) return null;

    const avgCMC = (cards.reduce((sum, card) => sum + (card.cmc || 0), 0) / cards.length).toFixed(2);
    const colorCounts = {};
    const typeCounts = {};

    cards.forEach(card => {
      // Count colors
      if (card.colors) {
        card.colors.forEach(color => {
          colorCounts[color] = (colorCounts[color] || 0) + 1;
        });
      }

      // Count types
      if (card.type) {
        const mainType = card.type.split('—')[0].trim().split(' ').pop();
        typeCounts[mainType] = (typeCounts[mainType] || 0) + 1;
      }
    });

    return {
      totalCards: cards.length,
      avgCMC,
      colorCounts,
      typeCounts
    };
  };

  if (!user) {
    return (
      <div className={styles.pileView}>
        <div className={styles.loginPrompt}>
          <h2>🔒 Login Required</h2>
          <p>Please login to save and manage your card piles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pileView}>
      <div className={styles.header}>
        <h1>📚 My Card Piles</h1>
        {currentPile && currentPile.length > 0 && (
          <button 
            className={styles.saveButton}
            onClick={() => setShowSaveDialog(true)}
          >
            💾 Save Current Pile ({currentPile.length} cards)
          </button>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className={styles.saveDialog}>
          <div className={styles.dialogContent}>
            <h2>Save Pile</h2>
            <input
              type="text"
              className={styles.input}
              placeholder="Pile Name (e.g., 'Blue Control', 'Red Aggro')"
              value={pileName}
              onChange={(e) => setPileName(e.target.value)}
            />
            <textarea
              className={styles.textarea}
              placeholder="Notes (optional - e.g., 'Standard deck for FNM')"
              value={pileNotes}
              onChange={(e) => setPileNotes(e.target.value)}
              rows={3}
            />
            <div className={styles.dialogActions}>
              <button 
                className={styles.confirmButton}
                onClick={handleSavePile}
                disabled={loading}
              >
                {loading ? 'Saving...' : '💾 Save Pile'}
              </button>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Pile Preview */}
      {currentPile && currentPile.length > 0 && (
        <div className={styles.currentPile}>
          <h2>🎴 Current Pile ({currentPile.length} cards)</h2>
          <div className={styles.cardList}>
            {currentPile.map((card, index) => (
              <div key={index} className={styles.cardItem}>
                <span className={styles.cardName}>{card.name}</span>
                <ManaSymbol manaCost={card.manaCost} size="small" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Piles List */}
      <div className={styles.pilesSection}>
        <h2>💾 Saved Piles</h2>
        {loading && <p className={styles.loading}>Loading piles...</p>}
        
        {!loading && piles.length === 0 && (
          <div className={styles.emptyState}>
            <p>No saved piles yet.</p>
            <p>Add cards to your pile and save them!</p>
          </div>
        )}

        {!loading && piles.length > 0 && (
          <div className={styles.pilesList}>
            {piles.map((pile) => (
              <div key={pile._id} className={styles.pileCard}>
                <div className={styles.pileHeader}>
                  <h3>{pile.name}</h3>
                  <span className={styles.cardCount}>{pile.cards.length} cards</span>
                </div>
                
                {pile.notes && (
                  <p className={styles.pileNotes}>{pile.notes}</p>
                )}

                <div className={styles.pileStats}>
                  {(() => {
                    const stats = calculatePileStats(pile.cards);
                    return stats ? (
                      <>
                        <span>Avg CMC: {stats.avgCMC}</span>
                        <span>Types: {Object.keys(stats.typeCounts).length}</span>
                      </>
                    ) : null;
                  })()}
                </div>

                <div className={styles.pileActions}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleLoadPile(pile)}
                  >
                    👁️ View
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeletePile(pile._id, pile.name)}
                    disabled={loading}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Pile Detail View */}
      {selectedPile && (
        <div className={styles.pileDetail}>
          <div className={styles.detailHeader}>
            <h2>📋 {selectedPile.name}</h2>
            <button 
              className={styles.closeButton}
              onClick={() => setSelectedPile(null)}
            >
              ✕
            </button>
          </div>

          {selectedPile.notes && (
            <p className={styles.detailNotes}>{selectedPile.notes}</p>
          )}

          {(() => {
            const stats = calculatePileStats(selectedPile.cards);
            const totalPrice = selectedPile.cards.reduce((sum, card) => {
              const price = parseFloat(card.prices?.usd || 0);
              return sum + price;
            }, 0);
            
            return stats ? (
              <div className={styles.detailStats}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Total Cards</span>
                  <span className={styles.statValue}>{stats.totalCards}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Avg CMC</span>
                  <span className={styles.statValue}>{stats.avgCMC}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Colors</span>
                  <span className={styles.statValue}>{Object.keys(stats.colorCounts).length}</span>
                </div>
                {totalPrice > 0 && (
                  <div className={`${styles.statBox} ${styles.priceBox}`}>
                    <span className={styles.statLabel}>Est. Total</span>
                    <span className={styles.statValue}>${totalPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ) : null;
          })()}

          <div className={styles.detailCards}>
            <h3>Cards in Pile</h3>
            {selectedPile.cards.map((card, index) => (
              <div key={index} className={styles.detailCardItem}>
                {/* Card Image */}
                {card.image_uris && (
                  <img 
                    src={card.image_uris.small || card.image_uris.normal} 
                    alt={card.name}
                    className={styles.cardThumbnail}
                  />
                )}
                
                <div className={styles.cardInfo}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardName}>{card.name}</span>
                    {card.mana_cost && <ManaSymbol manaCost={card.mana_cost} size="small" />}
                  </div>
                  <span className={styles.cardType}>{card.type_line || card.type}</span>
                  {card.oracle_text && (
                    <p className={styles.cardText}>{card.oracle_text}</p>
                  )}
                  {card.power && card.toughness && (
                    <span className={styles.powerToughness}>
                      {card.power}/{card.toughness}
                    </span>
                  )}
                  {card.prices?.usd && (
                    <span className={styles.cardPrice}>${card.prices.usd}</span>
                  )}
                </div>

                {/* Buy Links */}
                <div className={styles.buyLinks}>
                  {card.purchase_uris?.tcgplayer && (
                    <a 
                      href={card.purchase_uris.tcgplayer} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.buyButton}
                    >
                      🛒 TCGplayer
                    </a>
                  )}
                  {card.scryfall_uri && (
                    <a 
                      href={card.scryfall_uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.infoButton}
                    >
                      ℹ️ Scryfall
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PileView;

