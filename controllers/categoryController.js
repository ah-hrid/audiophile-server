const { safeParse } = require("valibot");
const apiPromise = require("../midllewares/apiPromise");
const Category = require("../models/Category");
const CustomError = require("../utils/CustomError");
const { categorySchema } = require("../utils/productValidation");
const cloudinary = require("cloudinary").v2;


exports.addCategory = apiPromise(async (req, res, next) => {

    const result = safeParse(categorySchema, req.body);
    if (!result.success) return next(new CustomError(result.issues[0].message, 400));

    const data = { ...result.output };
    console.log(data);

    if (!req.files) return next(new CustomError("You have to provide at lease on image", 400));

    if (req.files.image) {
        const file = req.files.image;
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "categories"
        });

        data.image = { id: result.public_id, src: result.secure_url };
    }


    const category = await Category.create({ ...data });

    if (!category) return next(new CustomError("Failded to add this method, Please try again", 400));

    res.status(200).json({ status: 'success', message: "category added successfully" });

})



exports.getCategories = apiPromise(async (req, res, next) => {

    const categories = await Category.find({});
    if (!categories) next(new CustomError("no categories found", 400));
    res.status(200).json({ status: 'success', categories });
})
