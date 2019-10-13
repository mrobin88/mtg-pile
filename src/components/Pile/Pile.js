import React from 'react';
const Pile = (props) => {
  
  let piledNames = props.usersPile.map(ele =>{
    return <li> {ele.name} </li>
  })

    return (
        <ul>
          {piledNames}
        </ul>
        )
    }


 
export default Pile;