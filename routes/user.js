const express = require('express');
const {
    signup,
    login,
    logout,
    verifyAccount,
    forgotPassword,
    resetPassword,
    LoggedInUserDetails,
    changePassword,
    updateProfile,
    getAllUsers,
    getOneUserDetails,
    deleteOneUserDetails
} = require('../controllers/userController');
const { isLoggedIn, isAuthorized } = require('../midllewares/user');


const router = express.Router();


router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route("/:id/verify/:verification_token").get(verifyAccount);
router.route("/forgot_password").post(forgotPassword);
router.route('/reset_password/:token').post(resetPassword);

// logged in user routes

router.route('/users/user_details').get(isLoggedIn, LoggedInUserDetails);
router.route('/users/update_password').post(isLoggedIn, changePassword);
router.route('/users/update_profile').post(isLoggedIn, updateProfile);

// admin routes
router.route("/admin/users").get(isLoggedIn, isAuthorized("admin"), getAllUsers);
router.route("/admin/users/:userId")
    .get(isLoggedIn, isAuthorized("admin"), getOneUserDetails)
    .delete(isLoggedIn, isAuthorized("admin"), deleteOneUserDetails);


module.exports = router;