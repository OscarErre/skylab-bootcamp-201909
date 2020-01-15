import React, { useEffect, useState, useContext } from 'react'
import Context from '../Context'
import './index.sass'
import { retrieveUser } from '../../logic'


export default function ({ onLogout, onShowCards, onGetNewCards, onStartGame }) {

    const [user, setUser] = useState()
    const {feed, setFeed} = useContext(Context)
    const [reward, setReward] = useState(false)
    

    useEffect(() => {
        
        (async () => {
            const { token } = sessionStorage
            if (token) {
                try {
                    const user = await retrieveUser(token)
                    setUser(user)

                    const now = new Date ()
                    const lastReward = new Date(user.lastReward)
                    if ((now - lastReward) > 86400000) setReward (true)
                } catch ({ message }) {
                    setFeed({ title: "🦖 There was an error:", message })
                }
            }
        })()
    }, [setUser])

    return <section className="home">
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
                </div>
            </div>
        }
        <section className="home__option" onClick={event => onShowCards()}>
            <div class="card-front"></div>
            <div class="card-back">
                <h2>Your cards</h2>
            </div>
        </section>
        {reward ? <section className="home__option" onClick={event => onGetNewCards()}>
                        <div class="card-front"></div>
                        <div class="card-back">
                            <h2>Get new cards</h2>
                        </div>
                    </section>
                    :
                    <section className="home__option home__option--disabled">
                        <div className="card-front"></div>
                        <div className="card-back"> Come back tomorrow to get a new Card!</div>
                    </section>
        }
        <section className="home__option" onClick={event => onStartGame()}>
            <div class="card-front"></div>
            <div class="card-back">
                <h2>Start new GAME</h2>
            </div>
        </section>
        <div className="home__side">
            <section className="home__option home__option--small">
                Rewards
                </section>
            <section className="home__option home__option--small">
                Ranking
                </section>
            <section className="home__option home__option--small">
                Invite Friends
                </section>
            <section className="home__option home__option--small">
                The collections
                </section>
        </div>
        <div className="home__footer home-footer">
            <span className="home__footer home-footer__item">About Baam!!</span> -
                <span className="home__footer home-footer__item">Report a bug</span> -
                <span className="home__footer home-footer__item">Contact Us</span> -
                <span className="home__footer home-footer__item">Make your Card suggeriments</span>
        </div>
    </section>
}