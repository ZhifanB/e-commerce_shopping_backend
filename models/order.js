const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems: [{                               // orderItems array [] by passing orderItems in order
       type: mongoose.Schema.Types.ObjectId,
       ref: 'OrderItem',
       required: true
    }],
    shippingAddress1: {
       type: String,
       required: true
    },
    shippingAddress2: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Pending'
    },
    totalPrice: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
})

// re-format "id"
orderSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true
});

// model assigns the schema a name. const Product is an instance of mongoose model
// exports. to export Product into app.js
exports.Order = mongoose.model('Order', orderSchema);