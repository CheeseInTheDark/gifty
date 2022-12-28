import { useEffect, useState } from 'react'
import './App.css'

import getRecipient from './api/getRecipient'

function App({ initializeApp }) {

  const [recipient, setRecipient] = useState()

  useEffect(() => {
    getRecipient(window.location.href.split("/").slice(-1)).then(setRecipient)
  }, [])

  return (
    recipient ? 
    <div className="App">
      <div>Welcome {recipient?.name}!</div>
      <div>Please enter the code shown on your captive funds card</div>
      <input />
      <button>REDEEEEEEM</button>
    </div> : <div>THE GIFTS ARE LOADING</div>
  )
}

export default App
