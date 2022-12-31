import request from 'supertest'
import fs from 'fs'
import 'core-js'
import path from 'path'
import { isObject } from 'util'

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

        fs.writeFileSync(path.join(dataPath, "redeemed-cards.json"), JSON.stringify(["woobular"]))

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
        it("returns the name and redemption status of the recipient with the given token", async () => {
            let response = await request(subject).get("/api/recipient/woobular")

            expect(JSON.parse(response.text)).toEqual({name: "Gift Person", redeemed: true, identityToken: "woobular"})

            response = await request(subject).get("/api/recipient/Tubular")

            expect(JSON.parse(response.text)).toEqual({name: "Person with tubes", redeemed: false, identityToken: "Tubular"})
        })
    })

    describe("/api/redeem POST", () => {
        describe("if the code matches the given token", () => {
            let response1
            let response2

            beforeEach(async () => {
                response1 = await request(subject).post("/api/redeem").send({
                    code: "1234", 
                    identityToken: "woobular"
                })

                response2 = await request(subject).post("/api/redeem").send({
                    code: "4334", 
                    identityToken: "Tubular"
                })
            })

            it("returns success if the code matches for the given token", async () => {
                expect(JSON.parse(response1.text)).toEqual({ success: true })
                expect(JSON.parse(response2.text)).toEqual({ success: true })
            })

            it("updates the recipients' redemption statuseses", async () => {
                const redeemedCards = JSON.parse(fs.readFileSync(path.join(dataPath, "redeemed-cards.json")))

                expect(redeemedCards).toHaveLength(2)
                expect(redeemedCards).toEqual(expect.arrayContaining(["woobular", "Tubular"]))
            })
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

        it("omits the assigned gift recipient if nobody has been assigned yet", async () => {
            const response = await request(subject).get("/api/gift-exchange/woobular")

            expect(JSON.parse(response.text)).toEqual({
                itemWanted: "bag o bricks"
            })
        })

        it("returns the gift given if it exists", async () => {
            await request(subject).post("/api/gift-exchange").send({
                itemWanted: "Suggestion Box",
                identityToken: "Tubular"
            })
            await request(subject).post("/api/gift-exchange/Tubular/selected-gift").send({
                gift: "some image URL"
            })

            const response = await request(subject).get("/api/gift-exchange/Tubular")

            expect(JSON.parse(response.text)).toEqual({
                assignedGiftRecipient: {
                    name: "Gift Person",
                    itemWanted: "bag o bricks",
                    itemReceived: "some image URL"
                },
                itemWanted: "Suggestion Box"
            })
        })
    })

    describe("/api/gift-exchange/:identitytoken/selected-gift POST", () => {
        it("returns 404 when there is no gift exchange record for the requestor", async () => {
            const response = await request(subject).post("/api/gift-exchange/bwooog/selected-gift").send({
                gift: "some image URL"
            })

            expect(response.status).toBe(404)
        })

        describe("when there is a gift exchange record for the requestor with a recipient", () => {
            beforeEach(() => {
                fs.writeFileSync(path.join(dataPath, "gift-exchange.json"), JSON.stringify({
                    "woobular": {
                        "itemWanted": "bag o bricks",
                        "recipientToken": "Tubular"
                    }
                }))
            })

            it("returns 400 when the gift is not in the options list", async () => {
                const response = await request(subject).post("/api/gift-exchange/woobular/selected-gift").send({
                    gift: "some malicious image URL.  Shame on you."
                })

                expect(response.status).toBe(400)
            })

            it("returns an error message when someone has already selected a gift", async () => {
                await request(subject).post("/api/gift-exchange/woobular/selected-gift").send({
                    gift: "some image URL"
                })

                const response = await request(subject).post("/api/gift-exchange/woobular/selected-gift").send({
                    gift: "some image URL"
                })

                expect(JSON.parse(response.text)).toEqual({
                    success: false,
                    message: "You've already selected a gift.  Stop trying to get more gifts for free.",
                    gift: "some image URL"
                })
            })

            describe("and the gift is in stock and matches a gift in the options list", () => {
                let response

                beforeEach(async () => {
                    response = await request(subject).post("/api/gift-exchange/woobular/selected-gift").send({
                        gift: "some image URL"
                    })
                })

                it("returns success", async () => {
                    expect(JSON.parse(response.text)).toEqual({
                        success: true,
                        gift: "some image URL"
                    })
                })
        
                it("updates the gift someone has received", async () => {
                    const giftExchangeInfo = JSON.parse(fs.readFileSync(path.join(dataPath, "gift-exchange.json")))

                    expect(giftExchangeInfo).toEqual({
                        "woobular": {
                            "itemWanted": "bag o bricks",
                            "recipientToken": "Tubular",
                            "itemGivenToRecipient": "some image URL"
                        }
                    })
                })
            })

            describe("and the gift is no longer in stock, but matches a gift in the options list", () => {
                let response

                beforeEach(async () => {
                    fs.writeFileSync(path.join(dataPath, "gift-exchange.json"), JSON.stringify({
                        "woobular": {
                            "itemWanted": "bag o bricks",
                            "recipientToken": "Tubular"
                        },
                        "Tubular": {
                            "itemWanted": "bigger bag o bricks",
                            "recipientToken": "woobular",
                            "itemGivenToRecipient": "some image URL"
                        }
                    }))

                    response = await request(subject).post("/api/gift-exchange/woobular/selected-gift").send({
                        gift: "some image URL"
                    })
                })

                it("returns failure with a message", async () => {
                    expect(JSON.parse(response.text)).toEqual({
                        success: false,
                        message: "This gift just ran out of stock!  Try another one",
                        gift: "some image URL"
                    })
                })
        
                it("does not update the gift someone has received", async () => {
                    const giftExchangeInfo = JSON.parse(fs.readFileSync(path.join(dataPath, "gift-exchange.json")))

                    expect(giftExchangeInfo).toEqual({
                        "woobular": {
                            "itemWanted": "bag o bricks",
                            "recipientToken": "Tubular"
                        },
                        "Tubular": {
                            "itemWanted": "bigger bag o bricks",
                            "recipientToken": "woobular",
                            "itemGivenToRecipient": "some image URL"
                        }
                    })
                })
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

    describe("/api/gift-exchange/gifts GET", () => {
        it("returns given gifts with names", async () => {
            fs.writeFileSync(path.join(dataPath, "gift-exchange.json"), JSON.stringify({
                "woobular": {
                    "itemWanted": "bag o bricks",
                    "recipientToken": "Tubular",
                    "itemGivenToRecipient": "some image URL"
                },
                "Tubular": {
                    "itemWanted": "bottle caps",
                    "recipientToken": "woobular",
                    "itemGivenToRecipient": "more image URL"
                }
            }))

            const response = await request(subject).get("/api/gift-exchange/gifts")

            expect(JSON.parse(response.text)).toEqual(expect.arrayContaining([
                {
                    from: "Gift Person",
                    to: "Person with tubes",
                    gift: "some image URL"
                },
                {
                    from: "Person with tubes",
                    to: "Gift Person",
                    gift: "more image URL"
                }
            ]))
        })

        it("does not return gifts that haven't been given yet", async () => {
            fs.writeFileSync(path.join(dataPath, "gift-exchange.json"), JSON.stringify({
                "woobular": {
                    "itemWanted": "bag o bricks",
                    "recipientToken": "Tubular"
                }
            }))

            const response = await request(subject).get("/api/gift-exchange/gifts")

            expect(JSON.parse(response.text)).toHaveLength(0)
        })
    })
})