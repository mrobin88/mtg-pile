import React from  'react';
import { Link } from 'react-router-dom';

const Nav = (props) => {
   
    return (
        <>
        <Link className="login" to='/login'>Login</Link>
        <Link className="signup" to='/signup'>Sign Up</Link>
        </>
        )
}
export default Nav; 
