const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
   quantity: {
       type: Number,
       required: true
   },
   product: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Product'
   }
})

// model assigns the schema a name. const Product is an instance of mongoose model
// exports. to export Product into app.js
exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);