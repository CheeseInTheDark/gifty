const express = require('express')
const app = express()

const path = require('path')
const fs = require('fs')

const { staticDirectory, dataDirectory } = require('./settings')
const recipients = JSON.parse(fs.readFileSync(path.join(dataDirectory, "recipients.notjson")))

app.get('/redeem/:cardtoken', (req, res) => {
    const recipientExists = Object.keys(recipients).includes(req.params.cardtoken)
   
    recipientExists ? 
        res.sendFile(path.join(staticDirectory, "index.html")) : 
        res.status(404).send()
})


app.get("/recipient/:cardtoken", (req, res) => {
    const recipient = recipients[req.params.cardtoken]
    res.json(recipient).send()
})
app.use(express.static(staticDirectory))

module.exports = app