import { useState } from 'react'
import giftCodeApi from './api/giftCode'

export default function GiftCodeEntry({ recipient, next }) {
    const [enteredGiftCode, setEnteredGiftCode] = useState()
    const [giftCodeMessage, setGiftCodeMessage] = useState()

    async function submitCode() {
        const result = await giftCodeApi.redeem(
          enteredGiftCode, 
          recipient.identityToken
        )
    
        result.success ? next() : setGiftCodeMessage(result.message)
    }

    return <>
        <div>Welcome {recipient?.name}!</div>
        <div>Please enter the code shown on your captive funds card</div>
        <input onChange={event => {
            setEnteredGiftCode(event.target.value)
        }} />
        <button onClick={submitCode}>Redeem yo'self</button>
        {giftCodeMessage ? <div>{giftCodeMessage}</div> : null}
    </>
}