import React, { useState, useEffect, useCallback } from 'react';
import tournamentService from '../../utils/tournamentService';
import styles from './MetaAnalysis.module.css';

const MetaAnalysis = () => {
  const [selectedFormat, setSelectedFormat] = useState('standard');
  const [timeframe, setTimeframe] = useState('60d');
  const [metaData, setMetaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [deckLists, setDeckLists] = useState([]);

  const formats = [
    { value: 'standard', label: 'Standard', color: '#4CAF50' },
    { value: 'modern', label: 'Modern', color: '#2196F3' },
    { value: 'pioneer', label: 'Pioneer', color: '#9C27B0' },
    { value: 'legacy', label: 'Legacy', color: '#FF9800' },
    { value: 'vintage', label: 'Vintage', color: '#F44336' },
    { value: 'commander', label: 'Commander', color: '#795548' },
    { value: 'pauper', label: 'Pauper', color: '#607D8B' }
  ];

  const timeframes = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '60d', label: 'Last 60 days' },
    { value: '90d', label: 'Last 90 days' }
  ];

  const loadMetaAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const meta = await tournamentService.getMetaAnalysis(selectedFormat, timeframe);
      setMetaData(meta);
    } catch (error) {
      console.error('Error loading meta analysis:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedFormat, timeframe]);

  useEffect(() => {
    loadMetaAnalysis();
  }, [loadMetaAnalysis]);

  const loadDeckLists = async (archetype) => {
    setSelectedArchetype(archetype);
    try {
      const decks = await tournamentService.getDeckLists(archetype, selectedFormat, 10);
      setDeckLists(decks);
    } catch (error) {
      console.error('Error loading deck lists:', error);
    }
  };



  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Analyzing competitive meta...</p>
      </div>
    );
  }

  return (
    <div className={styles.metaAnalysisContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Competitive MTG Meta Analysis</h1>
        <p>Tournament results, tier rankings, and meta share analysis</p>
      </div>

      {/* Format Selection */}
      <div className={styles.formatSelector}>
        <div className={styles.formatTabs}>
          {formats.map(format => (
            <button
              key={format.value}
              className={`${styles.formatTab} ${selectedFormat === format.value ? styles.active : ''}`}
              onClick={() => setSelectedFormat(format.value)}
              style={{ '--format-color': format.color }}
            >
              {format.label}
            </button>
          ))}
        </div>
        
        <div className={styles.timeframeSelector}>
          <label>Timeframe:</label>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className={styles.timeframeSelect}
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meta Overview */}
      {metaData && (
        <div className={styles.metaOverview}>
          <div className={styles.overviewCards}>
            <div className={styles.overviewCard}>
              <h3>Tournaments</h3>
              <span className={styles.overviewNumber}>{metaData.totalTournaments}</span>
            </div>
            <div className={styles.overviewCard}>
              <h3>Total Decks</h3>
              <span className={styles.overviewNumber}>{metaData.totalDecks}</span>
            </div>
            <div className={styles.overviewCard}>
              <h3>Last Updated</h3>
              <span className={styles.overviewDate}>
                {new Date(metaData.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tier Rankings */}
      {metaData && (
        <div className={styles.tierRankings}>
          <h2>Meta Share & Tier Rankings</h2>
          
          {/* Tier 1 */}
          {metaData.tier1.length > 0 && (
            <div className={styles.tierSection}>
              <h3 className={styles.tierTitle} style={{ color: '#4CAF50' }}>
                🥇 Tier 1 - Top Meta Share
              </h3>
              <div className={styles.archetypeGrid}>
                {metaData.tier1.map((archetype, index) => (
                  <div 
                    key={archetype.archetype} 
                    className={styles.archetypeCard}
                    onClick={() => loadDeckLists(archetype.archetype)}
                  >
                    <div className={styles.archetypeHeader}>
                      <span className={styles.rank}>#{index + 1}</span>
                      <span className={styles.tier} style={{ backgroundColor: '#4CAF50' }}>
                        {archetype.tier}
                      </span>
                    </div>
                    <h4 className={styles.archetypeName}>{archetype.archetype}</h4>
                    <div className={styles.archetypeStats}>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Meta Share:</span>
                        <span className={styles.statValue}>{archetype.metaShare}%</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Decks:</span>
                        <span className={styles.statValue}>{archetype.deckCount}</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Win Rate:</span>
                        <span className={styles.statValue}>{archetype.winRate}%</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Top 8 Rate:</span>
                        <span className={styles.statValue}>{archetype.top8Rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tier 2 */}
          {metaData.tier2.length > 0 && (
            <div className={styles.tierSection}>
              <h3 className={styles.tierTitle} style={{ color: '#FF9800' }}>
                🥈 Tier 2 - Competitive Options
              </h3>
              <div className={styles.archetypeGrid}>
                {metaData.tier2.map((archetype, index) => (
                  <div 
                    key={archetype.archetype} 
                    className={styles.archetypeCard}
                    onClick={() => loadDeckLists(archetype.archetype)}
                  >
                    <div className={styles.archetypeHeader}>
                      <span className={styles.rank}>#{metaData.tier1.length + index + 1}</span>
                      <span className={styles.tier} style={{ backgroundColor: '#FF9800' }}>
                        {archetype.tier}
                      </span>
                    </div>
                    <h4 className={styles.archetypeName}>{archetype.archetype}</h4>
                    <div className={styles.archetypeStats}>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Meta Share:</span>
                        <span className={styles.statValue}>{archetype.metaShare}%</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Decks:</span>
                        <span className={styles.statValue}>{archetype.deckCount}</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Win Rate:</span>
                        <span className={styles.statValue}>{archetype.winRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deck Lists */}
      {selectedArchetype && deckLists.length > 0 && (
        <div className={styles.deckListsSection}>
          <h2>Top {selectedArchetype} Decks</h2>
          <div className={styles.deckListsGrid}>
            {deckLists.map(deck => (
              <div key={deck.id} className={styles.deckCard}>
                <div className={styles.deckHeader}>
                  <h4>{deck.name}</h4>
                  <span className={styles.deckPlacement}>#{deck.placement}</span>
                </div>
                <div className={styles.deckInfo}>
                  <p><strong>Player:</strong> {deck.player}</p>
                  <p><strong>Record:</strong> {deck.record}</p>
                  <p><strong>Win Rate:</strong> {deck.winrate}%</p>
                  <p><strong>Price:</strong> ${deck.price}</p>
                  <p><strong>Last Updated:</strong> {new Date(deck.lastUpdated).toLocaleDateString()}</p>
                </div>
                <div className={styles.deckActions}>
                  <button className={styles.viewDeckBtn}>View Deck</button>
                  <button className={styles.priceDeckBtn}>Price Deck</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaAnalysis;
