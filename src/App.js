import { useEffect, useState } from 'react'
import './App.css'

import GiftCodeEntry from './GiftCodeEntry'
import WishListEntry from './WishListEntry'

import recipientApi from './api/recipient'

function App() {
  const [recipient, setRecipient] = useState()
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
    "wish-list": <WishListEntry recipient={recipient}/>
  }

  return steps[currentStep]
}

export default App
