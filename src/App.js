import { useEffect, useState } from 'react'
import './App.css'

import recipientApi from './api/recipient'

import GiftCodeEntry from './GiftCodeEntry'
import WishListEntry from './WishListEntry'
import GiftShop from './GiftShop'


function App() {
  const [recipient, setRecipient] = useState()
  const [giftExchangeEntry, setGiftExchangeEntry] = useState()
  const [currentStep, setCurrentStep] = useState("loading")

  useEffect(() => {
    recipientApi.get(window.location.href.split("/").slice(-1)[0]).then(setRecipient)
  }, [])

  useEffect(() => {
    recipient && setCurrentStep("redeem")
  }, [recipient])

  const steps = {
    "loading": <div>THE GIFTS ARE LOADING</div>,
    "redeem": <GiftCodeEntry recipient={recipient} next={() => setCurrentStep("wish-list")}/>,
    "wish-list": <WishListEntry recipient={recipient} next={(giftExchangeEntry) => {
      setCurrentStep("shop")
      setGiftExchangeEntry(giftExchangeEntry)
    }}/>,
    "shop": <GiftShop recipient={recipient} giftAssignment={giftExchangeEntry?.assignedGiftRecipient}/>
  }

  return steps[currentStep]
}

export default App
