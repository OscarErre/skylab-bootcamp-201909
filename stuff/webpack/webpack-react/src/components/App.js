import React, { useReducer } from 'react'

function App() {
    const [num, dispatch] = useReducer(reducer,0);

    function reducer(date,cond){
        switch (cond) {
            case '+':
                return date + 1;
            case '-':
                return date - 1;
        }
    }
    return <div className='counter'>
            <p>{num}</p>
            <button onClick={() =>
                dispatch('+')
            }>+</button>
            <button onClick={() =>
                dispatch('-')
            }>-</button>
        </div>
    
}

export default App