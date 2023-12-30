const mongoose = require("mongoose");


module.exports = () => {
    mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => console.log("Database connected successfully"))
        .catch((error) => {
            console.log("Database connection failed")
            console.log(error.message);
            process.exit(1);
        })
}