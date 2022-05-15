const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

// http://localhost:3000/api/v1/categories          
router.get(`/`, async (req, res)=>{                       // 'await' in the function, need to add 'async' in front of function. return a promise followed by .then().catch()
    const categoryList = await Category.find();           // await - step by step run the function. wait until function finish and return the value if promise success, then run next code
    if (!categoryList) {
        res.status(500).json({success: false})
    }
    res.status(200).send(categoryList);
})

router.get('/:id', async (req, res)=> {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(500).json({message: 'The category with the given ID was not found.'})
    } 
    res.status(200).send(category);
    })

// add new data into database
router.post('/', async (req, res)=>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save();

    if(!category)
    return res.status(404).send('the category cannot be created!');

    res.send(category);
})

// update data in database, get param (id) and update body
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        { new: true }
    )

    if(!category)
    return res.status(404).send('the category cannot be updated!');

    res.send(category);
})

// api/v1/categories/id
router.delete('/:id', (req, res)=> {
    Category.findByIdAndRemove(req.params.id).then(category=> {
        if (category) {
            return res.status(200).json({success: true, message: 'the category is deleted'})
        } else {
            return res.status(404).json({success: false, message: 'category not found!'})
        } 
    }).catch(err => {
        return res.status(400).json({success:false, error: err})
    })
})

module.exports = router;