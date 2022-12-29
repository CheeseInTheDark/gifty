import axios from 'axios';


async function join(itemWanted, identityToken) {
    try {
        const response = await axios.post("/api/gift-exchange", { itemWanted, identityToken })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

async function getItems() {
    try {
        const response = await axios.get("/api/gift-exchange/items")
        return response.data
    } catch (error) {
        console.log(error)
    }
}

async function selectGift(identityToken, giftImageUrl) {
    try {
        const response = await axios.post(`/api/gift-exchange/${identityToken}/selected-gift`, { gift: giftImageUrl })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export default { join, getItems, selectGift }