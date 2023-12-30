const app = require('./app');
const connectToDb = require('./config/db');
const cloudinary = require('cloudinary');


connectToDb();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    secure: true
});

const server = app.listen(process.env.PORT, () => console.log(`listening on ${process.env.Port}`));