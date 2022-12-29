import { useState } from "react"

export default function TreeView({ giftExchangeEntry }) {

    const [showGiftSent, setShowGiftSent] = useState(true)

    return <>
        { showGiftSent ? <div>
            <div>gift for {giftExchangeEntry?.assignedGiftRecipient.name}</div>
            <button onClick={() => setShowGiftSent(false)}>Why are you showing me a popup?  Get this thing out of here</button>
        </div> : null }
        <img alt="Christmas tree" src="/images/tree.png"/>
    </>
}