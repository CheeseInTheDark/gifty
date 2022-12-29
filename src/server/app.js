const express = require('express')
const app = express()

const path = require('path')
const fs = require('fs')

const { staticDirectory, dataDirectory } = require('./settings')

const recipients = JSON.parse(fs.readFileSync(path.join(dataDirectory, "recipients.json")))
const giftCodesByRecipient = JSON.parse(fs.readFileSync(path.join(dataDirectory, "gift-codes.json")))

app.get('/redeem/:cardtoken', (req, res) => {
    const recipientExists = Object.keys(recipients).includes(req.params.cardtoken)
   
    recipientExists ? 
        res.sendFile(path.join(staticDirectory, "index.html")) : 
        res.status(404).send()
})

app.get("/api/recipient/:cardtoken", (req, res) => {
    const recipient = recipients[req.params.cardtoken]
    res.json(recipient).send()
})

app.post("/api/redeem", express.json(), (req, res) => {
    const matches = giftCodesByRecipient[req.body.identityToken] === req.body.code

    res.json({
        success: matches,
        message: matches ? undefined : "That code is not the right code.  I can't believe you've done this.  Contact technical support.  Wait.  I'm technical support.  Hm.  I might have to rethink this.  Okay, better idea, try again but like, enter the correct code this time.  Although you can also feel free to contact technical support and say hi."
    })
})


app.use(express.static(staticDirectory))

module.exports = app