import React, { Component } from 'react'
import Sets from './listHelperData/SetList.json'
import cTypes from'./listHelperData/CardTypes.json'

import styles from './Filters.module.css'

const colors = ['black','blue','red','white','green']
let mtgTypes = []
let mtgSets = []; Sets.filter(ele => mtgSets.push(ele.name)?(ele.type === "core" || ele.type === "expansion"):null)

const rarity = ["Common", "Uncommon", "Rare", "Mythic", "Special", "Basic Land"]
class Filter extends Component {
    constructor(props){
        super(props);
    }
    ctypes = cTypes.filter(ele => mtgTypes = Object.keys(ele.types))
    render(){
        return(
            <section>
                <input
                className={styles.nameSearch}
                placeholder="Name"
                name="name"
                value={this.name} 
                onChange={this.props.handleFilterChange}
                />
                <select className={styles.fSelect} name="setName" onChange={this.props.handleFilterChange}>
                <option value="" disabled selected>SET</option>
                {mtgSets.map(sname =><option value={sname} >{sname}</option>)}</select>
                
                <select className={styles.fSelect} name = "type" onChange={this.props.handleFilterChange}>
                <option value="" disabled selected>TYPE</option>
                {mtgTypes.map(type =><option value={type} >{type}</option>)}</select>

                <select className={styles.fSelect} name="colors" onChange={this.props.handleFilterChange}>
                <option value="" disabled selected>COLOR</option>
                {colors.map(col =><option value={[col]}>{col}</option>)}</select>
                
                <select className={styles.fSelect} name="rarity"onChange={this.props.handleFilterChange}>
                <option value="" disabled selected>RARITY</option>
                {rarity.map(rare =><option value={rare}>{rare}</option>)}</select>
                <div className={styles.filterBtns}>
                <form  onSubmit={this.props.handleFilterSubmit}>
                    <button className={styles.searchBtn} type="submit">Search</button>
                </form>
                <button className={styles.searchBtn} onClick={() => window.location.reload(false).then(this.props.resetFilter)}>Clear</button>
                </div>
            </section>
        )
            
        
    
}
}
 
export default Filter;