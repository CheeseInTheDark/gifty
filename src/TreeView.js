import { useEffect, useState } from "react"

import giftExchangeApi from "./api/giftExchange"

export default function TreeView({ giftExchangeEntry, initialShowGiftSent }) {
    const [showGiftSent, setShowGiftSent] = useState(initialShowGiftSent)
    const [gifts, setGifts] = useState([])
    const [selectedGift, setSelectedGift] = useState()

    useEffect(() => {
        giftExchangeApi.getGivenGifts().then(setGifts)
    }, [])

    return <>
        { showGiftSent ? <div>
            <div>Your gift for {giftExchangeEntry?.assignedGiftRecipient?.name} is on its way!  We are so happy you've redeemed your gift card.  Really.  We're just thrilled.  We do not regret losing some of the money which someone provided us for a potentially indefinite period and which we could have kept forever if you hadn't sent that gift.  So thank you!</div>
            <button onClick={() => setShowGiftSent(false)}>Why are you showing me a popup?  Get this thing out of here</button>
        </div> : null }
        { selectedGift ? <>
            <div>From {selectedGift.from} To {selectedGift.to} </div>
            <img src={selectedGift.gift}/>
            <button onClick={() => setSelectedGift(undefined)}>You can make this box go away now</button>
        </> : null }
        <img alt="Christmas tree" src="/images/tree.png"/>
        {
            gifts.map((gift, index) => <img src={`/images/gift${index + 1}.png`} key={gift.gift} onClick={() => setSelectedGift(gift)}/>)
        }
    </>
}
