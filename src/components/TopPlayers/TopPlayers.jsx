import React, { useState, useEffect } from 'react';
import tournamentService from '../../utils/tournamentService';
import styles from './TopPlayers.module.css';

const TopPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    loadTopPlayers();
  }, []);

  const loadTopPlayers = async () => {
    setLoading(true);
    try {
      console.log('Loading top players...');
      console.log('Tournament service:', tournamentService);
      console.log('getTopPlayers method:', tournamentService.getTopPlayers);
      const topPlayers = await tournamentService.getTopPlayers(10);
      console.log('Top players loaded:', topPlayers);
      setPlayers(topPlayers);
    } catch (error) {
      console.error('Error loading top players:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getCountryFlag = (country) => {
    const flags = {
      'USA': '🇺🇸',
      'Japan': '🇯🇵',
      'Czech Republic': '🇨🇿',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Argentina': '🇦🇷',
      'Brazil': '🇧🇷',
      'Germany': '🇩🇪'
    };
    return flags[country] || '🌍';
  };

  const getFormatColor = (format) => {
    const colors = {
      'Standard': '#4CAF50',
      'Modern': '#2196F3',
      'Pioneer': '#9C27B0',
      'Legacy': '#FF9800',
      'Vintage': '#F44336',
      'Commander': '#795548',
      'Pauper': '#607D8B'
    };
    return colors[format] || '#666';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading top players...</p>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className={styles.topPlayersContainer}>
        <div className={styles.header}>
          <h1>🏆 Top 10 Players by QP Points</h1>
          <p>Qualifier Points Leaderboard - Sanctioned Tournament Results</p>
        </div>
        <div className={styles.loadingContainer}>
          <p>No player data available. Please try refreshing the page.</p>
          <button onClick={loadTopPlayers} className={styles.retryButton}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.topPlayersContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1>🏆 Top 10 Players by QP Points</h1>
        <p>Qualifier Points Leaderboard - Sanctioned Tournament Results</p>
      </div>

      {/* Leaderboard */}
      <div className={styles.leaderboard}>
        {players.map((player, index) => (
          <div 
            key={player.id} 
            className={`${styles.playerCard} ${selectedPlayer?.id === player.id ? styles.selected : ''}`}
            onClick={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
          >
            <div className={styles.playerRank}>
              <span className={styles.rankIcon}>{getRankIcon(index + 1)}</span>
            </div>
            
            <div className={styles.playerInfo}>
              <div className={styles.playerHeader}>
                <h3 className={styles.playerName}>{player.name}</h3>
                <span className={styles.country}>
                  {getCountryFlag(player.country)} {player.country}
                </span>
              </div>
              
              <div className={styles.playerStats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>QP Points:</span>
                  <span className={styles.statValue}>{player.qpPoints}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Sanctioned Matches:</span>
                  <span className={styles.statValue}>{player.sanctionedMatches}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Win Rate:</span>
                  <span className={styles.statValue}>{player.winRate}%</span>
                </div>
              </div>
              
              <div className={styles.formats}>
                <span className={styles.formatsLabel}>Formats:</span>
                <div className={styles.formatTags}>
                  {player.formats.map(format => (
                    <span 
                      key={format} 
                      className={styles.formatTag}
                      style={{ backgroundColor: getFormatColor(format) }}
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className={styles.qpPoints}>
              <div className={styles.qpNumber}>{player.qpPoints}</div>
              <div className={styles.qpLabel}>QP</div>
            </div>
          </div>
        ))}
      </div>

      {/* Player Details Modal */}
      {selectedPlayer && (
        <div className={styles.playerModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{selectedPlayer.name}</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedPlayer(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.playerDetails}>
                <div className={styles.detailSection}>
                  <h3>Player Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Country:</span>
                      <span className={styles.detailValue}>
                        {getCountryFlag(selectedPlayer.country)} {selectedPlayer.country}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>QP Points:</span>
                      <span className={styles.detailValue}>{selectedPlayer.qpPoints}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Sanctioned Matches:</span>
                      <span className={styles.detailValue}>{selectedPlayer.sanctionedMatches}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Win Rate:</span>
                      <span className={styles.detailValue}>{selectedPlayer.winRate}%</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.detailSection}>
                  <h3>Recent Tournament Results</h3>
                  <div className={styles.resultsList}>
                    {selectedPlayer.recentResults.map((result, index) => (
                      <div key={index} className={styles.resultItem}>
                        <div className={styles.resultTournament}>{result.tournament}</div>
                        <div className={styles.resultPlacement}>
                          <span className={styles.placement}>#{result.placement}</span>
                          <span className={styles.qpEarned}>+{result.qpEarned} QP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.detailSection}>
                  <h3>Active Formats</h3>
                  <div className={styles.formatsList}>
                    {selectedPlayer.formats.map(format => (
                      <span 
                        key={format} 
                        className={styles.formatTag}
                        style={{ backgroundColor: getFormatColor(format) }}
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopPlayers;
