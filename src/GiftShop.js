import { useEffect, useState } from "react"
import giftExchangeApi from "./api/giftExchange"

export default function GiftShop({ shopper, giftAssignment }) {

    const [items, setItems] = useState([])

    useEffect(() => {
        giftExchangeApi.getItems().then(setItems)
    }, [])

    return <>
        <div>{giftAssignment.name} would like {giftAssignment.itemWanted} for Christmas!</div> 
        {items.map(({ imageUrl, inStock }) => 
            <div key={imageUrl}>
                
                <img src={imageUrl} onClick={() => inStock && giftExchangeApi.selectGift(shopper.identityToken, imageUrl)}/>
                { !inStock ? <div>This item is out of stock!  Yes, we know, we are also shocked by this</div> : null }
            </div>
        )}
    </>
}