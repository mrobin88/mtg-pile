
import React, { Component } from 'react'
import userService from './utils/userService'
import cardBack from './cardBack.jpg'
import SignupPage from './SignupPage'
import mtgService from '././utils/mtgService'
import AlertTemplate from 'react-alert-template-basic'
import LoginPage from './components/LoginPage/LoginPage'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Provider } from "react-alert";
//import Components
import Nav from './components/Nav/Nav'
import Pile from './components/Pile/Pile.js'
import List from './components/List/List'
import Card from './components/Card/Card'
import Filter from './components/Filters/Filters'
import Details from './components/Details/Details'

// style imports
import './App.css';


class App extends Component {
  constructor() {
    super();
    this.state = {
      details: [],
      usersPile : [],
      cards: [],
      filters: {},
      user: userService.getUser(),
      display: cardBack,
    }
  }
  addCardToPile = () => {
    if(this.state.user && !this.state.usersPile.includes(this.state.details[0])){
      this.setState({ usersPile: [...this.state.usersPile, this.state.details[0]]}) 
    }
  }
  cardSelect = (e) => {
    window.scrollTo(0, 0)
    let dataToDisplay = this.state.cards.filter(obj => obj.imageUrl === e.target.src)
 
    console.log(dataToDisplay)
    this.setState({display: e.target.src})
    this.setState({details: dataToDisplay})
    }

  handleFilterSubmit = async (e) => {
    e.preventDefault()
    let finalNuke = await mtgService.getCards(this.state.filters)
    console.log(finalNuke)
    this.setState({ cards: finalNuke })
  }

  handleFilterChange = (e) => {
    let key = e.target.name
    let value = e.target.value
    this.setState(function (curState) {
      curState.filters[key] = value
      return (curState)
    })
  }

  handleLogout = () => {
    userService.logout();
    this.setState({ user: null });
  }

  handleSignupOrLogin = () => {
    this.setState({ user: userService.getUser() });
  }

  render() {
    // mtgService.getCards()
    return (
      <div className="App">
        <Switch>
          <Route exact path='/' render={() =>
            <Nav
            handleLogout={this.handleLogout}
            user={this.state.user}
            />
          } />
          <Route exact path='/signup' render={({ history }) =>
            <SignupPage
            history={history}
            handleSignupOrLogin={this.handleSignupOrLogin}
            />
          } />
          <Route exact path='/login' render={({ history }) =>
            <LoginPage
            history={history}
            handleSignupOrLogin={this.handleSignupOrLogin}
            />
          } />
          <Redirect to='/login' />
          }/>
        </Switch>
        
        <section className="cardNDetails">

        
          <Card
            details={this.state.details}
            usersPile={this.state.usersPile}
            user={this.state.user}
            addCardToPile={this.addCardToPile}
            display={this.state.display}
          /> 
      
        {this.state.Details
          ?<Details 
          Details ={this.state.Details}
          />
          : <p className="noDetails">Use the filters to narrow down the cards you wish to search for.</p>
          }
          
        {this.state.usersPile.length
          ?<Pile 
          usersPile ={this.state.usersPile.length}
          />
          : <p className="pileInfo">Login to Make Piles </p>
          }

          </section>
        <div>
          <Filter
            handleFilterSubmit={this.handleFilterSubmit}
            handleFilterChange={this.handleFilterChange} />
          
        </div>
    
        <div>
          {this.state.cards.length 
          ? <List cardSelect={this.cardSelect} cards={this.state.cards} /> 
          : <p>List cards:</p>}
        </div>
      </div>
    );
  }
}
export default App;
