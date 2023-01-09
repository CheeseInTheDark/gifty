const express = require('express')
const app = express()

const path = require('path')
const fs = require('fs')

const { staticDirectory, dataDirectory } = require('./settings')

const recipients = readData("recipients.json")
const giftCodesByRecipient = readData("gift-codes.json")
const giftOptions = readData("gift-options.json")

function readData(filepath) {
    return JSON.parse(fs.readFileSync(path.join(dataDirectory, filepath)))
}

function saveData(filepath, data) {
    fs.writeFileSync(path.join(dataDirectory, filepath), JSON.stringify(data))
}

app.get('/redeem/:cardtoken', (req, res) => {
    const recipientExists = Object.keys(recipients).includes(req.params.cardtoken)
   
    recipientExists ? 
        res.sendFile(path.resolve(staticDirectory, "index.html")) : 
        res.status(404).send()
})

app.get("/api/recipient/:identityToken", (req, res) => {
    const { identityToken } = req.params
    const redeemedCards = readData("redeemed-cards.json")
    const recipient = { ...recipients[identityToken], identityToken, redeemed: redeemedCards.includes(identityToken) }
    res.json(recipient)
})

app.post("/api/redeem", express.json(), (req, res) => {
    const { identityToken, code } = req.body

    const matches = giftCodesByRecipient[identityToken] === code

    if (matches) {
        const redeemedCards = readData("redeemed-cards.json")

        if (!redeemedCards.includes(identityToken)) {
            redeemedCards.push(identityToken)
            saveData("redeemed-cards.json", redeemedCards)
        }
    }

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

app.get("/api/gift-exchange/items", (req, res) => {
    const giftExchange = readData("gift-exchange.json")

    const response = giftOptions.map(option => ({
        imageUrl: option,
        inStock: isInStock(option, giftExchange)
    }))

    res.json(response)
})

app.get("/api/gift-exchange/gifts", (req, res) => {
    const giftExchange = readData("gift-exchange.json")

    const gifts = Object.entries(giftExchange).map(([giverToken, { recipientToken, itemGivenToRecipient }]) => ({
        from: recipients[giverToken].name,
        to: recipients[recipientToken]?.name,
        gift: itemGivenToRecipient
    })).filter(gift => gift.gift !== undefined)

    res.json(gifts)
})

app.post("/api/gift-exchange/:identityToken/selected-gift", express.json(), (req, res) => {
    const { identityToken } = req.params
    const { gift } = req.body

    const giftExchange = readData("gift-exchange.json")

    const isValidGift = giftOptions.includes(gift)

    if (!isValidGift) {
        res.status(400).send()
        return
    }

    if (!giftExchange[identityToken]) {
        res.status(404).send()
        return
    }

    if (giftExchange[identityToken].itemGivenToRecipient) {
        res.json({ success: false, message: "You've already selected a gift.  Stop trying to get more gifts for free.", gift })
        return
    }

    if (isInStock(gift, giftExchange)) {
        giftExchange[identityToken].itemGivenToRecipient = gift
        saveData("gift-exchange.json", giftExchange)
        res.json({ success: true, gift })
    } else {
        res.json({ success: false, message: "This gift just ran out of stock!  Try another one", gift})
    }
})

app.get("/api/gift-exchange/:identityToken", express.json(), (req, res) => {
    const giftExchange = readData("gift-exchange.json")

    const { recipientToken, itemWanted } = giftExchange[req.params.identityToken]

    res.json({
        assignedGiftRecipient: recipientToken ? {
            name: recipients[recipientToken].name,
            itemWanted: giftExchange[recipientToken].itemWanted,
            itemReceived: giftExchange[req.params.identityToken].itemGivenToRecipient
        } : undefined,
        itemWanted
    })
})

function isInStock(gift, giftExchange) {
    return !Object.values(giftExchange).some(entry => entry.itemGivenToRecipient === gift)
}

app.get("/api/decoration", (req, res) => {
    const decorations = readData("decorations.json")

    const decorationsWithoutTokens = decorations.map(decoration => ({
        ...decoration,
        addedBy: recipients[decoration.addedBy].name
    }))

    res.json(decorationsWithoutTokens)
})

const decorationTypes = [
    'blue bulb',
    'red bulb',
    'green bulb',
    'gold bulb',
]

app.post("/api/decoration", express.json(), (req, res) => {
    const { identityToken, decoration } = req.body

    if (!recipients[identityToken]) return res.status(401).end()

    if (!decorationTypes.includes(decoration.type)) return res.status(400).end()

    const decorations = readData("decorations.json")

    decorations.push({
        addedBy: identityToken,
        x: decoration.x,
        y: decoration.y,
        type: decoration.type
    })

    saveData("decorations.json", decorations)

    res.status(200).send()
})

app.use(express.static(staticDirectory))

module.exports = app