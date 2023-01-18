import { useEffect, useState } from "react"

import giftExchangeApi from "./api/giftExchange"
import decorationApi from "./api/decorations"

import Dialog from "./Dialog"
import Decoration from "./Decoration"
import DecorationToolbar from "./DecorationToolbar"
import { useCookies } from "react-cookie"

export default function TreeView({ giftExchangeEntry, initialShowGiftSent }) {
    const [showGiftSent, setShowGiftSent] = useState(initialShowGiftSent)
    const [gifts, setGifts] = useState([])
    const [selectedGift, setSelectedGift] = useState()
    const [selectedDecoration, setSelectedDecoration] = useState()
    const [decorationsOnTree, setDecorationsOnTree] = useState([])

    const [{ identityToken }] = useCookies(['identityToken'])        

    useEffect(() => {  
        giftExchangeApi.getGivenGifts().then(setGifts)
        decorationApi.get().then(setDecorationsOnTree)
    }, [])

    function closeGiftSent() {
        setShowGiftSent(false)
    }

    function closeGiftInfo() {
        setSelectedGift(undefined)
    }

    function placeDecoration(clickEvent) {
        if (!selectedDecoration) return

        const toAdd = {
            type: selectedDecoration,
            x: clickEvent.nativeEvent.offsetX,
            y: clickEvent.nativeEvent.offsetY
        }
        
        console.log(selectedDecoration)

        decorationApi.add(toAdd, identityToken)
        setDecorationsOnTree([...decorationsOnTree, toAdd])
    }

    return <>
        { showGiftSent ? <Dialog onBackgroundClick={closeGiftSent}>
            <div>Your gift for {giftExchangeEntry?.assignedGiftRecipient?.name} is on its way!  We are so happy you've redeemed your gift card.  Really.  We're just thrilled.  We do not regret losing some of the money which someone provided us for a potentially indefinite period and which we could have kept forever if you hadn't sent that gift.  So thank you!</div>
            <button onClick={closeGiftSent}>Why are you showing me a popup?  Get this thing out of here</button>
        </Dialog> : null }
        { selectedGift ? <Dialog onBackgroundClick={closeGiftInfo}>
            <p>From {selectedGift.from}</p> 
            <p>To {selectedGift.to} </p>
            <p>...because you wanted {selectedGift.itemWanted}</p>
            <div className="gift-container">
                <img src={selectedGift.gift}/>
            </div>
            <button onClick={closeGiftInfo}>You can make this box go away now</button>
        </Dialog> : null }
        { identityToken ? <DecorationToolbar onDecorationSelected={setSelectedDecoration}/> : null }
        <div className="tree-container">
            <div style={{position: 'relative'}}>
                <img alt="Christmas tree" onClick={placeDecoration} src="/images/tree.png"/>
                {decorationsOnTree.map((decoration, index) => 
                    <Decoration {...decoration} key={index + decoration.type}/>)}
            </div>
            <div className="gifts-container">
            {
                gifts.map((gift, index) => <img src={`/images/gift${index + 1}.png`} key={gift.gift} onClick={() => setSelectedGift(gift)}/>)
            }
            </div>
        </div>
    </>
}
