const {Order} = require('../models/order');
const express = require('express');
const {OrderItem} = require('../models/order-item');
const router = express.Router();

// http://localhost:3000/api/v1/orders          
router.get(`/`, async (req, res)=>{          // 'await' in the function, need to add 'async' in front of function. return a promise followed by .then().catch()
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1})
    .populate({path: 'orderItems', populate: 'product'});           // await - step by step run the function. wait until function finish and return the value if promise success, then run next code
    if (!orderList) {                                           // sort the orderList in reverse order by .sort({'dateOrdered': -1}). Otherwise, .sort('dateOrdered')
        res.status(500).json({success: false})
    }
    res.send(orderList);
})

router.get(`/:id`, async (req, res)=>{          // 'await' in the function, need to add 'async' in front of function. return a promise followed by .then().catch()
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    });   // populate the 'product'/'bbb' information in orderItems array 'aaa' - .populate({path: 'aaa", populate: 'bbb'})

    if (!order) {                                          
        res.status(500).json({success: false})
    }
    res.send(order);
})

// add new data into database
router.post('/', async (req, res)=>{
    // created orderitem database

    const promises = req.body.orderItems.map(async orderItem => {        // use map to loop inside the orderitems which are sent from the user
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;            // only return the newOrderItem's id
    })
    const orderItemsIds = Promise.all(promises)     // Promise.all(take array of promise) when all promise returns result, it can return a single promise result
    
    const orderItemsIdsResolved = await orderItemsIds;
    // console.log(orderItemsIdsResolved);

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a,b) => a+b, 0)  //.reduce() - combine every item of the array

    let order = new Order({
        orderItems: orderItemsIdsResolved,             // store/relate orderitems with the order. not get orderitem directly from user, but requires an array of orderItems ids 
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress1: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    })
    order = await order.save();

    if(!order)
    return res.status(404).send('the order cannot be created!');

    res.send(order);
})

// update data in database, get param (id) and update body
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true }
    )

    if(!order)
    return res.status(404).send('the category cannot be updated!');

    res.send(order);
})

router.delete('/:id', (req, res)=> {
    Order.findByIdAndRemove(req.params.id).then(async order=> {     // change to 'async' because 'await' inside the function
        if (order) {
            await order.OrderItems.map(async orderItem => {         // synchronize: waiting for every delete to be done
                await OrderItem.findByIdAndRemove(orderItem)        // every item to be deleted and return a promise in async function
            })
            return res.status(200).json({success: true, message: 'the order is deleted'})
        } else {
            return res.status(404).json({success: false, message: 'order not found!'})
        } 
    }).catch(err => {
        return res.status(400).json({success:false, error: err})
    })
})

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([          //.aggregate() can join all related database inside that table to one, and get one of these fields in that table and use Mongoose method .sum()
        { $group: { _id: null, totalsales: { $sum: '$totalPrice'}} }
    ])

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }
    res.send({totalsales: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res)=>{          
    const orderCount = await Order.countDocuments((count) => count).clone();    
    if (!orderCount) {
        res.status(500).json({success: false})
    }
    res.send({
        orderCount: orderCount
    });
})

router.get(`/get/userorders/:userid`, async (req, res)=>{          
    const userOrderList = await Order.find({user: req.params.userid}).populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'}
        }).sort({'dateOrdered': -1});

    if (!userOrderList) {                                          
        res.status(500).json({success: false})
    }
    res.send(userOrderList);
    
})

module.exports = router;