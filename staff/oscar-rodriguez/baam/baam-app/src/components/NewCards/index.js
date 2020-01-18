import React, { useState, useEffect, useContext } from 'react'
import Context from '../Context'
import './index.sass'
import { retrieveUser, retrieveRandomCards, updateUserCards } from '../../logic'

export default function ({onLogout, onHome, history}) {

    const {feed, setFeed } = useContext(Context)

    const [cards, setCards] = useState()
    const [user, setUser] = useState()
    
    const { token } = sessionStorage
    
    useEffect(() => {
        (async () => {
            if (token) {
                try {
                    const user = await retrieveUser(token)
                    setUser(user)
                    const randomCards = await retrieveRandomCards(3)
                    setCards(randomCards)
                    
                } catch ({ message }) {
                    setFeed({ title: "🦖 There was an error:", message })
                }
            }
        })()
    }, [sessionStorage.token])
    
    async function handleSelectCard (card) {
        
        await updateUserCards(token, [card])
    
        setFeed({ title: "💬 Great!!", message: "The selected Card was added to you collection!" })

        history.push('/')
    }

    return <section class="new-cards">
    {user &&
        <div className="upper-menu">
            <div className="upper-menu__container">
                <div className="upper-menu__item">wins: {user.stats.wins}</div>
                <div className="upper-menu__item">ties: {user.stats.ties}</div>
                <div className="upper-menu__item">loses: {user.stats.loses}</div>
            </div>
            <div className="upper-menu__container">
                <div className="upper-menu__item">💰: {user.coins}</div>
            </div>
            <div className="upper-menu__container">
                <div className="upper-menu__item">Hello {user.nickname}</div>
                <a href="#" className="upper-menu__item" onClick={event => onLogout()}>Log out</a>
                <a href="#" className="upper-menu__item" onClick={event => { event.preventDefault(); onHome() }}>HOME</a>
            </div>
        </div>
    }
    <div class="new-cards__title">TODAY, YOU CAN CHOOSE BETWEEN THIS CARDS:</div>
    <div class="new-cards__random random">
        {cards && cards.map(card =>
            <div class="your-cards__card-detail" onClick={event => {
                event.preventDefault()
                handleSelectCard(card)
            }}>
                <img class="your-cards__card-front" src={`img/${card.image}`}></img>
                <div class="your-cards__card-back"> 
                    <p>{`Name: ${card.name}`}</p>
                    <p>{`Description: ${card.description}`}</p>
                    <p>{`Price: ${card.price}`}</p>
                </div>
            </div>)}
    </div>
    </section>
}