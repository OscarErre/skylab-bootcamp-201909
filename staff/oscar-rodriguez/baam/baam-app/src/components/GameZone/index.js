import React, {useState} from 'react'
import './index.sass'

export default function ({gameZone, onDropCard}) {

    function allowDrop (event) {
        event.preventDefault()
    }

    return <div className="game-zone" onDragOver={event=> allowDrop(event)} onDrop={event=>onDropCard(event)}>
        {gameZone.length > 0 ? <img draggable="false" className="card card--played" src={`img/${gameZone[gameZone.length-1].card.image}`}></img> : "GAME ZONE"}</div>
}