const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// http://localhost:3000/api/v1/users          
router.get(`/`, async (req, res)=>{          // 'await' in the function, need to add 'async' in front of function. return a promise followed by .then().catch()
    const userList = await User.find().select('-passwordHash');           // await - step by step run the function. wait until function finish and return the value if promise success, then run next code
    if (!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
})

router.get('/:id', async (req, res)=> {
    const user = await User.findById(req.params.id).select('-passwordHash');   // .select('-fields') means exclude some fields || .select('fields) means only include some fields

    if (!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})

// add new data into database
router.post('/', async (req, res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    user = await user.save();

    if(!user)
    return res.status(404).send('the category cannot be created!');

    res.send(user);
})

router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email});   // check if email exists
    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send('The user not found!');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {     // check if password is valid
        const token = jwt.sign(                                 // generate token which contains information like userId and isAdmin
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret, 
            {expiresIn : '1d'}
        )
        res.status(200).send({user: user.email, token: token});
    } else {
        res.status(400).send('password is wrong!');
    }
})

router.post('/register', async (req, res) => {
    let user = new User ({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    user = await user.save();

    if (!user) return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.delete('/:id', (req, res)=> {
    User.findByIdAndRemove(req.params.id).then(user=> {
        if (user) {
            return res.status(200).json({success: true, message: 'the user is deleted'})
        } else {
            return res.status(404).json({success: false, message: 'user not found!'})
        } 
    }).catch(err => {
        return res.status(400).json({success:false, error: err})
    })
})

// get users count
router.get(`/get/count`, async (req, res)=>{          
    const userCount = await User.countDocuments((count) => count).clone();    
    if (!userCount) {
        res.status(500).json({success: false})
    }
    res.send({
        userCount: userCount
    });
})

module.exports = router;