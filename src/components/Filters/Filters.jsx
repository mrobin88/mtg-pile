import React, { useState, useEffect, useRef } from 'react'
import styles from './Filters.module.css'

const Filters = (props) => {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Autocomplete state for Card Name
  const [nameQuery, setNameQuery] = useState(props.filters.name || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Sync local input with parent filter changes
  useEffect(() => {
    setNameQuery(props.filters.name || '')
  }, [props.filters.name])

  // Debounced autocomplete fetch
  const lastNameQueryRef = useRef('')
  const abortRef = useRef(null)

  useEffect(() => {
    if (!nameQuery || nameQuery.trim().length < 2) {
      setSuggestions([])
      setActiveIndex(-1)
      if (abortRef.current) abortRef.current.abort()
      return
    }
    // Debounce
    const id = setTimeout(async () => {
      if (lastNameQueryRef.current === nameQuery.trim()) return
      lastNameQueryRef.current = nameQuery.trim()
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()
      await fetchSuggestions(nameQuery.trim(), abortRef.current.signal)
    }, 300)
    return () => clearTimeout(id)
  }, [nameQuery])

  const fetchSuggestions = async (q, signal) => {
    try {
      const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}`, { signal })
      const data = await res.json()
      setSuggestions(data.data || [])
      setShowSuggestions(true)
      setActiveIndex(-1)
    } catch (e) {
      // noop
    }
  }

  const handleNameChange = (e) => {
    setNameQuery(e.target.value)
    props.handleFilterChange(e)
  }

  const selectSuggestion = (name) => {
    setNameQuery(name)
    setShowSuggestions(false)
    setSuggestions([])
    setActiveIndex(-1)
    props.handleFilterChange({ target: { name: 'name', value: name } })
  }

  const handleNameKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault()
        selectSuggestion(suggestions[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleNameBlur = () => {
    // Delay hiding to allow click selection
    setTimeout(() => setShowSuggestions(false), 150)
  }

  // Modern MTG formats
  const formats = [
    'Standard', 'Modern', 'Pioneer', 'Legacy', 'Vintage', 'Commander', 'Pauper', 'Limited'
  ]

  // Color options
  const colors = [
    { value: 'W', label: 'White' },
    { value: 'U', label: 'Blue' },
    { value: 'B', label: 'Black' },
    { value: 'R', label: 'Red' },
    { value: 'G', label: 'Green' },
    { value: 'C', label: 'Colorless' }
  ]

  // Card types
  const cardTypes = [
    'Creature', 'Instant', 'Sorcery', 'Enchantment', 'Artifact', 'Planeswalker', 'Land'
  ]

  // Rarities
  const rarities = [
    'Common', 'Uncommon', 'Rare', 'Mythic'
  ]

  // CMC ranges
  const cmcRanges = [
    { value: '0', label: '0' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6+', label: '6+' }
  ]

  useEffect(() => {
    fetchSets()
  }, [])

  const fetchSets = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://api.scryfall.com/sets')
      const data = await response.json()
      // Filter for recent standard-legal sets and popular sets
      const recentSets = data.data
        .filter(set => set.set_type === 'core' || set.set_type === 'expansion')
        .sort((a, b) => new Date(b.released_at) - new Date(a.released_at))
        .slice(0, 20) // Get last 20 sets
      setSets(recentSets)
    } catch (error) {
      console.error('Error fetching sets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      // Handle checkbox filters (like colors)
      props.handleFilterChange({
        target: {
          name,
          value: checked ? value : null
        }
      })
    } else {
      props.handleFilterChange(e)
    }
  }

  const clearFilters = () => {
    setNameQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setActiveIndex(-1)
    props.resetFilter()
  }

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersHeader}>
        <h3>Find Your Perfect MTG Card</h3>
        <p>Filter by format, set, color, type, and more to find competitive alternatives</p>
      </div>
      
      <div className={styles.filtersGrid}>
        {/* Name Search */}
        <div className={styles.filterGroup}>
          <label>Card Name</label>
          <div className={styles.nameSearchWrapper}>
            <input
              className={styles.nameSearch}
              placeholder="Search for cards..."
              name="name"
              value={nameQuery}
              onChange={handleNameChange}
              onKeyDown={handleNameKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={handleNameBlur}
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className={styles.suggestions} role="listbox">
                {suggestions.slice(0, 10).map((s, i) => (
                  <li
                    key={s}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={`${styles.suggestionItem} ${i === activeIndex ? styles.active : ''}`}
                    onMouseDown={() => selectSuggestion(s)}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Format Filter */}
        <div className={styles.filterGroup}>
          <label>Format</label>
          <select 
            className={styles.filterSelect} 
            name="format" 
            onChange={handleFilterChange}
            value={props.filters.format || ''}
          >
            <option value="">Any Format</option>
            {formats.map(format => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>

        {/* Set Filter */}
        <div className={styles.filterGroup}>
          <label>Set</label>
          <select 
            className={styles.filterSelect} 
            name="set" 
            onChange={handleFilterChange}
            value={props.filters.set || ''}
          >
            <option value="">Any Set</option>
            {loading ? (
              <option disabled>Loading sets...</option>
            ) : (
              sets.map(set => (
                <option key={set.code} value={set.code}>
                  {set.name} ({set.code.toUpperCase()})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Color Filter */}
        <div className={styles.filterGroup}>
          <label>Color</label>
          <div className={styles.colorCheckboxes}>
            {colors.map(color => (
              <label key={color.value} className={styles.colorCheckbox}>
                <input
                  type="checkbox"
                  name="color"
                  value={color.value}
                  onChange={handleFilterChange}
                  checked={props.filters.color === color.value}
                />
                <span className={styles.colorLabel}>{color.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Card Type Filter */}
        <div className={styles.filterGroup}>
          <label>Card Type</label>
          <select 
            className={styles.filterSelect} 
            name="type" 
            onChange={handleFilterChange}
            value={props.filters.type || ''}
          >
            <option value="">Any Type</option>
            {cardTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* CMC Filter */}
        <div className={styles.filterGroup}>
          <label>Mana Cost (CMC)</label>
          <select 
            className={styles.filterSelect} 
            name="cmc" 
            onChange={handleFilterChange}
            value={props.filters.cmc || ''}
          >
            <option value="">Any CMC</option>
            {cmcRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>

        {/* Rarity Filter */}
        <div className={styles.filterGroup}>
          <label>Rarity</label>
          <select 
            className={styles.filterSelect} 
            name="rarity" 
            onChange={handleFilterChange}
            value={props.filters.rarity || ''}
          >
            <option value="">Any Rarity</option>
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>{rarity}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.filterActions}>
        <button 
          className={styles.searchButton} 
          onClick={props.handleFilterSubmit}
        >
          🔍 Search Cards
        </button>
        <button 
          className={styles.clearButton} 
          onClick={clearFilters}
        >
          🗑️ Clear Filters
        </button>
      </div>

      
    </div>
  )
}

export default Filters