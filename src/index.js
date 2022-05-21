// ----------------- Imports ---------------------

const express = require("express")
const userRouter = require('./router/user')
const taskRouter = require('./router/task')
// require('./db/mongoose')

// ----------------- Enviroment Variables ---------------------

const app = express()
const port = process.env.PORT

// ----------------- Middleware ---------------------



// ----------------- Miscs ---------------------

app.use(express.json())

// ----------------- Registering Routes ---------------------

app.use(userRouter)
app.use(taskRouter)

// ----------------- Starting App/Configurations ---------------------

app.listen(port, () => console.log("Server is running on " + port))