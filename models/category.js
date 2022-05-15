const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
   name: {
       type: String,
       required: true
   },
   icon: {
       type: String
   },
   color: {
       type: String
   }
})


// model assigns the schema a name. const Product is an instance of mongoose model
// exports. to export Product into app.js
exports.Category = mongoose.model('Category', categorySchema);