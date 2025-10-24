import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import FilterBar from './components/FilterBar/FilterBar';
import CardGrid from './components/CardGrid/CardGrid';
import Nav from './components/Nav/Nav';
import LoginPage from './components/LoginPage/LoginPage';
import SignupPage from './SignupPage';
import MetaAnalysis from './components/MetaAnalysis/MetaAnalysis';
import TopPlayers from './components/TopPlayers/TopPlayers';
import TestPage from './components/TestPage/TestPage';
import PileView from './components/PileView/PileView';

// Services
import mtgService from './utils/mtgService';

// Styles
import './App.css';

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPile, setCurrentPile] = useState([]);

  // Load initial cards (latest set)
  useEffect(() => {
    loadInitialCards();
    
    // Debug: Log user state for production testing
    if (user) {
      console.log('✅ User logged in:', { name: user.name, email: user.email });
    } else {
      console.log('❌ No user logged in');
    }
  }, [user]);

  const loadInitialCards = async () => {
    setLoading(true);
    try {
      // Load cards from the latest set
      const initialCards = await mtgService.getLatestSetCards(50);
      setCards(initialCards);
    } catch (error) {
      console.error('Error loading initial cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (filters) => {
    setLoading(true);
    
    try {
      const filteredCards = await mtgService.getCards(filters);
      setCards(filteredCards);
    } catch (error) {
      console.error('Error filtering cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card) => {
    // Handle card click - could open modal, add to collection, etc.
    console.log('Card clicked:', card);
  };

  const handleAddToPile = (card) => {
    // Check if card is already in pile
    const isInPile = currentPile.some(c => c.name === card.name);
    if (isInPile) {
      console.log('Card already in pile:', card.name);
      return;
    }
    
    setCurrentPile([...currentPile, card]);
    console.log('Added to pile:', card.name);
  };

  // eslint-disable-next-line no-unused-vars
  const handleRemoveFromPile = (cardName) => {
    setCurrentPile(currentPile.filter(c => c.name !== cardName));
    console.log('Removed from pile:', cardName);
  };

  const handlePileUpdate = (newPile) => {
    setCurrentPile(newPile || []);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleSignupOrLogin = () => {
    // Get user from token service
    const userService = require('./utils/userService').default;
    const userData = userService.getUser();
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      <Nav user={user} handleLogout={handleLogout} />
      
      <Routes>
        <Route path="/login" element={<LoginPage handleSignupOrLogin={handleSignupOrLogin} />} />
        <Route path="/signup" element={<SignupPage handleSignupOrLogin={handleSignupOrLogin} />} />
        <Route path="/meta" element={<MetaAnalysis />} />
        <Route path="/players" element={<TopPlayers />} />
        <Route path="/test" element={<TestPage user={user} />} />
        <Route path="/piles" element={
          <PileView 
            user={user} 
            currentPile={currentPile}
            onPileUpdate={handlePileUpdate}
          />
        } />
        <Route path="/" element={
          <div className="main-content">
            <FilterBar 
              onFilterChange={handleFilterChange}
              loading={loading}
            />
            
            <div className="content-area">
              <CardGrid 
                cards={cards}
                onCardClick={handleCardClick}
                onAddToPile={handleAddToPile}
                currentPile={currentPile}
                user={user}
                loading={loading}
              />
            </div>
          </div>
        } />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;