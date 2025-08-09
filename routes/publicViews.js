const express = require('express');
const path = require('path');
const router = express.Router();

router.get(['/', '/index.html', '/register.html','404.html'], (req, res) => {
    const view = req.path === '/' ? 'index.html' : req.path.substring(1);
    const filePath = path.join(__dirname, '..', 'views', view);
    res.sendFile(filePath);
});

module.exports = router;
