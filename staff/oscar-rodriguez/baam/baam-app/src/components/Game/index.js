import React from 'react'
import './index.sass'
export default function ({user, onLogout, onCreate, onJoin, onHome}) {
    return <section className="game">
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
                    <a href="#" className="upper-menu__item" onClick={event => { event.preventDefault(); event.stopPropagation(); onLogout() }}>Log out</a>
                    <a href="#" className="upper-menu__item" onClick={event => { event.preventDefault(); event.stopPropagation(); onHome() }}>HOME</a>
                </div>
            </div>
        }
        <div className="game__option" onClick={event => onCreate()}>
            <h2>Create a new Game</h2>
        </div>
        <div className="game__option" onClick={event => onJoin()}>
            <h2>Join a Game</h2>
        </div>   
    </section>
}