import { useEffect, useState } from "react"

import giftExchangeApi from "./api/giftExchange"
import Dialog from "./Dialog"

export default function TreeView({ giftExchangeEntry, initialShowGiftSent }) {
    const [showGiftSent, setShowGiftSent] = useState(initialShowGiftSent)
    const [gifts, setGifts] = useState([])
    const [selectedGift, setSelectedGift] = useState()

    useEffect(() => {
        giftExchangeApi.getGivenGifts().then(setGifts)
    }, [])

    function closeGiftSent() {
        setShowGiftSent(false)
    }

    function closeGiftInfo() {
        setSelectedGift(undefined)
    }

    return <>
        { showGiftSent ? <Dialog onBackgroundClick={closeGiftSent}>
            <div>Your gift for {giftExchangeEntry?.assignedGiftRecipient?.name} is on its way!  We are so happy you've redeemed your gift card.  Really.  We're just thrilled.  We do not regret losing some of the money which someone provided us for a potentially indefinite period and which we could have kept forever if you hadn't sent that gift.  So thank you!</div>
            <button onClick={closeGiftSent}>Why are you showing me a popup?  Get this thing out of here</button>
        </Dialog> : null }
        { selectedGift ? <Dialog onBackgroundClick={closeGiftInfo}>
            <p>From {selectedGift.from}</p>
            <p>To {selectedGift.to} </p>
            <div className="gift-container">
                <img src={selectedGift.gift}/>
            </div>
            <button onClick={closeGiftInfo}>You can make this box go away now</button>
        </Dialog> : null }
        <div className="tree-container">
            <img alt="Christmas tree" src="/images/tree.png"/>
            <div className="gifts-container">
            {
                gifts.map((gift, index) => <img src={`/images/gift${index + 1}.png`} key={gift.gift} onClick={() => setSelectedGift(gift)}/>)
            }
            </div>
        </div>
    </>
}
