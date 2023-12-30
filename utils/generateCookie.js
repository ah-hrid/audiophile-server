
module.exports = function (user, res) {

    const token = user.generateJWTToken();

    const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        // domain name
        // domain: '',
        sameSite: 'None',
        // https
        // secure: true,
        httpOnly: true,
    }

    res.status(200).cookie("token", token, options).json({ user, status: 'success' });

}