import subject from '../../api/giftExchange'
import axios from 'axios'

describe("gift exchange api", () => {

    test("join posts the identity and the wish list item", () => {
        jest.spyOn(axios, "post")

        subject.join("EXCELLENT ITEM", "someone's cool identity token")
    
        expect(axios.post).toHaveBeenCalledWith("/api/gift-exchange", { 
            identityToken: "someone's cool identity token",
            itemWanted: "EXCELLENT ITEM" 
        })
    })

    test("returns the result from response", async () => {
        jest.spyOn(axios, "post").mockImplementation(() => Promise.resolve({ data: "Response" }))

        const result = await subject.join("Itemememem", "yet another cool token")

        expect(result).toEqual("Response")
    })

    test("consumes exceptions", async () => {
        jest.spyOn(axios, "post").mockImplementation(() => Promise.reject())

        await subject.join("Please explode please", "a token, again again")
    })
})