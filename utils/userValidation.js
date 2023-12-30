const { string, email, minLength, object, forward, custom } = require('valibot');


exports.signupSchema = object({
    firstName: string('Please enter a valid name', [
        minLength(1, 'Please enter your first name.'),
        minLength(3, 'Your name should be at least 3 characters.'),
    ]
    ),
    lastName: string('Please enter a valid name', [
        minLength(1, 'Please enter your last name.'),
        minLength(3, 'Your name should be at least 3 characters.'),
    ]),
    email: string('Your email must be a string.', [
        minLength(1, 'Please enter your email.'),
        email('The email address is badly formatted.'),
    ]),
    password: string('Your password must be a string.', [
        minLength(1, 'Please enter your password.'),
        minLength(8, 'Your password must have 8 characters or more.'),
    ]),
});

exports.loginSchema = object({
    email: string('Your email must be a string.', [
        minLength(1, 'Please enter your email.'),
        email('The email address is badly formatted.'),
    ]),
    password: string('Your password must be a string.', [
        minLength(1, 'Please enter your password.'),
        minLength(8, 'Your password must have 8 characters or more.'),
    ]),
})

exports.restPasswordSchema = object(
    {
        password: string('Please enter a valid password', [
            minLength(1, 'Please enter your password.'),
            minLength(8, 'Your password must have 8 characters or more.'),
        ]),
        confirmPassword: string('Please enter a valid password'),
    },
    [
        forward(
            custom(
                (input) => input.password === input.confirmPassword,
                'The two passwords do not match.'
            ),
            ['confirmPassword']
        ),
    ]
)

exports.changePasswordSchema = object(
    {
        password: string('Please enter a valid password', [
            minLength(1, 'Please enter your password.'),
            minLength(8, 'Your password must have 8 characters or more.'),
        ]),
        newPassword: string('Please enter a valid password', [
            minLength(1, 'Please enter your password.'),
            minLength(8, 'Your password must have 8 characters or more.'),
        ]),
    }
)

exports.profileSchema = object({
    firstName: string('Please enter a valid name', [
        minLength(1, 'Please enter your first name.'),
        minLength(3, 'Your name should be at least 3 characters.'),
    ]
    ),
    lastName: string('Please enter a valid name', [
        minLength(1, 'Please enter your last name.'),
        minLength(3, 'Your name should be at least 3 characters.'),
    ]),
    email: string('Your email must be a string.', [
        minLength(1, 'Please enter your email.'),
        email('The email address is badly formatted.'),
    ]),
})