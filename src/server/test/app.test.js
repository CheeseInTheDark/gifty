import request from 'supertest'
import fs from 'fs'
import 'core-js'
import path from 'path'

jest.mock('../settings', () => {    
    const path = require('path')
    return {
        port: 5001,
        staticDirectory: path.join(__dirname + "/temp/public"),
        dataDirectory: path.join(__dirname + "/temp/data")
}
})

const publicPath = "./src/server/test/temp/public/"
const dataPath = "./src/server/test/temp/data/"

describe("app", () => {
    
    let subject
    
    beforeEach(async () => {
        fs.mkdirSync(publicPath, { recursive: true })
        fs.mkdirSync(dataPath, { recursive: true })

        fs.writeFileSync(path.join(publicPath, "index.html"), "Cool index place")

        fs.writeFileSync(path.join(dataPath, "recipients.json"), JSON.stringify({
            "coolidentitytoken": {
                "name": "Charlie"
            },
            "woobular": {
                "name": "Gift Person"
            },
            "Tubular": {
                "name": "Person with tubes"
            }
        }))

        fs.writeFileSync(path.join(dataPath, "gift-exchange.json"), JSON.stringify({
            "woobular": {
                "itemWanted": "bag o bricks"
            }
        }))

        fs.writeFileSync(path.join(dataPath, "gift-codes.json"), JSON.stringify({
            "woobular": "1234",
            "Tubular": "4334"
        }))

        fs.writeFileSync(path.join(dataPath, "gift-options.json"), JSON.stringify([
            "some image URL",
            "another image URL"
        ]))

        subject = require('../app')
    })
    
    afterEach(done => {
        fs.rmdirSync('./src/server/test/temp/', { recursive: true, force: true })

        jest.resetModules()
        done()
    })
    
    describe("app", () => {
        it("serves index", async () => {
            const response = await request(subject).get("/")

            expect(response.text).toEqual("Cool index place")
        })

        it("serves the index page for subpaths under redeem", async () => {
            let response = await request(subject).get("/redeem/woobular")
            expect(response.status).toBe(200)
            expect(response.text).toEqual("Cool index place")

            response = await request(subject).get("/redeem/Tubular")
            expect(response.status).toBe(200)
            expect(response.text).toEqual("Cool index place")
        })

        it("returns a 404 for redeem paths for which there is no token", async () => {
            let response = await request(subject).get("/redeem/notathing")

            expect(response.status).toBe(404)
        })
    })

    describe("/api/recipient GET", () => {
        it("returns the name of the recipient with the given token", async () => {
            let response = await request(subject).get("/api/recipient/woobular")

            expect(JSON.parse(response.text)).toEqual({name: "Gift Person", identityToken: "woobular"})
        })
    })

    describe("/api/redeem POST", () => {
        it("returns success if the code matches for the given token", async () => {
            let response = await request(subject).post("/api/redeem").send({
                code: "1234", 
                identityToken: "woobular"
            })

            expect(JSON.parse(response.text)).toEqual({ success: true })

            response = await request(subject).post("/api/redeem").send({
                code: "4334", 
                identityToken: "Tubular"
            })

            expect(JSON.parse(response.text)).toEqual({ success: true })
        })

        it("returns a failure message if the code does not match for the given token", async () => {
            let response = await request(subject).post("/api/redeem").send({
                code: "1234", 
                identityToken: "Tubular"
            })

            expect(JSON.parse(response.text)).toMatchObject({ success: false, message: expect.stringMatching(/.+/) })
        })
    })

    describe("/api/gift-exchange/ POST", () => {
        it("returns what the person joining the exchange needs to get and for who", async () => {
            let response = await request(subject).post("/api/gift-exchange").send({
                itemWanted: "Suggestion Box",
                identityToken: "Tubular"
            })

            expect(JSON.parse(response.text)).toMatchObject({
                assignedGiftRecipient: {
                    name: "Gift Person",
                    itemWanted: "bag o bricks"
                },
                itemWanted: "Suggestion Box"
            })
        })

        it("assigns the joining person to give a gift to whoever currently has a wish list and no gift giver", async () => {
            await request(subject).post("/api/gift-exchange").send({
                itemWanted: "Suggestion Box",
                identityToken: "Tubular"
            })

            const giftExchangeInfo = JSON.parse(fs.readFileSync(path.join(dataPath, "gift-exchange.json")))

            expect(giftExchangeInfo).toEqual({
                "woobular": {
                    "itemWanted": "bag o bricks"
                },
                "Tubular": {
                    "recipientToken": "woobular",
                    "itemWanted": "Suggestion Box"
                }
            })
        })

        it("assigns the initial member of the pool to give a gift to the last person to join", async () => {
            await request(subject).post("/api/gift-exchange").send({
                itemWanted: "Suggestion Box",
                identityToken: "Tubular"
            })

            await request(subject).post("/api/gift-exchange").send({
                itemWanted: "Pony",
                identityToken: "coolidentitytoken"
            })

            const giftExchangeInfo = JSON.parse(fs.readFileSync(path.join(dataPath, "gift-exchange.json")))

            expect(giftExchangeInfo).toEqual({
                "woobular": {
                    "recipientToken": "coolidentitytoken",
                    "itemWanted": "bag o bricks"
                },
                "Tubular": {
                    "recipientToken": "woobular",
                    "itemWanted": "Suggestion Box"
                },
                "coolidentitytoken": {
                    "recipientToken": "Tubular",
                    "itemWanted": "Pony"
                }
            })
        })
    })

    describe("/api/gift-exchange/:identitytoken GET", () => {
        it("returns the gift exchange info if it exists", async () => {
            await request(subject).post("/api/gift-exchange").send({
                itemWanted: "Suggestion Box",
                identityToken: "Tubular"
            })

            const response = await request(subject).get("/api/gift-exchange/Tubular")

            expect(JSON.parse(response.text)).toEqual({
                assignedGiftRecipient: {
                    name: "Gift Person",
                    itemWanted: "bag o bricks"
                },
                itemWanted: "Suggestion Box"
            })
        })
    })

    describe("/api/gift-exchange/items GET", () => {
        it("returns the list of gifts", async () => {
            const response = await request(subject).get("/api/gift-exchange/items")

            expect(JSON.parse(response.text)).toEqual([
                {
                    imageUrl: "some image URL",
                    inStock: true
                }, {
                    imageUrl: "another image URL",
                    inStock: true
                }
            ])
        })
    })
})