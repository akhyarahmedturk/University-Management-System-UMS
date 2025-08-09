const jwt = require('jsonwebtoken');
const ROLES = require('../config/roleList');

function verify_JWT(req, res, next) {
    const token = req.cookies.jwt;
    if (!token) return res.sendStatus(401);
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403);
            if (!req.body) req.body = {};
            req.body.role = Number(decoded.userinfo.role);
            if (req.body.role == ROLES.STUDENT) req.body.studentID = decoded.userinfo._id;
            else if (req.body.role == ROLES.ADMIN) req.body.adminID = decoded.userinfo._id;
            else if (req.body.role == ROLES.FACULTY) req.body.facultyID = decoded.userinfo._id;
            next();
        }
    );
}

module.exports = verify_JWT;
