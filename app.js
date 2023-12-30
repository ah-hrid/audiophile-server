require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUploader = require('express-fileupload');
const globalErrhandler = require('./controllers/errorController');
const CustomError = require('./utils/CustomError');
const cors = require("cors");

const app = express();

// cors 
const corsOptions = {
    credentials: true,
    origin: "http://localhost:5173",
    methods: "GET,POST",
    preflightContinue: true,
    optionsSuccessStatus: 200,
    allowedHeaders: 'Content-Type'
};

app.use(cors(corsOptions))
// regular midllewares json urlEncoded,
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser, fileUploader midllewares
app.use(cookieParser());
app.use(fileUploader(
    {
        useTempFiles: true,
        tempFileDir: "/temp/"
    }
));

// morgan 
app.use(morgan("tiny"));

// imports routes
const user = require("./routes/user");
const product = require("./routes/product");
const category = require("./routes/category");
const order = require("./routes/order");

// routes midllewares
app.use('/api/v1/', user);
app.use('/api/v1/', product);
app.use('/api/v1/', category);
app.use('/api/v1/', order)

app.get('/home', (req, res) => {
    res.send("<h1>Hello from Express js file</h1>");
});

app.get('*', (req, res, next) => {
    next(new CustomError("page not found", 404));
});
app.use(globalErrhandler)



module.exports = app;