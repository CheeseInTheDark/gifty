import subject from '../../api/giftCode'
import axios from 'axios'

describe("redeem gift code api", () => {

    test("sends gift code", () => {
        jest.spyOn(axios, "post")

        subject.redeem("EXCELLENT CODE")
    
        expect(axios.post).toHaveBeenCalledWith("/api/redeem/", { 
            code: "EXCELLENT CODE" 
        })
    })

    test("returns result from response", async () => {
        jest.spyOn(axios, "post").mockImplementation(() => Promise.resolve({ data: { result: { success: true } } }))

        const result = await subject.redeem("Whoahhh coooode")

        expect(result).toEqual({ result: { success: true } })
    })

    test("consumes exceptions", async () => {
        jest.spyOn(axios, "post").mockImplementation(() => Promise.reject())

        await subject.redeem("Please explode please")
    })
})