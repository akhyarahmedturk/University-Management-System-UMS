const path = require('path');
const express = require('express');
const router = express.Router();

router.get(['/', '/index', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, '..','public', 'views', 'index.html'));
});

module.exports = router;
