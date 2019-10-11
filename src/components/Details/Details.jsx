import React from 'react';
const Details = (props) => {
    
    return ( 
        <div>
            <p>{props.Details[0].flavor}</p>
            <h3>Name: {props.Details[0].name}</h3>
            <p>Text: {props.Details[0].text}</p>
            <p>Converted Mana Cost{props.Details[0].cmc}</p>
             <span>Color(s):</span>{props.Details[0].colors.map(
                function(col) {
                    return<p>{col}</p>
                })
                } 
                
            
        </div>
     );
}
 
export default Details;