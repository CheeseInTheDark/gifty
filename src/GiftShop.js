import { useEffect, useState } from "react"
import giftExchangeApi from "./api/giftExchange"
import Dialog from "./Dialog"

export default function GiftShop({ shopper, giftAssignment, next }) {

    const [items, setItems] = useState([])
    const [previewedItem, setPreviewedItem] = useState()

    useEffect(() => {
        giftExchangeApi.getItems().then(setItems)
    }, [])

    function previewGift({ imageUrl, inStock }) {
        if (!inStock) return

        setPreviewedItem(imageUrl)
    }

    async function confirmGift() {
        await giftExchangeApi.selectGift(shopper.identityToken, previewedItem)
        next()
    }

    return <>
        <h1>Use your funds</h1>
        <p>We've decided unilaterally that the item you choose with your funds will be given to {giftAssignment.name} as a gift.</p>
        <p>{giftAssignment.name} would like {giftAssignment.itemWanted} for Christmas!</p>
        <p>Select a gift to give from the choices below</p>
        {items.map((gift) =>
            <div className="gift-option-row" key={gift.imageUrl}>
                {previewedItem === gift.imageUrl ?
                    <div>
                        <img src={previewedItem} className="gift-full-screen" />
                        <div>Give this gift to {giftAssignment.name}?  Eh?</div>
                        <button onClick={() => setPreviewedItem(undefined)}>No thanks</button>
                        <button onClick={confirmGift} >Do eeeet</button>
                    </div>
                    :
                    <>
                        <img className={gift.inStock ? "in-stock-gift" : " out-of-stock-gift"} src={gift.imageUrl} onClick={() => previewGift(gift)} />
                        {!gift.inStock ? <div className="small-text">This item is out of stock!  Yes, we know, we are also shocked by this</div> : null}
                    </>
                }
            </div>
        )}
    </>
}