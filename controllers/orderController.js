const { safeParse } = require('valibot');
const apiPromise = require('../midllewares/apiPromise');
const Order = require('../models/Order');
const { customerSchema, numSchema } = require('../utils/orderValidation');
const CustomError = require('../utils/CustomError');
const sendEmail = require('../utils/sendEmail');


exports.createOrder = apiPromise(async (req, res, next) => {
    const { products, amount, ...items } = req.body;
    const result = safeParse(customerSchema, { ...items });

    if (!result.success) return next(new CustomError(result.issues[0].message, 400));
    const data = { customerDetails: result.output, amount: amount };

    const order = await Order.create({ ...data });
    if (!order) return next(new CustomError("Couldn't create an order please try later", 500));
    // send email 
    const options = {
        email: data.customerDetails.email,
        subject: "order confirmation",

        html: `<!DOCTYPE html><html><head><title>Order Confirmation</title><style type="text/css">body {font-family: Arial, sans-serif;}
            .container {width: 60%;margin: auto;border: 1px solid #ccc;padding: 20px;box-shadow: 2px 2px 6px 0px rgba(0,0,0,0.3);
            }h1 {text-align: center;}</style></head><body><div class="container"><h1>Order Confirmation</h1><p>Dear ${data.customerDetails.name},</p><p>Thank you for your order. Your order  has been successfully placed.</p>we'll call you to confirm your order soon
            <p>Best Regards,</p><p>audiophile</p></div></body></html>`
    }

    try {
        await sendEmail(options);
        res.status(200).json({ status: "success", message: "Order has been placed successfully", order })
    } catch (error) {

        next(new CustomError("an error occured Please try again", 500));
    }




});

