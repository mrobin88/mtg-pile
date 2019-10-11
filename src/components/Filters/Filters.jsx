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
                placeholder="contains or is named"
                name="name"
                value={this.name} 
                onChange={this.props.handleFilterChange}
                />
                <select name="setName" onChange={this.props.handleFilterChange}>
                {mtgSets.map(sname =><option value={sname} >{sname}</option>)}</select>
                
                <select name = "type" onChange={this.props.handleFilterChange}>
                {mtgTypes.map(type =><option value={type} >{type}</option>)}</select>

                <select name="colors" onChange={this.props.handleFilterChange}>
                {colors.map(col =><option value={[col]}>{col}</option>)}</select>
                
                <select name="rarity"onChange={this.props.handleFilterChange}>
                {rarity.map(rare =><option value={rare}>{rare}</option>)}</select>

                <form  onSubmit={this.props.handleFilterSubmit}>
                    <button className={styles.searchBtn} type="submit">Search</button>
                </form>
            </section>
        )
            
        
    
}
}
 
export default Filter;