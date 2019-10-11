
import React, { Component } from 'react'
import userService from './utils/userService'
import { Route, Switch, Redirect } from 'react-router-dom'
import mtgService from '././utils/mtgService'
//import Components
import Nav from './Nav'
import List from './components/List/List'
import SignupPage from './SignupPage'
import Card from './components/Card/Card'
import Filter from './components/Filters/Filters'
import LoginPage from './components/LoginPage/LoginPage'
// style imports
import './App.css';
import Details from './components/Details/Details'

class App extends Component {
  constructor() {
    super();
    this.state = {
      cards: [],
      filters: {},
      user: userService.getUser(),
      display: "https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=106426&type=card",
    }
  }
  cardSelect = (e) => {
    console.log(e.target.src)
    window.scrollTo(0, 0)
    let dataToDisplay = this.state.cards.filter(obj => obj.imageUrl === e.target.src)
 
    console.log(dataToDisplay)
    this.setState({display: e.target.src})
    this.setState({Details: dataToDisplay})
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
        <Card
          display={this.state.display}
        />
        <div>
          <Filter
            handleFilterSubmit={this.handleFilterSubmit}
            handleFilterChange={this.handleFilterChange} />
          {this.state.Details
          ?<Details 
          Details ={this.state.Details}
          />
          : <p>Use the filters to narrow down the cards you wish to search for.</p>
          }
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
