const expressJwt = require('express-jwt');

function authJwt() {                            // decode and check token
    const secret = process.env.secret;
    const api = process.env.API_URL;

    return expressJwt({
         secret,
         algorithms: ['HS256'],
         isRevoked: isRevoked
    }).unless({                                 // the whole api want to exclude
        path: [
            {url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS']},    // `${api}/products` allow exclude products get method
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},    // `${api}/products` allow exclude products get method
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']}, 
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    })
}

async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        done(null, true);           // reject the token if not admin
    }
    
    done();
}

module.exports = authJwt;