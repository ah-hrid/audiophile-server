const { object, string, minLength, maxLength, number, maxValue, } = require("valibot");


exports.productSchema = object({
    name: string("product name should be a string",
        [
            minLength(3, "The product name must be at least 3 characters long"),
            maxLength(70, "The product name must be at most 70 characters long")
        ]
    ),
    price: number("enter a valid price"),
    description: string("Enter a description", [
        minLength(10, "The Product description must be at least 10 characters long"),
        maxLength(270, "The Product description must be at most 270 characters long"),
    ]),
    category: string("Enter a category"),
    stock: number("Enter a stock value"),
})

exports.reviewSchema = object({
    comment: string("Enter a comment", [
        minLength(5, "Your comment must be at least 5 characters"),
        maxLength(200, "Your comment must be at most 200 characters long"),
    ]),
    rating: number("Enter a valid number",
        [
            maxValue(5, "Your rating should be at most 5 stars"),
        ]),
    productId: string("Provide a product identifier"),
})

exports.categorySchema = object({
    category: string("Provide a category name",
        [
            minLength(3, "The product name must be at least 3 characters long"),
            maxLength(20, "The product name must be at most 20 characters long")
        ]),
})