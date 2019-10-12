import React from 'react';
import styles from './Card.module.css'

const Card = (props) => {
    return (
    <>
    <div className={styles.cMenu}>
    <img alt='mtg card back' src={props.display}>   
    </img>
    <div className={styles.cardOpt}>
        <button disabled="true">Pile+</button><div>&nbsp;&nbsp;</div>
        <button onSubmit="/" >Restart</button><div>&nbsp;&nbsp;</div>
        <button disabled="true">bettercard</button><div>&nbsp;&nbsp;</div>
        </div>
    </div>
    </>
    )

  };
  
  export default Card;