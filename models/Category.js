const mongoose = require('mongoose');


const categorySchema = new mongoose.Schema({

    category: {
        type: String,
    },
    image: {
        id: String,
        src: String,
    }
});

module.exports = mongoose.model('category', categorySchema);