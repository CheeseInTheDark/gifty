import axios from 'axios'
import subject from '../../api/decorations'

describe("decorations api", () => {

    describe("get", () => {
        test("gets the gifts that have been given", () => {
            jest.spyOn(axios, "get").mockImplementation(() => Promise.resolve({ data: "Response "}))

            subject.get()
        
            expect(axios.get).toHaveBeenCalledWith("/api/decoration")
        })

        test("returns the result from response", async () => {
            jest.spyOn(axios, "get").mockImplementation(() => Promise.resolve({ data: "Response" }))

            const result = await subject.get()

            expect(result).toEqual("Response")
        })

        test("consumes exceptions", async () => {
            jest.spyOn(axios, "get").mockImplementation(() => Promise.reject())

            expect(await subject.get()).toEqual([])
        })
    })

    describe("add", () => {
        test("posts the identity and the new decoration", () => {
            jest.spyOn(axios, "post").mockImplementation(() => Promise.resolve({ data: "Response "}))

            subject.add({ type: "Toast", x: 500000, y: NaN}, "someone's cool identity token")
        
            expect(axios.post).toHaveBeenCalledWith("/api/decoration", { 
                identityToken: "someone's cool identity token",
                decoration: { type: "Toast", x: 500000, y: NaN}
            })
        })

        test("returns the result from response", async () => {
            jest.spyOn(axios, "post").mockImplementation(() => Promise.resolve({ data: "Response" }))

            const result = await subject.add("Itemememem", "yet another cool token")

            expect(result).toEqual("Response")
        })

        test("consumes exceptions", async () => {
            jest.spyOn(axios, "post").mockImplementation(() => Promise.reject())

            await subject.add("Please explode please", "a token, again again")
        })
    })
})
