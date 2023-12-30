

const { object, string, array, minLength, maxLength, regex, email, custom, number } = require("valibot");

const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im
const zipeCodeRegex = /^[0-9]{5}(?:-[0-9]{4})?$/;

exports.customerSchema = object({
    email: string('Your email must be a string.', [
        minLength(1, 'Please enter your email.'),
        email('The email address is badly formatted.'),
    ]),
    name: string('Enter a valid name', [
        minLength(1, 'Please enter a valid name'),
        minLength(3, 'your name should be at least 3 characters long')
    ]),
    address: string('Enter a valid address ', [
        minLength(1, 'Please enter your address.'),
        maxLength(20, "Your address shouldn't exceed 20 characters")
    ]),
    city: string('Enter a valid city', [
        minLength(1, 'Please enter your city'),
    ]),
    zipCode: string('Enter a valid zip code',
        [
            minLength(1, 'Please enter your zip code'),
            regex(zipeCodeRegex, "Enter a valid zip code")
        ]
    ),
    phone: string("enter your phone number", [minLength(1, "All fields are required"),
    regex(phoneRegex, "Enter a valid phone number")
    ]),

})

exports.numSchema = object({
    amount: number("number is not defined", [
        custom((num) => num > 0 && !Number.isInteger(num), 'Number must be positive')
    ])
})





