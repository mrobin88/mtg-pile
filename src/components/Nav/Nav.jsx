import React from  'react';
import { Link } from 'react-router-dom';
import styles from './Nav.module.css'

const Nav = (props) => {
   const userLogoutStr = props.user ? `Logout ${props.user.name}`:'';
    return (
        
        <nav className={styles.navv}>
            <Link style={{textDecoration: 'none' }} className="title" to='/' >MTG PILE</Link>
            
            <div className={styles.navLinks}>
              <Link style={{textDecoration: 'none' }} className="nav-link" to='/meta'>Meta Analysis</Link>
              <Link style={{textDecoration: 'none' }} className="nav-link" to='/players'>Top Players</Link>
              <Link style={{textDecoration: 'none' }} className="nav-link" to='/piles'>📚 My Piles</Link>
              <Link style={{textDecoration: 'none' }} className="nav-link" to='/test'>🧪 Test</Link>
              {props.user ? (
                <>
                  <span className={styles.userGreeting}>👤 {props.user.name}</span>
                  <button style={{textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }} onClick={props.handleLogout} className="logout">{userLogoutStr}</button>
                </>
              ) : (
                <>
                  <Link style={{textDecoration: 'none' }} className="login" to='/login'>Login</Link>
                  <Link style={{textDecoration: 'none' }} className="signup" to='/signup'>Sign Up</Link>
                </>
              )}
            </div>
        </nav>
    )
}
export default Nav;                 
