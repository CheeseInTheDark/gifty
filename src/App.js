import { useEffect, useState } from 'react'
import './App.css'

import recipientApi from './api/recipient'
import giftExchangeApi from './api/giftExchange'

import GiftCodeEntry from './GiftCodeEntry'
import WishListEntry from './WishListEntry'
import GiftShop from './GiftShop'
import TreeView from './TreeView'
import { useCookies } from 'react-cookie'

function App() {
  const [recipient, setRecipient] = useState()
  const [giftExchangeEntry, setGiftExchangeEntry] = useState()
  const [currentStep, setCurrentStep] = useState("loading")
  const [showGiftSent, setShowGiftSent] = useState()

  const [cookies, setCookie, removeCookie] = useCookies(['identityToken'])

  function getToken() {
    const { href } = window.location

    return href.includes("redeem/") ? href.split("/").slice(-1)[0] : cookies.identityToken
  }

  async function initialize() {
    const recipientToken = getToken()
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

    if (recipient.redeemed) rememberRecipient(recipient)
  }

  function rememberRecipient(recipient) {
    const nextYear = new Date()
    nextYear.setFullYear(new Date().getFullYear() + 1)
    setCookie("identityToken", recipient.identityToken, { path: "/", expires: nextYear })
  }

  useEffect(() => {
    initialize()
  }, [])

  const steps = {
    "loading": <div>THE GIFTS ARE LOADING</div>,
    "redeem": <GiftCodeEntry recipient={recipient} next={() => {
      rememberRecipient(recipient)
      setCurrentStep("wish-list")
    }} />,
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
