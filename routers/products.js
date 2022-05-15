// responsible for creating, adding, storing, importing and exporting APIs btw files

const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg',

}

// upload file to server via multer library
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('inlavid image type');
        if(isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')         //callback will be returned if there is an error in uploading and assigning the destination in it
    },
    filename: function (req, file, cb) {
        
        const fileName = file.originalname.replace(' ', '-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now}.${extension}`);
    }
})

const uploadOptions = multer({storage: storage})

// http://localhost:3000/api/v1/products          
router.get(`/`, async (req, res)=>{          // 'await' in the function, need to add 'async' in front of function. return a promise followed by .then().catch()
    // const product = {
    //     id: 1,
    //     name: 'hair dresser',
    //     image: 'some_url',
    // }
    
    // localhost:3000/api/v1/products?catergories=23323,23213     -> query parameters always use ? after url
    let filter = {};
    if (req.params.categories) {
        filter = {category: req.query.categories.split(',')};         // create the array for .find({category: []})
    }
    // await - step by step run the function. wait until function finish and return the value if promise success, then run next code
    const productList = await Product.find(filter).populate('category');      //await Product.find().select('name image -_id') can pick specific items in the data to show
    if (!productList) {                 // above code: filter = {category: []} - use array to pass long input
        res.status(500).json({success: false})
    }
    res.statusCode = 200;
    res.send(productList);
})

router.get(`/:id`, async (req, res)=>{          
    const productList = await Product.findById(req.params.id).populate('category');    //.populate() - any connected id ('category') field or another table will be displayed in this field
    if (!productList) {
        res.status(500).json({success: false})
    } 
    res.statusCode = 200;
    res.send(productList);
})

router.post(`/`, uploadOptions.single('image'), async (req, res)=>{
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,        // "http://localhost:3000/public/upload/image-20211020"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

    product = await product.save();
    if (!product) return res.status(500).send('The product cannot be created');

    res.send(product);

    // // save() is an api call. return an instance of promise
    // product.save().then((createdProduct=> {
    //     res.status(201).json(createdProduct)
    // })).catch((error)=> {
    //     res.status(500).json({
    //         error:error,
    //         success: false
    //     })
    // })
    // res.statusCode = 200;
    // res.send(newProduct);
})

// update data in database, get param (id) and update body
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid product id');     // if passing wrong id, API returns error
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid category');

    const products = await Product.findById(req.params.id);
    if(!products) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if(file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`
    } else {
        imagepath = product.image;
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    )

    if(!product)
    return res.status(500).send('the product cannot be updated!');  //status(500) -> internal server error 

    res.send(product);
})

router.delete('/:id', (req, res)=> {
    Product.findByIdAndRemove(req.params.id).then(product=> {
        if (product) {
            return res.status(200).json({success: true, message: 'the category is deleted'})
        } else {
            return res.status(404).json({success: false, message: 'category not found!'})
        } 
    }).catch(err => {
        return res.status(400).json({success:false, error: err})
    })
})

router.get(`/get/count`, async (req, res)=>{          
    const productCount = await Product.countDocuments((count) => count).clone();    
    if (!productCount) {
        res.status(500).json({success: false})
    }
    res.send({
        productCount: productCount
    });
})

// get featured products
router.get(`/get/featured/:count`, async (req, res)=>{   
    const count = req.params.count ? req.params.count : 0     // if there is count passed with the API, then get it. if not, return 0
    let products = await Product.find({isFeatured: true}).limit(+count);   // .limit() to limit featured products to count (eg. 3). use '+count' to cast entered string to number
    if (!products) {
        res.status(500).json({success: false})
    }
    res.send(products);
})

// update image gallery
router.put(
    '/gallery-images/:id', 
    uploadOptions.array('images', 10), 
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid product id');     // if passing wrong id, API returns error
        }

        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map(file => {
                imagesPaths.push(`${basePath}${file.filename}`);
            })

            console.log("here")
        }
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true }
        )

        if(!product)
            return res.status(500).send('the product cannot be updated!');  //status(500) -> internal server error 

        res.send(product);
    }
)


module.exports = router;