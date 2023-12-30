const mongoose = require("mongoose")

// for account verification
const Token = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    token: {
        type: String,
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 60 * 1000
    }
})


module.exports = mongoose.model("Token", Token)