import React, { useState, useEffect } from 'react';
import styles from './DraftHelper.module.css';
import draftEvaluationService from '../../utils/draftEvaluationService';
import { toast } from 'react-toastify';

const DraftHelper = ({ cards = [], format = 'limited', context = {} }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sortBy, setSortBy] = useState('overallScore');
  const [alternatives, setAlternatives] = useState([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  useEffect(() => {
    if (cards.length > 0) {
      evaluateCards();
    }
  }, [cards, format, context]);

  const evaluateCards = async () => {
    setLoading(true);
    try {
      const cardEvaluations = await Promise.all(
        cards.map(card => draftEvaluationService.evaluateCard(card, format, context))
      );
      
      // Sort by selected criteria
      const sortedEvaluations = sortEvaluations(cardEvaluations, sortBy);
      setEvaluations(sortedEvaluations);
    } catch (error) {
      console.error('Error evaluating cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortEvaluations = (evals, sortKey) => {
    return [...evals].sort((a, b) => {
      if (sortKey === 'overallScore') {
        return b.overallScore - a.overallScore;
      } else if (sortKey === 'breadScore') {
        return b.breadScore - a.breadScore;
      } else if (sortKey === 'quadrantScore') {
        return b.quadrantScore - a.quadrantScore;
      } else if (sortKey === 'formatScore') {
        return b.formatScore - a.formatScore;
      } else if (sortKey === 'cmc') {
        return a.card.cmc - b.card.cmc;
      }
      return 0;
    });
  };

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    const sortedEvaluations = sortEvaluations(evaluations, newSortBy);
    setEvaluations(sortedEvaluations);
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return styles.excellent;
    if (score >= 0.6) return styles.good;
    if (score >= 0.4) return styles.average;
    return styles.poor;
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Average';
    return 'Poor';
  };

  const formatScore = (score) => {
    return (score * 100).toFixed(0);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedCard(null);
  };

  const findCompetitiveAlternatives = async (card) => {
    setLoadingAlternatives(true);
    try {
      // Use the enhanced draft evaluation service to find alternatives
      const alternativesData = await draftEvaluationService.compareCardsWithAlternatives(
        card, 
        format || 'limited', 
        context || {}
      );

      if (alternativesData.alternatives && alternativesData.alternatives.length > 0) {
        setAlternatives(alternativesData.alternatives);
        setShowAlternatives(!showAlternatives);
        
        // Show recommendations if available
        if (alternativesData.recommendations.length > 0) {
          alternativesData.recommendations.forEach(rec => {
            toast.info(rec);
          });
        }
      } else {
        toast.info("No competitive alternatives found for this card type");
      }
    } catch (error) {
      console.error('Error finding alternatives:', error);
      toast.error("Error finding alternatives");
    } finally {
      setLoadingAlternatives(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Evaluating cards for {format} format...</p>
      </div>
    );
  }

  return (
    <div className={styles.draftHelper}>
      <div className={styles.header}>
        <h2>🎯 Draft Helper - {format.charAt(0).toUpperCase() + format.slice(1)}</h2>
        <div className={styles.controls}>
          <label htmlFor="sortBy">Sort by:</label>
          <select id="sortBy" value={sortBy} onChange={handleSortChange}>
            <option value="overallScore">Overall Score</option>
            <option value="breadScore">BREAD Score</option>
            <option value="quadrantScore">Quadrant Score</option>
            <option value="formatScore">Format Score</option>
            <option value="cmc">CMC</option>
          </select>
        </div>
      </div>

      <div className={styles.evaluationGrid}>
        {evaluations.map((evaluation, index) => (
          <div 
            key={evaluation.card.id || index} 
            className={styles.cardEvaluation}
            onClick={() => handleCardClick(evaluation)}
          >
            <div className={styles.cardImage}>
              <img 
                src={evaluation.card.image_uris?.small || evaluation.card.image_uris?.normal} 
                alt={evaluation.card.name}
                onError={(e) => {
                  e.target.src = '/static/media/cardBack.74d4121097f2e0cff420.jpg';
                }}
              />
            </div>
            
            <div className={styles.cardInfo}>
              <h4>{evaluation.card.name}</h4>
              <p className={styles.cardType}>{evaluation.card.type_line}</p>
              <p className={styles.cardMana}>{evaluation.card.mana_cost} (CMC: {evaluation.card.cmc})</p>
            </div>

            <div className={styles.scores}>
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>Overall</span>
                <span className={`${styles.scoreValue} ${getScoreColor(evaluation.overallScore)}`}>
                  {formatScore(evaluation.overallScore)}
                </span>
                <span className={styles.scoreGrade}>{getScoreLabel(evaluation.overallScore)}</span>
              </div>
              
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>BREAD</span>
                <span className={`${styles.scoreValue} ${getScoreColor(evaluation.breadScore)}`}>
                  {formatScore(evaluation.breadScore)}
                </span>
              </div>
              
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>Quadrant</span>
                <span className={`${styles.scoreValue} ${getScoreColor(evaluation.quadrantScore)}`}>
                  {formatScore(evaluation.quadrantScore)}
                </span>
              </div>
            </div>

            <div className={styles.pickOrder}>
              <span className={styles.pickNumber}>#{index + 1}</span>
              <span className={styles.pickReason}>{evaluation.pickReason}</span>
            </div>
            
            <div className={styles.cardActions}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  findCompetitiveAlternatives(evaluation.card);
                }}
                className={styles.actionButton}
                disabled={loadingAlternatives}
              >
                {loadingAlternatives ? '🔍 Searching...' : '⚡ Find Alternatives'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Card Details Modal */}
      {showDetails && selectedCard && (
        <div className={styles.modal} onClick={closeDetails}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{selectedCard.card.name} - Detailed Evaluation</h3>
              <button className={styles.closeButton} onClick={closeDetails}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.cardDisplay}>
                <img 
                  src={selectedCard.card.image_uris?.normal || selectedCard.card.image_uris?.small} 
                  alt={selectedCard.card.name}
                />
              </div>
              
              <div className={styles.evaluationDetails}>
                <div className={styles.scoreBreakdown}>
                  <h4>Score Breakdown</h4>
                  <div className={styles.scoreRow}>
                    <span>Overall Score:</span>
                    <span className={`${styles.scoreValue} ${getScoreColor(selectedCard.overallScore)}`}>
                      {formatScore(selectedCard.overallScore)} - {getScoreLabel(selectedCard.overallScore)}
                    </span>
                  </div>
                  <div className={styles.scoreRow}>
                    <span>BREAD Score:</span>
                    <span className={`${styles.scoreValue} ${getScoreColor(selectedCard.breadScore)}`}>
                      {formatScore(selectedCard.breadScore)}
                    </span>
                  </div>
                  <div className={styles.scoreRow}>
                    <span>Quadrant Score:</span>
                    <span className={`${styles.scoreValue} ${getScoreColor(selectedCard.quadrantScore)}`}>
                      {formatScore(selectedCard.quadrantScore)}
                    </span>
                  </div>
                  <div className={styles.scoreRow}>
                    <span>Format Score:</span>
                    <span className={`${styles.scoreValue} ${getScoreColor(selectedCard.formatScore)}`}>
                      {formatScore(selectedCard.formatScore)}
                    </span>
                  </div>
                </div>
                
                <div className={styles.recommendations}>
                  <h4>Recommendations</h4>
                  <ul>
                    {selectedCard.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                
                <div className={styles.cardDetails}>
                  <h4>Card Details</h4>
                  <p><strong>Type:</strong> {selectedCard.card.type_line}</p>
                  <p><strong>CMC:</strong> {selectedCard.card.cmc}</p>
                  <p><strong>Rarity:</strong> {selectedCard.card.rarity}</p>
                  {selectedCard.card.power && selectedCard.card.toughness && (
                    <p><strong>P/T:</strong> {selectedCard.card.power}/{selectedCard.card.toughness}</p>
                  )}
                  {selectedCard.card.text && (
                    <div className={styles.cardText}>
                      <strong>Text:</strong>
                      <p>{selectedCard.card.text}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Competitive Alternatives Section */}
      {showAlternatives && alternatives.length > 0 && (
        <div className={styles.alternativesSection}>
          <h3>⚡ Competitive Alternatives Found</h3>
          <div className={styles.alternativesGrid}>
            {alternatives.map((alt, index) => (
              <div key={alt.id || index} className={styles.alternativeCard}>
                <img
                  src={alt.image_uris?.small || alt.image_uris?.normal}
                  alt={alt.name}
                  className={styles.alternativeImage}
                  onError={(e) => {
                    e.target.src = '/static/media/cardBack.74d4121097f2e0cff420.jpg';
                  }}
                />
                <div className={styles.alternativeInfo}>
                  <h5>{alt.name}</h5>
                  <p>CMC: {alt.cmc} | {alt.type_line}</p>
                  <p className={styles.alternativeRarity}>{alt.rarity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftHelper;
