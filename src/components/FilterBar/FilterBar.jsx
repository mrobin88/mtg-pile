import React, { useState, useEffect, useRef } from 'react';
import styles from './FilterBar.module.css';

const FilterBar = ({ onFilterChange, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('standard');
  const [selectedColor, setSelectedColor] = useState('');
  const debounceTimeoutRef = useRef(null);

  // Debounced search function
  const debouncedSearch = (filters) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      onFilterChange(filters);
    }, 500); // Wait 500ms after user stops typing
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Use debounced search for text input
    debouncedSearch({
      name: value,
      format: selectedFormat,
      color: selectedColor
    });
  };

  const handleFormatChange = (e) => {
    const value = e.target.value;
    setSelectedFormat(value);
    // Immediate search for dropdowns
    onFilterChange({
      name: searchTerm,
      format: value,
      color: selectedColor
    });
  };

  const handleColorChange = (e) => {
    const value = e.target.value;
    setSelectedColor(value);
    // Immediate search for dropdowns
    onFilterChange({
      name: searchTerm,
      format: selectedFormat,
      color: value
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFormat('standard');
    setSelectedColor('');
    onFilterChange({
      name: '',
      format: 'standard',
      color: ''
    });
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterContainer}>
        {/* Search Input */}
        <div className={styles.searchGroup}>
          <div className={styles.searchIcon}>🔍</div>
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
            disabled={loading}
          />
        </div>

        {/* Format Selector */}
        <select
          value={selectedFormat}
          onChange={handleFormatChange}
          className={styles.formatSelect}
          disabled={loading}
        >
          <option value="standard">Standard</option>
          <option value="modern">Modern</option>
          <option value="commander">Commander</option>
          <option value="limited">Limited</option>
        </select>

        {/* Color Filter */}
        <div className={styles.colorGroup}>
          <select
            value={selectedColor}
            onChange={handleColorChange}
            className={styles.colorSelect}
            disabled={loading}
          >
            <option value="">All Colors</option>
            <option value="white">⚪ White</option>
            <option value="blue">🔵 Blue</option>
            <option value="black">⚫ Black</option>
            <option value="red">🔴 Red</option>
            <option value="green">🟢 Green</option>
            <option value="multicolor">🌈 Multicolor</option>
            <option value="colorless">⚪ Colorless</option>
          </select>
        </div>

        {/* Clear Button */}
        <button
          onClick={clearFilters}
          className={styles.clearButton}
          disabled={loading}
        >
          Clear
        </button>

        {/* Loading Indicator */}
        {loading && (
          <div className={styles.loadingIndicator}>
            <div className={styles.miniSpinner}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
