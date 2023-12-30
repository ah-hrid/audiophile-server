const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Please provide a valid product name"],
        unique: [true, "This product is already registered"],
        minLength: [3, "The product name must be at least 3 characters long"],
        maxLength: [70, "The product name must be at most 70 characters long"]
    },
    price: {
        type: Number,
        required: [true, "Please provide the product price"],
    },
    description: {
        type: String,
        required: [true, "Please provide the product description"],
        minLength: [10, "The Product description must be at least 10 characters long"],
        maxLength: [270, "The Product description must be at most 270 characters long"],
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Categroy",
        required: true,
    },
    stock: {
        type: Number,
        required: [true, "Please provide a stock number of your product"],
    },
    mainImage: {
        id: {
            type: String,
            required: [true, "Please provide a main image of your product"],
        },
        src: {
            type: String,
            required: [true, "Please provide a main image of your product"],
        }
    },
    images: [
        {
            id: {
                type: String,
                required: [true, "Please provide at least one image"],
            },
            src: {
                type: String,
                required: [true, "Please provide at least one image"]
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    numOfRatings: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            comment: {
                type: String,
                minLength: [5, "Please enter a valid comment"],
                maxLength: [200, "Your comment must be at most 200 characters long"],
                required: true
            },
            rating: {
                type: Number,
                required: true
            }
        }
    ]
});


module.exports = mongoose.model("Product", productSchema);