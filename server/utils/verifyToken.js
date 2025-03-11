const e = require("../utils/error");
const jwt=require("jsonwebtoken")

const verifyToken = (req, res, next) => {

        const token = req.cookies.access_token;
        console.log('Request Headers:', req.headers);

        
        if (!token) {
        return next(e.errorHandler(401, 'Unauthorized'));
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(e.errorHandler(401, 'Unauthorized'));
        }
        req.user = user;
        next();
        });
    };

    module.exports = {
        verifyToken
    };