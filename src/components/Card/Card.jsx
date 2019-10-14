import React from 'react';
import styles from './Card.module.css'
import { useAlert } from "react-alert";

const Card = (props) => {

    const alert = useAlert()
  const addCardToPile = () => {

    if(props.user && !props.usersPile.includes(props.details[0])){
        props.addCardToPile()
    
    }else if (!props.user){
    // alert.error( "login to make piles")
    }else{
    // alert.info("this card was added")
    }
  }
    return (
    <>
    <div className={styles.cMenu}>
    <img alt='mtg card back' src={props.display}>   
    </img>
    <div className={styles.cardOpt}>

        <button onClick={addCardToPile} > Pile+ </button><div>&nbsp;&nbsp;</div>
        <button > Restart </button><div>&nbsp;&nbsp;</div>
        <button > bettercard </button><div>&nbsp;&nbsp;</div>
        </div>
    </div>
    </>
    )

  };
  
  export default Card;
