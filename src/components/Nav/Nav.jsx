import React from  'react';
import { Link } from 'react-router-dom';
import styles from './Nav.module.css'

const Nav = (props) => {
   const userLogoutStr = props.user ? `Logout ${props.user.name}`:'';
    return (
        
        <nav className={styles.navv}>
            <Link style={{textDecoration: 'none' }} className="title" to='/' >MTG PILE</Link>
            {props.user?<a style={{textDecoration: 'none' }}  onClick={props.handleLogout} className="logout" to='/'>{userLogoutStr }</a>
            :
            <><Link style={{textDecoration: 'none' }} className="login" to='/login'>Login</Link>
            <Link style={{textDecoration: 'none' }} className="signup" to='/signup'>Sign Up</Link>
            </>
        
        }
        </nav>
    )
}
export default Nav;                 
