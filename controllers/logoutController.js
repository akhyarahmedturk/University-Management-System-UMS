const jwt = require('jsonwebtoken');
const Student = require('../model/Student');
const Faculty = require('../model/Faculty');
const Admin = require('../model/Admin');


async function handle_logout(req, res) {
    try {
        const cookies = req.cookies;
        // token retrieval + user search
        if (!cookies || !cookies.jwt) return res.sendStatus(204);

        // found_user.refreshToken = "";
        // await found_user.save();
        res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' });
        return res.sendStatus(204);
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed." });
    }
}

module.exports = handle_logout;