import React from 'react';
import styles from './Details.module.css'
const Details = (props) => {
    
    return ( 
        <div className={styles.container}>
            <div className={styles.card}>
            <p>{props.details[0].flavor}</p>
            <h3>Name: {props.details[0].name}</h3>
            <p>Text: {props.details[0].text}</p>
            <p>Converted Mana Cost: {props.details[0].cmc}</p>
             <>Color(s):{props.details[0].colors.map(
                function(col) {
                    return<p>{col}</p>
                })
                } </>
                
            </div>
        </div>
     );
}
 
export default Details;