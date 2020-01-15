import React, { useState, useEffect, useContext } from 'react'
import Context from '../Context'
import './index.sass'
import { retrieveUserCards } from '../../logic'

export default function ({game, onSelect}) {

    const [cards, setCards] = useState([])
    const [hand, setHand] = useState([])
    const { feed, setFeed } = useContext(Context)
    const [render, setRender] = useState(true)

    useEffect(() => {
        const { token } = sessionStorage;

        (async () => {
            if (token) {
                try {
                    if (cards.length === 0) {
                        setCards(await retrieveUserCards(token))
                    }
                } catch ({message}) {
                    setFeed({ title: "🦖 There was an error:", message })
                }
            }
        })()
    }, [setCards, setFeed, render])

    function deleteCard (card) {
        let index = hand.findIndex(_card=>_card.id === card)

        cards.push(hand[index])
        hand.splice(index,1)
        
        setHand(hand)
        setCards(cards)
        setRender(!render)
    }

    function validateHand () {
        if (hand.length === 5)

            onSelect(game, hand.map(card=>card.id))
    }

    function addCardToHand (card) {
        
        let index = cards.findIndex(_card=>_card.id === card)
        hand.push(cards[index])
        cards.splice(index,1)
        
        setHand(hand)
        setCards(cards)
        setRender(!render)
    }

    return <section className="select-hand">
        <div className="select-hand__container">
            <div className="select-hand__title">SELECT YOUR HAND:</div>
            {cards && <div className="select-hand__card-detail">
                {cards.map(card => <img key={card.id} className="own-card" src={`img/${card.image}`} onClick={event => {event.preventDefault(); addCardToHand(card.id)}}></img>
                )}    
            </div>}
            <div className="select-hand__selected">
                <div className="drop-container">
                    {hand && hand.length > 0 ? <img className="card" onClick={event => {event.preventDefault(); deleteCard(event.target.id)}} id={hand[0].id} src={`img/${hand[0].image}`} /> : ""}
                </div>
                <div className="drop-container">
                    {hand && hand.length > 1 ? <img className="card" onClick={event => {event.preventDefault(); deleteCard(event.target.id)}} id={hand[1].id} src={`img/${hand[1].image}`} /> : ""}
                </div>
                <div className="drop-container">
                    {hand && hand.length > 2 ? <img className="card" onClick={event => {event.preventDefault(); deleteCard(event.target.id)}} id={hand[2].id} src={`img/${hand[2].image}`} /> : ""}
                </div>
                <div className="drop-container">
                    {hand && hand.length > 3 ? <img className="card" onClick={event => {event.preventDefault(); deleteCard(event.target.id)}} id={hand[3].id} src={`img/${hand[3].image}`} /> : ""}
                </div>
                <div className="drop-container">
                    {hand && hand.length > 4 ? <img className="card" onClick={event => {event.preventDefault(); deleteCard(event.target.id)}} id={hand[4].id} src={`img/${hand[4].image}`} /> : ""}
                </div>
                {hand && hand.length === 5 ? <div className="end-button--ready" onClick={event => {
                        event.preventDefault()
                        validateHand()
                }}> DONE </div> : <div className="end-button">{5-hand.length}</div>
                }
            </div>
        </div>
    </section>
}