const { safeParse } = require("valibot");
const apiPromise = require("../midllewares/apiPromise");
const Product = require("../models/Product");
const { productSchema, reviewSchema } = require("../utils/productValidation");
const CustomError = require("../utils/CustomError");
const WhereClause = require("../utils/WhereClause");
const cloudinary = require("cloudinary").v2;

exports.addProduct = apiPromise(async (req, res, next) => {
    req.body.stock = parseInt(req.body.stock, 10)
    req.body.price = parseInt(req.body.price, 10)
    const result = safeParse(productSchema, req.body);

    if (!result.success) return next(new CustomError(result.issues[0].message, 400)); //

    const data = result.output;

    const imagesArray = [];
    if (!req.files) return next(new CustomError("You should provide at least one image", 400));
    if (req.files) {

        const files = req.files.images;
        for (let i = 0; i < files.length; i++) {
            const result = await cloudinary.uploader.upload(files[i].tempFilePath, {
                folder: 'audiophile'
            })

            if (!result) return (new CustomError("promise could not be resolved", 400))
            imagesArray.push({ id: result.public_id, src: result.secure_url });
        }

        const file = req.files.mainImg;
        const result = await cloudinary.uploader.upload(file.tempFilePath, { folder: "audiophile" });

        const mainImage = { id: result.public_id, src: result.secure_url };
        data.mainImage = mainImage;
    }

    data.images = [...imagesArray];
    data.user = req.user._id;
    const product = await Product.create(data);

    if (!product) return (new CustomError("Product addition failed", 400));


    res.status(200).json({ status: "success", message: "products added successfuly", product })
})

exports.getProducts = apiPromise(async (req, res, next) => {
    // const resultPerPage = 8;
    const productsCounter = await Product.countDocuments();

    const productObj = new WhereClause(Product.find(), req.query).search();
    const products = await productObj.base;
    res.status(200).json({ status: "success", message: "it working", products, productsCounter });

})

exports.getSingleProduct = apiPromise(async (req, res, next) => {

    const { productId } = req.params;
    if (!productId) return next(new CustomError("Please provide a product identifier", 400));
    const product = await Product.findById(productId).populate("reviews.user", "firstName lastName image");

    if (!product) return next(new CustomError("Product not found", 400));
    res.status(200).json({ status: 'success', product });

})


// Logged in user actions
// -- add , remove review
exports.addReview = apiPromise(async (req, res, next) => {
    req.body.rating = +req.body.rating;

    const result = safeParse(reviewSchema, req.body);

    if (!result.success) return next(new CustomError(result.issues[0].message, 400));
    const { productId, comment, rating } = result.output;
    const { _id, firstName, lastName } = req.user;
    const product = await Product.findById(productId);

    if (!product) return next(new CustomError("Product not found", 400));

    const review = {
        user: _id,
        name: firstName + ' ' + lastName,
        comment,
        rating
    }

    const alreadyHaveReview = product.reviews.find(review => review.user.toString() === _id.toString());

    if (alreadyHaveReview) {
        product.reviews.forEach(review => {
            if (review.user.toString() === _id.toString()) {
                review.comment = comment;
                // this user rating
                review.rating = rating;
            }
        })
    } else {
        product.reviews.push(review);
        product.numOfRatings = product.reviews.length;
    }

    // product total rating
    product.rating = product.reviews.reduce((acc, current) => acc + current.rating, 0) / product.numOfRatings;

    product.save({ validateBeforeSave: true });

    res.status(200).json({ status: "success", message: "reviews saved successfully" });

})

exports.deleteReview = apiPromise(async (req, res, next) => {

    const { productId } = req.query;
    const { _id: id } = req.user;
    if (!productId) return next(new CustomError("Plase provide a product identifier", 400));
    const product = await Product.findById(productId);
    if (!product) return next(new CustomError("Product not found", 400));

    const reviews = product.reviews.filter(review => review.user.toString() !== id.toString());
    const numOfRatings = reviews.length;
    const rating = reviews.reduce((acc, current) => acc + current.rating, 0) / numOfRatings;

    await Product.findByIdAndUpdate(productId, { reviews, rating, numOfRatings }, {
        runValidators: true,
        new: true,
    });

    if (!updatedProduct) return next(new CustomError("Please try later", 500));
    res.status(200).json({ status: 'success', message: "product updated successfully" });

})

// admin actions
// -- update, delete a product 

exports.updateProduct = apiPromise(async (req, res, next) => {

    req.body.stock = parseInt(req.body.stock, 10)
    req.body.price = parseFloat(req.body.price)
    const { productId } = req.params;
    const result = safeParse(productSchema, req.body);

    if (!result.success) return next(new CustomError(result.issues[0].message, 400)); //

    const data = result.output;

    const product = await Product.findById(productId);

    if (!product) return next(new CustomError("Product not found", 400));

    if (req.files) {
        const imageArray = [];

        for (let i = 0; i < product.images.length; i++) {

            await cloudinary.uploader.destroy(product.images[i].id);
        }
        const files = req.files.images;

        for (let i = 0; i < files.length; i++) {

            const result = await cloudinary.uploader.upload(files[i].tempFilePath, {
                folder: "audiophile"
            });

            imageArray.push({ id: result.public_id, src: result.secure_url });
        }

        data.images = [...imageArray];
    }

    data.user = req.user._id;

    const updatedProduct = await Product.findByIdAndUpdate(productId, { ...data }, {
        new: true,
        runValidators: true
    });


    if (!updatedProduct) return next(new CustomError("Please try later to update the product", 500));

    res.status(200).json({ status: 'success', updatedProduct, message: "updated product" });
})

exports.deleteProduct = apiPromise(async (req, res, next) => {

    const { productId } = req.params;

    if (!productId) return next(new CustomError("Please Provide the product identifier", 400));

    const product = await Product.findById(productId);
    if (!product) return next(new CustomError("Product not found", 400));

    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.uploader.destroy(product.images[i].id);
    }

    const deletedProduct = await Product.findByIdAndDelete(product._id);

    if (!deletedProduct) return next(new CusotmError("Product deletion failed", 500));
    res.status(200).json({ status: 'success', message: "product deleted successfully" });
})

