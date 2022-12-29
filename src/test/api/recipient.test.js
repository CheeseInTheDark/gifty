import subject from '../../api/recipient'
import axios from 'axios'

describe("recipient api", () => {
    test("adds token to path", () => {
        jest.spyOn(axios, "get").mockImplementation(() => Promise.resolve({ data: "Response "}))

        subject.get("some kinda token")
    
        expect(axios.get).toHaveBeenCalledWith("/api/recipient/some kinda token")
    })

    test("returns result from response", async () => {
        jest.spyOn(axios, "get").mockImplementation(() => Promise.resolve({ data: "Object with recipient data" }))

        const result = await subject.get("I lurv tokens")

        expect(result).toEqual("Object with recipient data")
    })

    test("consumes exceptions", async () => {
        jest.spyOn(axios, "get").mockImplementation(() => Promise.reject())

        await subject.get("Please explode pleassssse")
    })
})