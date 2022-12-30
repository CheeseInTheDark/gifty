import { useEffect, useState } from 'react'
import './App.css'

import recipientApi from './api/recipient'
import giftExchangeApi from './api/giftExchange'

import GiftCodeEntry from './GiftCodeEntry'
import WishListEntry from './WishListEntry'
import GiftShop from './GiftShop'
import TreeView from './TreeView'


function App() {
  const [recipient, setRecipient] = useState()
  const [giftExchangeEntry, setGiftExchangeEntry] = useState()
  const [currentStep, setCurrentStep] = useState("loading")
  const [showGiftSent, setShowGiftSent] = useState()

  async function initialize() {
    const recipientToken = window.location.href.split("/").slice(-1)[0]
    const [giftExchangeInfo, recipient] = await Promise.all([giftExchangeApi.get(recipientToken), recipientApi.get(recipientToken)])

    setRecipient(recipient)
    setGiftExchangeEntry(giftExchangeInfo)

    const isInGiftExchange = !!giftExchangeInfo
    const hasAssignedPerson = !!giftExchangeInfo?.assignedGiftRecipient
    const hasGivenGift = giftExchangeInfo?.assignedGiftRecipient?.itemReceived

    const steps = {
      "redeem": !recipient.redeemed,
      "wish-list": !isInGiftExchange,
      "shop": hasAssignedPerson && !hasGivenGift,
      "tree": true
    }

    const currentStep = Object.entries(steps).find(([, isNext]) => isNext)[0]

    setShowGiftSent(currentStep !== "tree")
    setCurrentStep(currentStep)
  }

  useEffect(() => {
    initialize()
  }, [])

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
    "tree": <TreeView giftExchangeEntry={giftExchangeEntry} initialShowGiftSent={showGiftSent} />
  }

  return steps[currentStep]
}

export default App
