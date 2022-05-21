const express = require("express")
require("../db/mongoose")
const Task = require('../models/task')
const authMiddleware = require('../middleware/auth')

const router = new express.Router()


// ---------------------- Reusable functions -----------------------

const filterData = (query) => {                // does not provide andthing reusable just here to make code clean
    const match = {}
    const sort = {}
    if (query.complete) {
        match.complete = query.complete === 'true'     // will set to boolena(true) or boolean(false)
    }
    if (query.sortBy) {
        let parts = query.sortBy.split(":")
        sort[parts[0]] = parts[1] == 'desc' ? -1 : 1
    }
    return { match, sort }
}

// ---------------------- Using Async Await -----------------------

router.post('/tasks', authMiddleware, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    // Create new Task
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) { res.status(400).send(e) }
})

// options { complete, limit, skip, sortBy }
router.get('/tasks', authMiddleware, async (req, res) => {
    
    const { sort, match } = filterData(req.query)
    try {
        // const tasks = await Task.find({owner: req.user._id})
        await req.user.populate({ 
            path: 'tasks', 
            match,
            options: { 
                limit: parseInt(req.query.limit), 
                skip: parseInt(req.query.skip), 
                sort: sort
            }
        })
        res.send(req.user.tasks)
    } catch (e) { res.status(500).send() }
})

router.get('/tasks/:id', authMiddleware, async (req, res) => {

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send("No tasks exists")
        }
        res.send(task)
    } catch (e) { res.status(500).send("not found") }
})

router.patch('/tasks/:id', authMiddleware, async (req, res) => {

    const allowedUpdates = ['description', 'complete']
    const updates = Object.keys(req.body)
    const isValid = updates.every( (update) => allowedUpdates.includes(update) )

    if (!isValid) { return res.status(400).send({error: "Invalid Operation!"}) }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if(!task) { return res.status(404).send('No task exists') }

        updates.forEach( (updateField) => task[updateField] = req.body[updateField] )
        await task.save()

        // const user = await User.updateOne({_id: req.params.id}, req.body)                                          // use middleware 'updateOne
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })     // bypasses middleware so changed
        res.send(task)
    } catch (e) { res.status(400).send(e) }
})

router.delete('/tasks/:id', authMiddleware, async (req, res) => {

    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) { return res.status(404).send('No task found') }
        res.send(task)
    } catch (e) { res.status(500).send(e) }
})



// ----------------- Exports ---------------------

module.exports = router