import React from 'react'
import './index.sass'

export default function ({tempZone}) {

    return <div className="temp-zone">
        {tempZone.length > 0 ? <img className="card card--played" src={`img/${tempZone.image}`}></img> : "TEMP ZONE"}
    </div>
}