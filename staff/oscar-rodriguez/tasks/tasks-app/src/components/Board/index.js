import React from 'react'
import './index.sass'
import Container from '../Container'


export default function () {

    return <section class="tasks__board board">
        <Container title='TO DO' modifier='--todo' />
        <Container title='DOING' modifier='--doing' />
        <Container title='REVIEW' modifier='--review' />
        <Container title='DONE' modifier='--done' />
    </section>
}