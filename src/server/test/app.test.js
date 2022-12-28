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

        fs.writeFileSync(path.join(dataPath, "recipients.notjson"), JSON.stringify({
            "woobular": {
                "name": "Gift Person"
            },
            "Tubular": {
                "name": "Person with tubes"
            }
        }))

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

    describe("recipient", () => {
        it("returns the name of the recipient with the given token", async () => {
            let response = await request(subject).get("/api/recipient/woobular")

            expect(JSON.parse(response.text)).toEqual({name: "Gift Person"})
        })
    })
})