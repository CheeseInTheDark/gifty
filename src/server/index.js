const app = require('./app')
const { port } = require('./settings')

module.exports = new Promise(resolve => {
    const server = app.listen(port, () => resolve(server))
})