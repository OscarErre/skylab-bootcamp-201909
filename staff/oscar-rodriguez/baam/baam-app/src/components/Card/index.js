import React from 'react'
import './index.sass'

export default function ({className, src, card, onDragCard, attack}) {
    const {effect} = card
    let dragable = effect != 'ATTACK' ? true : attack != 0 ? true : false

    if (!dragable) className+= ' card--not-playable'
    return <img className={className} src={src} id={card.id} draggable={dragable} onDragStart={event => onDragCard(event,card)}/>
}