const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
const validator = require("validator")
const jwt = require('jsonwebtoken')
const Task = require("./task")


// Model Schema OR Model data validations
const userSchema = new mongoose.Schema({ 
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: [7, '{VALUE} must be atleast 7 characters long'],
        validate(value) {

            if (value.toLowerCase().includes('password')) {
                throw new Error("Your password cannot contain 'password'.")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age must be a positive number.")
            }
        }
    },
    tokens: [{
        token: { type: String, required: true }
    }],
    avatar: {
        type: Buffer
    }
}, { timestamps: true })

// Virtual properties which specifies relation and not stores in database
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// User defined 'methods' on returned user also called instance methods
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
} 

userSchema.methods.toJSON = function() {
    // Whenever we use res.send() express use JSON.stringify() which automatically calls toJSON method
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete avatar

    return userObject
}

// User defined 'functions' on Model also called model methods
userSchema.statics.findByCredentials = async ({ email, password }) => {
    const user = await User.findOne({ email })

    if (!user) { throw new Error('Unable to Login') }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) { throw new Error('Unable to Login') }

    return user
}

// Hash plain password before saving | middleware
userSchema.pre("save", async function (next) {             // hash passwords before saving it

    const user = this
    if (user.isModified('password')){ user.password = await bcrypt.hash(user.password, 8) }

    next()
})

userSchema.pre("deleteOne", async function (next) {       // delete all tasks before deleting user 

    const user = this
    await Task.deleteMany({ owner: user._id })
    
    next()
})

// Model construction
const User = mongoose.model('User', userSchema)

module.exports = User