import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import userService from '../../utils/userService';

const LoginPage = (props) => {
  const navigate = useNavigate();
  
  const [state, setState] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await userService.login(state);
      // Let <App> know a user has signed up!
      props.handleSignupOrLogin();
      // Successfully signed up - show GamePage
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  }

  return (
    <div className="LoginPage">
      <header className="header-footer">Log In</header>
      {error && <div className="error-message">{error}</div>}
      <form className="form-horizontal" onSubmit={handleSubmit} >
        <div className="form-group">
          <div className="col-sm-12">
            <input type="email" className="form-control" placeholder="Email" value={state.email} name="email" onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-12">
            <input type="password" className="form-control" placeholder="Password" value={state.password} name="password" onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-12 text-center">
            <button className="btn btn-default" type="submit">Log In</button>&nbsp;&nbsp;&nbsp;
            <Link to='/'>Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;