const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cartSchema = new Schema({
    userId: { type: String, require: true },
    items: [
        {
            product: {
                _id: { type: String, require: true },
                name: { type: String },
                desciption: { type: String },
                thumbnailImage: { type: String },
                category: { type: String },
                price: { type: Number },
            },
            unit: { type: Number, require: true }
        }
    ]
});

module.exports = mongoose.model('Cart', cartSchema);
