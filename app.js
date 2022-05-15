const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

// Middleware
app.use(express.json());    // express help to pass JSON to object
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());
app.use(authJwt());         // server is secured based on token, any request comes in will be asked authentication
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);      // run errorHandler function

// Routes
const categoriesRouters = require('./routers/categories');
const productsRouters = require('./routers/products');
const usersRouters = require('./routers/users');
const ordersRouters = require('./routers/orders');

const api = process.env.API_URL;

// Routers
app.use(`${api}/categories`, categoriesRouters);
app.use(`${api}/products`, productsRouters);
app.use(`${api}/users`, usersRouters);
app.use(`${api}/orders`, ordersRouters);


var connectback = mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME
    });   // var connectback is an instance of Promise; Promise is a completion event (async success or fail)
connectback.then(response => {
    console.log("Database Connection is ready ...");
}).catch(error => console.log(error));

const PORT = process.env.PORT || 3000;      // if port is undefined, use PORT=3000

//Server start                    //listen to 3000 port. callback will give or be executed when there is successful creation of the server
app.listen(PORT, ()=>{
    console.log(api);
    console.log('server is running http://localhost:3000');
})
