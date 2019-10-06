import React from  'react';
import { Link } from 'react-router-dom';

const Nav = (props) => {
    return ( 
        <div className="Nav">
            <Link className="login" to='/login'>Login</Link> 
            <Link className="signup" to='/signup'>Sign Up</Link>
        </div>
        );
}
export default Nav; 