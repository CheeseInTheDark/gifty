const express = require('express')
const app = express()

const path = require('path')
const fs = require('fs')

const { staticDirectory, dataDirectory } = require('./settings')

const recipients = readData("recipients.json")
const giftCodesByRecipient = readData("gift-codes.json")

function readData(filepath) {
    return JSON.parse(fs.readFileSync(path.join(dataDirectory, filepath)))
}

function saveData(filepath, data) {
    fs.writeFileSync(path.join(dataDirectory, filepath), JSON.stringify(data))
}

app.get('/redeem/:cardtoken', (req, res) => {
    const recipientExists = Object.keys(recipients).includes(req.params.cardtoken)
   
    recipientExists ? 
        res.sendFile(path.join(staticDirectory, "index.html")) : 
        res.status(404).send()
})

app.get("/api/recipient/:identityToken", (req, res) => {
    const { identityToken } = req.params
    const recipient = { ...recipients[identityToken], identityToken }
    res.json(recipient)
})

app.post("/api/redeem", express.json(), (req, res) => {
    const matches = giftCodesByRecipient[req.body.identityToken] === req.body.code

    res.json({
        success: matches,
        message: matches ? undefined : "That code is not the right code.  I can't believe you've done this.  Contact technical support.  Wait.  I'm technical support.  Hm.  I might have to rethink this.  Okay, better idea, try again but like, enter the correct code this time.  Although you can also feel free to contact technical support and say hi."
    })
})

app.post("/api/gift-exchange", express.json(), (req, res) => {
    const giftExchange = readData("gift-exchange.json")

    const existingRecipients = Object.values(giftExchange).map(entry => entry.recipientToken)
    const needsGiftGiver = Object.keys(giftExchange).find(recipient => !existingRecipients.includes(recipient))

    giftExchange[req.body.identityToken] = {
        itemWanted: req.body.itemWanted,
        recipientToken: needsGiftGiver
    }
    
    if (Object.values(giftExchange).length === Object.keys(recipients).length) {
        const needsRecipient = Object.entries(giftExchange).find(([, entry]) => entry.recipientToken === undefined)[0]
        giftExchange[needsRecipient].recipientToken = req.body.identityToken
    }

    saveData("gift-exchange.json", giftExchange)

    res.json({
        assignedGiftRecipient: {
            name: recipients[needsGiftGiver].name,
            itemWanted: giftExchange[needsGiftGiver].itemWanted
        },
        itemWanted: req.body.itemWanted
    })
})

app.get("/api/gift-exchange/:identityToken", express.json(), (req, res) => {
    const giftExchange = readData("gift-exchange.json")

    const { recipientToken, itemWanted } = giftExchange[req.params.identityToken]
    const assignedWishListItem = giftExchange[recipientToken].itemWanted

    res.json({
        assignedGiftRecipient: {
            name: recipients[recipientToken].name,
            itemWanted: assignedWishListItem
        },
        itemWanted
    })
})

app.use(express.static(staticDirectory))

module.exports = app