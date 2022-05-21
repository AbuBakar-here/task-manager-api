const mongoose = require("mongoose")

const TasksSchema = new mongoose.Schema({
    description: { type: String, required: "Description is required", trim: true },
    complete: { type: Boolean, default: false },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: "User id is required",
        ref: 'User'
    }
}, { timestamps: true })

const Task = mongoose.model('Task', TasksSchema)

// new Task({ description: 'To learn Express', complete: false })
// .save()
// .then((result) => console.log(result))
// .catch((error) => console.log(error))


module.exports = Task