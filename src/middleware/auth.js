const jwt = require('jsonwebtoken')
const User = require('../models/user')


const auth = async (req, res, next) => {
    
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'thisismyfirstnodecourse')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if(!user) { throw new Error() }

        req.token = token
        req.user = user
        next()
    } catch(e) { res.status(401).send({ error: 'Please Authenticate' }) }
}

// app.use((req, res, next) => {
//     if (req.method === 'GET') { return res.status(401).send('GET requests are disabled') }
//     next()
// })

// app.use((req, res, next) => {
//     res.status(503).send('Under Maintenance. Please try againg later.')
    
// })







module.exports = auth