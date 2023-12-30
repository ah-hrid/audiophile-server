const mongoose = require('mongoose');
const { parse, email } = require('valibot');

const orderSchema = new mongoose.Schema({
    customerDetails: {
        email: {
            type: String,
            required: [true, "The email address is required"],
            validate: {
                validator: function (v) {
                    return parse(email(), v);
                },
                message: () => `The email address is baddly formatted!`
            },
            lowercase: true,
        },
        name: {
            type: String,
            required: [true, "Please enter your  name "],
            trim: true,
            minLength: [3, "Your name should be at least 3 characters"],
            maxLength: [15, "Your name max length is 15 characters"]
        },
        address: {
            type: String,
            required: [true, "Please enter your address"],
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
        },
        zipCode: {
            type: String,
            required: true,
        }
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            }
        }
    ],
    paymentInfo: {
        type: String,
        default: "Not Paid Yet"
    },
    amount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        default: "processing"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deliveredAt: Date,
})

module.exports = mongoose.model("Order", orderSchema);