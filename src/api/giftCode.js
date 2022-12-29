import axios from 'axios';


async function redeem(code, identityToken) {
  try {
    const response = await axios.post("/api/redeem/", { code, identityToken })
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export default { redeem }