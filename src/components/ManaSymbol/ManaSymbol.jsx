import React from 'react';
import styles from './ManaSymbol.module.css';

const ManaSymbol = ({ symbol, size = 'medium' }) => {
  // Convert mana cost string to individual symbols
  const parseManaCost = (manaCost) => {
    if (!manaCost) return [];
    
    // Remove curly braces and split by }{ or individual symbols
    const cleanCost = manaCost.replace(/[{}]/g, '');
    const symbols = [];
    
    // Handle generic mana (numbers) - look for numbers at the start
    const genericMatch = cleanCost.match(/^(\d+)/);
    if (genericMatch) {
      symbols.push({ type: 'generic', value: genericMatch[1] });
      const remaining = cleanCost.substring(genericMatch[1].length);
      if (remaining) {
        // Parse remaining symbols
        for (let char of remaining) {
          const colorMap = {
            'W': { type: 'white', value: 'W' },
            'U': { type: 'blue', value: 'U' },
            'B': { type: 'black', value: 'B' },
            'R': { type: 'red', value: 'R' },
            'G': { type: 'green', value: 'G' },
            'C': { type: 'colorless', value: 'C' },
            'X': { type: 'variable', value: 'X' },
            'Y': { type: 'variable', value: 'Y' },
            'Z': { type: 'variable', value: 'Z' },
            'S': { type: 'snow', value: 'S' },
            'P': { type: 'phyrexian', value: 'P' }
          };
          
          if (colorMap[char]) {
            symbols.push(colorMap[char]);
          }
        }
      }
      return symbols;
    }
    
    // Handle colored mana symbols only
    const colorMap = {
      'W': { type: 'white', value: 'W' },
      'U': { type: 'blue', value: 'U' },
      'B': { type: 'black', value: 'B' },
      'R': { type: 'red', value: 'R' },
      'G': { type: 'green', value: 'G' },
      'C': { type: 'colorless', value: 'C' },
      'X': { type: 'variable', value: 'X' },
      'Y': { type: 'variable', value: 'Y' },
      'Z': { type: 'variable', value: 'Z' },
      'S': { type: 'snow', value: 'S' },
      'P': { type: 'phyrexian', value: 'P' }
    };
    
    // Split by individual characters and map to symbols
    for (let char of cleanCost) {
      if (colorMap[char]) {
        symbols.push(colorMap[char]);
      } else if (!isNaN(char)) {
        symbols.push({ type: 'generic', value: char });
      }
    }
    
    return symbols;
  };

  const symbols = parseManaCost(symbol);

  if (symbols.length === 0) {
    return <span className={styles.noMana}>—</span>;
  }

  return (
    <span className={`${styles.manaCost} ${styles[size]}`}>
      {symbols.map((mana, index) => (
        <span
          key={index}
          className={`${styles.manaSymbol} ${styles[mana.type]}`}
          title={`{${mana.value}}`}
        >
          {mana.value}
        </span>
      ))}
    </span>
  );
};

export default ManaSymbol;
