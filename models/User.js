const mongoose = require('mongoose');
const { email, parse } = require('valibot');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please enter your First name "],
        trim: true,
        minLength: [3, "First name should be at least 3 characters"],
        maxLength: [15, "Last name max length is 15 characters"]
    },
    lastName: {
        type: String,
        required: [true, "Please enter your Last name "],
        trim: true,
        minLength: [3, "Last name should be at least 3 characters"],
        maxLength: [15, "Last name max length is 15 characters"]
    },
    email: {
        type: String,
        required: [true, "The email address is required"],
        unique: true,
        validate: {
            validator: function (v) {
                return parse(email(), v);
            },
            message: () => `The email address is baddly formatted!`
        },
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "The password should be at least 8 characters"],
        maxLength: [15, "The password should be at most 10 characters"],
        // select: false,
    },
    role: {
        type: String,
        default: "user"
    },
    image: {
        id: {
            type: String,
            required: true
        },
        src: {
            type: String,
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiration: Date,
    isVerified: {
        type: Boolean,
        default: false
    }
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isValidPassword = async function (entredPassword) {
    return await bcrypt.compare(entredPassword, this.password);
}

userSchema.methods.generateJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
}

userSchema.methods.generateForgotPasswordToken = function () {

    const forgotToken = crypto.randomBytes(20).toString("hex");

    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest("hex");
    this.forgotPasswordTokenExpiration = Date.now() + 30 * 60 * 1000;

    return forgotToken;
}


module.exports = mongoose.model("User", userSchema);