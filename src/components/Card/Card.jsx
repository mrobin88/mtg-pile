import React from 'react';
import styles from './Card.module.css'

const Card = (props) => {
    return (
    <>
    <div className={styles.cMenu}>
    <img alt='mtg card back' src={props.display}>   
    </img>
    <div className={styles.cardOpt}>
        <a href="/add">Pile+</a><div>&nbsp;&nbsp;</div>
        <a href="/">Details</a><div>&nbsp;&nbsp;</div>
        <a href="/">bettercard</a><div>&nbsp;&nbsp;</div>
        </div>
    </div>
    </>
    )

  };
  
  export default Card;
