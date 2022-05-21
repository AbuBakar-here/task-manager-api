const express = require("express")
require("../db/mongoose")
const User = require('../models/user')
const authMiddleware = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

const router = new express.Router()

// ---------------------- Clean-up Code -----------------------

const e = (error, req, res, next) => {        // used this to clean-up users/me/avatar (post) route
    res.status(400).send({ error: error.message })
}

// ---------------------- Options for Multer -----------------------

const upload = multer({
    limits: { fileSize: 1000000 },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an Image.'))
        }

        cb(undefined, true)
    }
})

// ---------------------- Using Async Await -----------------------

router.post('/users', async (req, res) => {

    // Create new user
    const user = new User(req.body)
    try {
        // await user.save()
        const token = await user.generateAuthToken()   // this methods automatically saves user so no need for above statement
        res.status(201).send({ user, token })
    } catch (e) { res.status(400).send(e) }

})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) { res.status(400).send() }
})

router.post('/users/logout', authMiddleware, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)

        await req.user.save()

        res.send()
    } catch (e) { res.status(500).send() }
})

router.post('/users/logoutAll', authMiddleware, async (req, res) => {
    try {

        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) { res.status(500).send() }
})

router.get('/users/me', authMiddleware, async (req, res) => {

    res.send(req.user)
    // try {
    //     const users = await User.find({ _id: req.user._id })
    //     if (!users.length) { res.send("No Users found") }
    //     res.send(users)
    // } catch (e) { res.status(500).send() }

})

router.patch('/users/me', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOpertaion = updates.every((update) => { return allowedUpdates.includes(update) })

    if (!isValidOpertaion) { return res.status(400).send({error: "Invalid Operation!"}) }

    try {
        updates.forEach((updateField) => req.user[updateField] = req.body[updateField] )
        await req.user.save()
        
        // const user = await User.updateOne({_id: req.params.id}, req.body)                                        // use middleware 'updateOne'
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })   // bypasses middleware so changed
        // if (!user) { return res.status(404).send() }

        res.send(req.user)
    } catch (e) { res.status(400).send(e) }
})

router.delete('/users/me', authMiddleware, async (req, res) => {

    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        await req.user.deleteOne()
        // if (!user) { return res.status(404).send() }
        res.send(req.user)
    } catch (e) { res.status(500).send(e) }
})

router.post('/users/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, e)

router.delete('/users/me/avatar', authMiddleware, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) { throw new Error() }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) { res.status(404).send() }
})







// ----------------- Exports ---------------------

module.exports = router