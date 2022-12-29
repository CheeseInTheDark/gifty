import axios from 'axios'


async function get(token) {
  try {
    const response = await axios.get(`/api/recipient/${token}`)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export default { get }