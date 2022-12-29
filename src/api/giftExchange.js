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

async function selectGift() {

}

export default { join, getItems, selectGift }