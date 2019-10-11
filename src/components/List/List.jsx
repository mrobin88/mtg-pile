import React from 'react';
import styles from './List.module.css'

const List = (props) => {  
    let listedCard = props.cards.map(function(card){
        return(
    
            <li>
            <img src={card.imageUrl} alt={card.name} onClick={props.cardSelect}/>
                {card.name}
            </li>
        
        );
    });
    return(
        <ul className ={styles.theList}>
            {listedCard}
        </ul>
    )
}

 
export default List;