import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import cardBack from './cardBack.jpg'
import Nav from './Nav'
import SignupPage from './SignupPage';
import LoginPage from './LoginPage';
import userService from './userService';



class App extends Component {
  constructor() {
    super();
    this.state = {
      user: userService.getUser(),
      Display: cardBack
    }
  }

  handleLogout = () => {
    userService.logout();
    this.setState({ user: null });
  }
  handleSignupOrLogin = () => {
    this.setState({user: userService.getUser()});
  }

  render() {
    return (
      <div className="App">
    
        <Switch>
        <Route exact path='/' render={() =>
            <Nav
            handleLogout={this.handleLogout}
            user={this.state.user}
            />
          }/>
 
          <Route exact path='/signup' render={({ history }) => 
            <SignupPage
            history={history}
            handleSignupOrLogin={this.handleSignupOrLogin}
            />
          }/>
          <Route exact path='/login' render={({ history }) => 
            <LoginPage
            history={history}
            handleSignupOrLogin={this.handleSignupOrLogin}
            />
          }/>
              <Redirect to='/login'/>
          }/>
        </Switch>
          <img alt='mtg card back' src={this.state.Display}></img>
      </div>
    );
  }
}
        
        
        export default App;
