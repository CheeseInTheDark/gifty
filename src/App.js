import { useEffect, useState } from 'react'
import './App.css'

import recipientApi from './api/recipient'
import giftCodeApi from './api/giftCode'

function App({ initializeApp }) {

  const [recipient, setRecipient] = useState()
  const [enteredGiftCode, setEnteredGiftCode] = useState()
  const [giftCodeMessage, setGiftCodeMessage] = useState()

  useEffect(() => {
    recipientApi.get(window.location.href.split("/").slice(-1)).then(setRecipient)
  }, [])

  async function submitCode() {
    const result = await giftCodeApi.redeem(
      enteredGiftCode, 
      window.location.href.split("/").slice(-1)[0]
    )

    if (!result.success) setGiftCodeMessage(result.message)
  }

  return (
    recipient ? 
    <div className="App">
      <div>Welcome {recipient?.name}!</div>
      <div>Please enter the code shown on your captive funds card</div>
      <input onChange={event => {
        setEnteredGiftCode(event.target.value)
      }}/>
      <button onClick={submitCode}>Redeem yo'self</button>
      {giftCodeMessage ? <div>{giftCodeMessage}</div> : null}
    </div> : <div>THE GIFTS ARE LOADING</div>
  )
}

export default App
