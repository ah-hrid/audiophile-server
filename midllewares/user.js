const User = require("../models/User");
const CustomError = require("../utils/CustomError");
const apiPromise = require("./apiPromise");
const jwt = require("jsonwebtoken");


exports.isLoggedIn = apiPromise(async (req, res, next) => {

    const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) return next(new CustomError("Please login first.", 400));

    const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById({ _id: id })

    if (!user) return next(new CustomError("Couldn't find user with this token", 400));
    user.password = undefined;
    req.user = user;

    next();

})


exports.isAuthorized = (...roles) => {

    return async (req, res, next) => {
        if (!roles.includes(req.user.role)) return next(new CustomError("You are not authorized", 401))
        next()
    }
}
