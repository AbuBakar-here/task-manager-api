const express = require("express")
require("./db/mongoose")
const User = require('./models/user')
const Task = require('./models/task')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

// ------------------ Not Using Async Await -------------------

app.post('/users', async (req, res) => {

    // Create new user
    new User(req.body)
    .save()
    .then( (result) => res.status(201).send(result) )
    .catch( (error) => res.status(400).send(error) )

})

app.get('/users', async (req, res) => {

    User
    .find({})
    .then( (users) => res.send(users) )
    .catch( (error) => res.status(500).send() )

})

app.get('/users/:id', async (req, res) => {

    User.findById(req.params.id)
    .then( (result) => {

        if (!result) { 
            return res.status(404).send() 
        }
        res.send(result)
    } )
    .catch( (error) => res.status(500).send() )

})

app.post('/tasks', async (req, res) => {

    // Create new Task
    new Task(req.body)
    .save()
    .then( (result) => res.status(201).send(result) )
    .catch( (error) => res.status(400).send(error) )
    const task = new Task(req.body)

})

app.get('/tasks', async (req, res) => {

    Task
    .find({})
    .then( (result) => res.send(result) )
    .catch( (error) => res.status(500).send() )
})

app.get('/tasks/:id', async (req, res) => {
    
    Task
    .findById(req.params.id)
    .then( (result) => {

        if (!result) {
            return res.status(404).send("No tasks exists")
        }
        res.send(result)
    } )
    .catch( (error) => res.status(500).send("not found") )
})











app.listen(port, () => console.log("Server is running on " + port))