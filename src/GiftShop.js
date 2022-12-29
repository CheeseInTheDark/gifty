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
        <div>{giftAssignment.name} would like {giftAssignment.itemWanted} for Christmas!</div> 
        {items.map((gift) => 
            <div key={gift.imageUrl}>
                <img src={gift.imageUrl} onClick={() => selectGift(gift)}/>
                { !gift.inStock ? <div>This item is out of stock!  Yes, we know, we are also shocked by this</div> : null }
            </div>
        )}
    </>
}