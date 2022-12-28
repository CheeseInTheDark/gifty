import axios from 'axios';


async function redeem(code) {
  try {
    const response = await axios.post("/api/redeem/", { code })
    return response.data
  } catch(error) {
    console.log(error)
  }
}

export default { redeem }