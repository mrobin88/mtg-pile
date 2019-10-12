import React from  'react';
import { Link } from 'react-router-dom';
import styles from './Nav.module.css'

const Nav = (props) => {
   
    return (
        <nav className="Navagator">
        <Link className="login" to='/login'>Login</Link>
        <Link className="signup" to='/signup'>Sign Up</Link>
        </nav>
        )
}
export default Nav;                 
