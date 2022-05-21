const mongoose = require("mongoose")
// const {MongoClient} = require('mongodb')

// const options = {useNewUrlParser: true,useCreateIndex: true, userFindAndModify: false}        // no need to pass these to connect they are already set

mongoose.connect(process.env.MONGODD_URL)

// const connectionURL = 'mongodb://127.0.0.1:27017'
// const databaseName = 'task-manager-api'

// MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
// MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {

//     if (error) return console.log(error)

//     // console.log("Connected correctly!")

//     const db = client.db(databaseName)


//     db.collection('users').find({ }).toArray()
//     .then((result) => console.log(result))
//     .catch((error) => console.log(error))

// })