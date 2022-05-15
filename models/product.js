const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        requred: true
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    bland: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,     // use ObjectId to find the object instance
        ref: 'Category',       // reference to the schema model instance created in category.js
        requred: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    rating: {
        type: Number,
        default: 0
    }, 
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

// re-format "id"
productSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true
});

// model assigns the schema a name. const Product is an instance of mongoose model
// exports. to export Product into app.js
exports.Product = mongoose.model('Product', productSchema);
