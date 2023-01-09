import axios from "axios"

async function add(decoration, identityToken) {
    try {
        const response = await axios.post(`/api/decoration`, { identityToken, decoration })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

async function get() {
    try {
        const response = await axios.get(`/api/decoration`)
        return response.data
    } catch (error) {
        console.log(error)
        return []
    }
}


export default { add, get }