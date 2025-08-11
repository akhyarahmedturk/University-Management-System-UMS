const Student = require('../model/Student');
const Faculty = require('../model/Faculty');
const Admin = require('../model/Admin');
const ROLES = require('../config/roleList');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



async function handle_login(req, res) {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: "Email and password are required to login!" });

    let found_user;
    if (role == ROLES.FACULTY) found_user = await Faculty.findOne({ email });
    else if (role == ROLES.STUDENT) found_user = await Student.findOne({ email });
    else if (role == ROLES.ADMIN) found_user = await Admin.findOne({ email });
    if (!found_user) {
        return res.status(401).json({ 'message': "Email not found!" });
    }
    try {
        const password_check = await bcrypt.compare(password, found_user.password);
        if (!password_check) return res.status(401).json({ 'message': "You entered wrong password!" });

        const accessToken = jwt.sign(
            {
                "userinfo": {
                    "_id": found_user._id,
                    "role": found_user.role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { 'expiresIn': '1h' }
        );
        // const refresh_token = jwt.sign(
        //     { "_id": found_user._id, role: found_user.role },
        //     process.env.REFRESH_TOKEN_SECRET,
        //     { 'expiresIn': '1d' }
        // );
        // found_user.refreshToken = refresh_token;
        await found_user.save();
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 1 * 60 * 60 * 1000 });// 1 hour
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json(`Error while authenticating: ${err.message}`);
    }
}

module.exports = handle_login;