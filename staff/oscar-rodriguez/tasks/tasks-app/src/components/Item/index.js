import React from 'react'
import './index.sass'

export default function ({title, description}) {
    return <div class="list__item item">
    <h2 class="item__title">{title}</h2>
    <p class="item__desc">{description}</p>
    <div class="item__remove"><button>Remove task</button></div>
</div>
}