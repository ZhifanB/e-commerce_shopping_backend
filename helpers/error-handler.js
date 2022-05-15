function errorHandler(err, req, res, next) {

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({message: "The user is not authrozied"})
    }

    if (err.name === 'ValidationError') {
        return res.status(401).json({message: err})
    }
    
    return res.status(500).json({err: "error in the server"})    // if general error
}

module.exports = errorHandler;