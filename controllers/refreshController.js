const jwt = require('jsonwebtoken');
const Student = require('../model/Student');
const Faculty = require('../model/Faculty');
const Admin = require('../model/Admin');



async function handle_refresh(req, res) {
    const cookies = req.cookies;
    if (!cookies || !cookies.jwt) return res.status(401).json({ message: "Unauthorized" });
    const refreshToken = cookies.jwt;

    const found_user = await Student.findOne({ refreshToken })
        || await Faculty.findOne({ refreshToken })
        || await Admin.findOne({ refreshToken });
    if (!found_user) {
        return res.status(401).json({ 'message': "user not found!" });
    }
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || found_user._id.toString() !== decoded._id) return res.sendStatus(403); // 403:Invalid token
            const accessToken = jwt.sign(
                {
                    "userinfo": {
                        "_id": found_user._id,
                        "role": found_user.role
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { 'expiresIn': '5m' }
            );
            res.json({ accessToken });
        }
    )
}

module.exports = handle_refresh;