const apiPromise = require("../midllewares/apiPromise");
const CustomError = require("../utils/CustomError");
const {
    signupSchema,
    loginSchema,
    restPasswordSchema,
    changePasswordSchema,
    profileSchema
} = require("../utils/userValidation");
const { safeParse, email } = require('valibot');
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Token = require("../models/Token");
const generateCookie = require("../utils/generateCookie");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");




exports.signup = apiPromise(async (req, res, next) => {
    const result = safeParse(signupSchema, req.body);

    if (!result.success) return next(new CustomError(result.issues[0].message), 400);
    const data = result.output;
    if (!req.files.image) return next(new CustomError("Please provide your image", 400));

    if (req.files.image) {
        const file = req.files.image;
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "users"
        })

        data.image = { id: result.public_id, src: result.secure_url }
    }

    const existingUser = await User.findOne({ email: data.email })
    if (existingUser) return next(new CustomError("User already exists", 400));

    const user = await User.create(data)

    user.password = undefined;

    // verifaction 
    const verification_token = crypto.randomBytes(20).toString("hex");
    hashedToken = crypto.createHash("sha256").update(verification_token).digest("hex");

    await Token.create({ _id: user._id, token: hashedToken });
    const verifyLink = `${req.protocol}://${req.get("host")}api/v1/${user._id}/verify/${verification_token}`;
    const message = `Please copy and the pase this link into your URL \n\n ${verifyLink}`;

    const options = {
        email: user.email,
        subject: "Verify Your Account",
        html: `<!DOCTYPE html><html><head><title>Account verifaction</title> <style type="text/css">body {font-family: Arial, sans-serif;
        }.container {width: 60%;margin: auto;border: 1px solid #ccc;padding: 20px;box-shadow: 2px 2px 6px 0px rgba(0,0,0,0.3);}h1 {   text-align: center;}</style></head><body><div class="container"><h1>Order Confirmation</h1><p>Dear ${user.firstName},</p><p>Thank you for signing up.</p>${message}<p>Best Regards,</p><p>audiophile</p></div></body></html>`
    }

    try {
        await sendEmail(options)
        res.status(200).json({ status: "success", message: "The user created successfull, verify your account", user });
    } catch (err) {
        next(new CustomError("Failed to send email", 500));
    }
});

exports.verifyAccount = apiPromise(async (req, res, next) => {
    const { id, verification_token } = req.params;
    hashedToken = crypto.createHash("sha256").update(verification_token).digest("hex")
    const token = await Token.findOneAndDelete({ _id: id, token: hashedToken });
    if (!token) return next(new CustomError("Invalid token, or expired Token", 400));

    const user = await User.findOneAndUpdate({ _id: id }, { $set: { isVerified: true } }, { new: true });
    if (!user) return next(new CustomError("Error occurred Please try again", 400));

    res.status(200).json({ status: "success", message: "Your account has been verified.", user });

});

exports.login = apiPromise(async (req, res, next) => {
    result = safeParse(loginSchema, req.body);

    if (!result.success) return next(new CustomError(result.issues[0].message, 400));
    const data = result.output;
    const user = await User.findOne({ email: data.email });
    if (!user) return next(new CustomError("user not found", 400));
    if (!user.isVerified) return next(new CustomError("Please verify your account First", 400));

    const comparedPasswords = await user.isValidPassword(data.password);
    if (!comparedPasswords) return next(new CustomError("Wrong email or password", 400));
    user.password = undefined;

    generateCookie(user, res)
})

exports.logout = apiPromise(async (req, res, next) => {

    res.status(200).cookie("token", null, {
        // https:
        // secure: true,
        expires: new Date(Date.now()),
        // domain name
        // domain: ,
        sameSite: 'None',
        httpOnly: true,
    }).json({ success: true, message: "user looged out successfully" });

})

exports.forgotPassword = apiPromise(async (req, res, next) => {

    result = safeParse(email('The email address is badly formatted.'), req.body.email);
    if (!result.success) return next(new CustomError(result.issues[0].message, 400));
    const user = await User.findOne({ email: result.output });
    if (!user) return next(new CustomError("Couldn't find user with this email", 400));

    const forgotPasswordToken = user.generateForgotPasswordToken();
    await user.save({ validateBeforeSave: false, })

    const forgotPasswordLink = `${req.protocol}://${req.get('host')}/api/v1/reset_password/${forgotPasswordToken}`;
    const message = "copy and paste this url to reset the password, " + forgotPasswordLink;
    const subject = "Reset Password";

    try {
        await sendEmail({ email: result.output, subject, message })
        res.status(200).json({ status: 'success', message: "check your email" });
    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiration = undefined;
        await user.save({ validateBeforeSave: false });
        next(new CustomError("an error occured please try again", 500));
    }

});

exports.resetPassword = apiPromise(async (req, res, next) => {

    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    if (!token) return next(new CustomError("Please provide a token", 400));
    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiration: {
            $gt: Date.now()
        }
    });

    if (!user) return next(new CustomError("Token is expired or invalid"));

    const result = safeParse(restPasswordSchema, req.body);

    if (!result.success) return next(new CustomError(result.issues[0].message, 400));

    user.password = req.body.password;
    await user.save({ validateBeforeSave: true });
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiration = undefined;
    // generateCookie(user, res);

    res.status(200).json({ status: "success", message: "Your password has been change successfully" })
})


// logged in users actions

exports.LoggedInUserDetails = apiPromise(async (req, res, next) => {

    const user = await User.findOne({ _id: req.user._id });
    if (!user) return next(new CustomError("user not found", 400));
    res.status(200).json({ status: 'success', user });
});

exports.changePassword = apiPromise(async (req, res, next) => {

    const result = safeParse(changePasswordSchema, req.body)

    if (!result.success) return next(new CustomError(result.issues[0].message, 400));
    const { password, newPassword } = result.output;
    const user = await User.findOne({ _id: req.user._id }).select("+password");
    if (!user) return next(new CustomError("user not found", 400));

    const comparedPasswords = user.isValidPassword(password);

    if (!comparedPasswords) return next(new CustomError("wrong password", 400));

    user.password = newPassword;
    user.save({ validateBeforeSave: true });

    res.status(200).json({ status: 'success', message: "password changed successfully" });
}
);

exports.updateProfile = apiPromise(async (req, res, next) => {
    const result = safeParse(profileSchema, req.body);

    if (!result.success) return next(new CustomError(result.issues[0].message, 400));

    const data = result.output;

    if (req.files) {

        await cloudinary.uploader.destroy(req.user.image.id);
        const file = req.files.image;
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "users"
        })

        data.image = {
            id: result.public_id,
            src: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user._id, data, {
        new: true,
        runValidators: true,
    });

    if (!user) return nex(new CustomError('try later', 500));

    res.status(200).json({ status: 'success', user });
});

// admin actions

exports.getAllUsers = apiPromise(async (req, res, next) => {

    const users = await User.find();

    res.status(200).json({ status: 'success', users });

});

exports.getOneUserDetails = apiPromise(async (req, res, next) => {

    const { userId } = req.params;
    if (!userId) return next(new CustomError('Please provide a valid user id', 400));
    const user = await User.findById(userId);
    if (!user) return next(new CustomError('user not found'), 400);

    res.status(200).json({ status: "success", user })
});

exports.deleteOneUserDetails = apiPromise(async (req, res, next) => {

    const { userId } = req.params;

    await cloudinary.uploader.destroy(req.user.image.id);

    const user = await User.findByIdAndDelete(userId);

    if (!user) return next(new CustomError("an error occurred while deleting Please try again", 400));


    res.status(200).json({ status: "success", message: "Successfully deleted the user", });
});