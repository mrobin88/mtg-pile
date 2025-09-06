# 🎴 MTG Pile - Competitive Magic: The Gathering Database

A comprehensive MTG application that helps players find competitive cards, analyze meta, track tournament results, and discover deck alternatives with pricing and affiliate links.

## 🚀 **What This App Does**

### **Current Features:**
- **Card Search**: Find MTG cards using Scryfall API with advanced filters
- **Competitive Alternatives**: Discover better cards with lower CMC
- **Meta Analysis**: View tier rankings and meta share (mock data for now)
- **Purchase Links**: Direct links to Amazon, TCG Player, and other retailers
- **User Authentication**: JWT-based login system with MongoDB
- **Card Piles**: Save and organize your favorite cards

### **Planned Features (Competitive Database):**
- **Tournament Results**: Real tournament data from MTGMelee, MTGTop8
- **Meta Analysis**: Live meta share calculations and tier rankings
- **Deck Lists**: Tournament-winning deck lists with pricing
- **Price Tracking**: Real-time card prices from TCGPlayer, MTGGoldfish
- **MTGO Integration**: Ticket prices and online tournament results
- **Affiliate Revenue**: Amazon, TCG Player affiliate links

## 🏗️ **Architecture & How It Works**

### **Frontend (React 18):**
- **Modern UI**: Responsive design with CSS Grid and Flexbox
- **State Management**: React hooks and component state
- **Routing**: React Router v6 for navigation
- **Styling**: CSS Modules with modern gradients and animations

### **Backend (Node.js + Express):**
- **API Server**: RESTful endpoints for cards, users, and meta data
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Rate Limiting**: API request throttling

### **Data Sources:**
- **Scryfall API**: Free, comprehensive MTG card database
- **TCGPlayer API**: Card pricing and market data
- **MTGMelee/MTGTop8**: Tournament results and deck lists
- **MTGGoldfish**: Additional pricing and meta analysis

## 💰 **Revenue Model (How Sites Make Money)**

### **Affiliate Programs:**
1. **Amazon Associates**: 4-8% commission on MTG card sales
2. **TCG Player**: 5-10% commission on card purchases
3. **Card Kingdom**: 3-5% commission on sales
4. **Star City Games**: 3-5% commission on sales

### **Premium Features:**
- **Pro Subscriptions**: Advanced analytics and deck building tools
- **Tournament Coverage**: Premium tournament reports and analysis
- **Price Alerts**: Notifications when cards hit target prices
- **Deck Builder Pro**: Advanced deck construction and testing tools

## 🔧 **Setup & Installation**

### **Prerequisites:**
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- API keys for TCGPlayer, MTGGoldfish, etc.

### **Environment Variables:**
```bash
# Copy and configure
cp env.example .env

# Required variables:
DATABASE_URL=mongodb://localhost:27017/mtg-pile
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=7d

# API Keys (get these from respective services):
TCGPLAYER_CLIENT_ID=your-tcgplayer-client-id
TCGPLAYER_CLIENT_SECRET=your-tcgplayer-client-secret
MTGGOLDFISH_API_KEY=your-mtggoldfish-api-key
MTGMELEE_API_KEY=your-mtgmelee-api-key

# Affiliate IDs:
AMAZON_AFFILIATE_TAG=your-amazon-tag
TCGPLAYER_AFFILIATE_ID=your-tcgplayer-id
```

### **Installation:**
```bash
# Clone and install dependencies
git clone <repository>
cd mtg-pile
npm install

# Start MongoDB (macOS with Homebrew)
brew services start mongodb/brew/mongodb-community

# Build and start the app
npm run build
npm run server    # Backend on port 3001
npm start         # Frontend on port 3000
```

## 📊 **How Meta Analysis Works**

### **Data Collection:**
1. **Tournament Scraping**: Fetch results from major tournaments
2. **Deck Aggregation**: Count archetype appearances and performance
3. **Meta Calculation**: Determine meta share percentages
4. **Tier Assignment**: Rank decks based on meta share and win rates

### **Tier System:**
- **Tier 1**: Top 50% of meta or top 15 archetypes
- **Tier 2**: 0.2%+ meta share, competitive but not dominant
- **Tier 3**: <0.2% meta share, rogue decks and experimental builds

### **Performance Metrics:**
- **Meta Share**: Percentage of total tournament decks
- **Win Rate**: Overall performance across tournaments
- **Top 8 Rate**: Frequency of reaching elimination rounds
- **Tournament Wins**: Number of 1st place finishes

## 🔗 **API Integration Guide**

### **Scryfall (Free):**
```javascript
// Search cards
GET https://api.scryfall.com/cards/search?q=name:"Lightning Bolt"

// Get specific card
GET https://api.scryfall.com/cards/named?fuzzy=Lightning Bolt

// Get sets
GET https://api.scryfall.com/sets
```

### **TCGPlayer (Paid):**
```javascript
// Get access token
POST https://api.tcgplayer.com/token
// Requires client credentials

// Search products
GET https://api.tcgplayer.com/catalog/products?name=Lightning Bolt

// Get pricing
GET https://api.tcgplayer.com/pricing/product/{productId}
```

### **MTGMelee (Scraping Required):**
```javascript
// Tournament results
GET https://mtgmelee.com/Tournament/View/{tournamentId}

// Deck lists
GET https://mtgmelee.com/Deck/View/{deckId}
```

## 🚀 **Next Steps to Full Competitive Database**

### **Phase 1: Data Collection (Week 1-2)**
- [ ] Set up TCGPlayer API integration
- [ ] Implement tournament data scraping
- [ ] Create database schemas for tournaments and results

### **Phase 2: Meta Analysis (Week 3-4)**
- [ ] Build real-time meta calculation engine
- [ ] Implement tier ranking algorithms
- [ ] Add historical meta tracking

### **Phase 3: Revenue Features (Week 5-6)**
- [ ] Integrate affiliate link generation
- [ ] Add premium subscription system
- [ ] Implement price tracking and alerts

### **Phase 4: Advanced Features (Week 7-8)**
- [ ] MTGO ticket price integration
- [ ] Advanced deck building tools
- [ ] Tournament coverage and reporting

## 💡 **Business Model Examples**

### **MTGGoldfish:**
- Affiliate revenue from TCGPlayer and Card Kingdom
- Premium subscription for advanced analytics
- Tournament coverage and premium content

### **MTGTop8:**
- Tournament result aggregation
- Deck list database with pricing
- Affiliate partnerships with major retailers

### **MTGDecks.net:**
- Comprehensive tournament database
- Meta analysis and tier rankings
- Affiliate revenue from multiple sources

## 🛠️ **Development Commands**

```bash
# Development
npm run dev          # Start both frontend and backend
npm start            # Start React frontend only
npm run server       # Start Express backend only

# Building
npm run build        # Build production React app
npm run test         # Run tests

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database
```

## 📈 **Performance & Scaling**

### **Current:**
- Single server setup
- MongoDB local instance
- Basic caching with Map objects

### **Production Ready:**
- Redis for caching and sessions
- MongoDB Atlas for database
- CDN for static assets
- Load balancing for API endpoints
- Rate limiting and DDoS protection

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details

## 🆘 **Support**

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: [Your Email]

---

**Built with ❤️ for the MTG community**

*This app demonstrates how to build a competitive MTG database similar to MTGDecks.net, MTGGoldfish, and other successful sites in the space.*

