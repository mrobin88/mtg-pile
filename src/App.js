import React, {Component} from 'react';
import './App.css';
import cardBack from './cardBack.jpg'
import Nav from './components/Nav/Nav'
const placeHolders = {
  display: cardBack
  
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      Display: cardBack
    }
  }
  
  render(){
    return (
      <div className="App">
        <Nav />
        <img src={this.state.Display}></img>

      </div>
    );
  }
}

export default App;
