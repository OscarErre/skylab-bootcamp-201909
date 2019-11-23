import React from 'react'
import './index.sass'
import Item from '../Item'

export default function ({title, modifier}) {

    return <div className={`board__container container${modifier} container`}>
    <h3 class="container__title">{title}</h3>
    <div class="container__list list">
        <Item title='title' description='Anim ea culpa dolore cupidatat nostrud est ipsum aliquip elit.' />
        <Item title='title' description='Laboris ipsum ea aute fugiat consequat incididunt sunt esse veniam laboris laborum aliqua duis aliquip.' />
        <Item title='title' description='Veniam elit incididunt consequat laborum dolor deserunt ad ut magna esse.' />
    </div>
    <div class="container__add">✚ new task</div>
</div>

}