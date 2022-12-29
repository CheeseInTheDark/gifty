import axios from 'axios';


async function join(itemWanted, identityToken) {
  try {
    const response = await axios.post("/api/gift-exchange", { itemWanted, identityToken })
    return response.data
  } catch(error) {
    console.log(error)
  }
}

export default { join }