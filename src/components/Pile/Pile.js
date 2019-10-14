import React from 'react';
import styles from './Pile.module.css'
const Pile = (props) => {

  let piledNames = props.usersPile.map(ele => {
    return <li> {ele.name} </li>
  })
  return (
    <div className={styles.pileContainer}>
      <ul>
        {piledNames}
      </ul><input
        className={styles.namePile}
        placeholder="Name"
        name="name"
        value={props.usersPile.name}
        onChange={props.pDataChange}
      />
      <input
        className={styles.pileNote}
        placeholder="contains or is named"
        name="notes"
        value={props.usersPile.notes}
        onChange={props.pDataChange}
      />
      <button onClick={props.savePile}>Save Pile</button>
      </div>
 
  )
}



export default Pile;