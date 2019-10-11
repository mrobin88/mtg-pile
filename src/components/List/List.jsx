import React from 'react';


const List = (props) => {  
    let listedCard = props.cards.map(function(card){
        return(
        <>
            <img src={card.imageUrl} alt={card.name} onClick={props.cardSelect}/>
            <li>
                {card.name}
            </li>
        </>
        );
    });
    return(
        <ul>
            {listedCard}
        </ul>
    )
}

 
export default List;