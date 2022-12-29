import subject from '../../api/giftCode'
import axios from 'axios'

describe("redeem gift code api", () => {

    test("sends gift code", () => {
        jest.spyOn(axios, "post")

        subject.redeem("EXCELLENT CODE", "someone's cool identity token")
    
        expect(axios.post).toHaveBeenCalledWith("/api/redeem/", { 
            identityToken: "someone's cool identity token",
            code: "EXCELLENT CODE" 
        })
    })

    test("returns result from response", async () => {
        jest.spyOn(axios, "post").mockImplementation(() => Promise.resolve({ data: { result: { success: true } } }))

        const result = await subject.redeem("Whoahhh coooode", "yet another cool token")

        expect(result).toEqual({ result: { success: true } })
    })

    test("consumes exceptions", async () => {
        jest.spyOn(axios, "post").mockImplementation(() => Promise.reject())

        await subject.redeem("Please explode please", "a token, again")
    })
})