import { useEffect, useState } from 'react'
import './App.css'

import recipientApi from './api/recipient'

import GiftCodeEntry from './GiftCodeEntry'
import WishListEntry from './WishListEntry'
import GiftShop from './GiftShop'
import TreeView from './TreeView'


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
    "redeem": <GiftCodeEntry recipient={recipient} next={() => setCurrentStep("wish-list")} />,
    "wish-list": <WishListEntry recipient={recipient} next={(giftExchangeEntry) => {
      setCurrentStep("shop")
      setGiftExchangeEntry(giftExchangeEntry)
    }} />,
    "shop": <GiftShop shopper={recipient} giftAssignment={giftExchangeEntry?.assignedGiftRecipient} next={() => {
      setCurrentStep("tree")
    }} />,
    "tree": <TreeView giftExchangeEntry={giftExchangeEntry}/>
  }

  return steps[currentStep]
}

export default App
