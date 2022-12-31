import { useEffect, useState } from "react"
import giftExchangeApi from "./api/giftExchange"

export default function GiftShop({ shopper, giftAssignment, next }) {

    const [items, setItems] = useState([])

    useEffect(() => {
        giftExchangeApi.getItems().then(setItems)
    }, [])

    async function selectGift({ imageUrl, inStock }) {
        if (!inStock) return

        await giftExchangeApi.selectGift(shopper.identityToken, imageUrl)
        next()
    }

    return <>
        <h1>Use your funds</h1>
        <p>We've decided unilaterally that the item you choose with your funds will be given to {giftAssignment.name} as a gift.</p>
        <p>{giftAssignment.name} would like {giftAssignment.itemWanted} for Christmas!</p> 
        <p>Select a gift to give from the choices below</p>
        {items.map((gift) => 
            <div className="gift-option-row" key={gift.imageUrl}>
                <img className={gift.inStock ? "in-stock-gift" : " out-of-stock-gift"} src={gift.imageUrl} onClick={() => selectGift(gift)}/>
                { !gift.inStock ? <div className="small-text">This item is out of stock!  Yes, we know, we are also shocked by this</div> : null }
            </div>
        )}
    </>
}