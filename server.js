require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
// const verify_jwt = require('./middleware/verify_JWT');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connect_DB = require('./config/dbConnect');
const verify_JWT = require('./middleware/verifyJWT');
const { loginLimmiter, generalLimiter } = require('./middleware/rateLimmiter');
const mongoSanitize = require('express-mongo-sanitize');
const { log } = require('console');

connect_DB();

const PORT = process.env.PORT || 3500;

app.use(cors({
    origin: '*', // or "*" for dev/testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// app.use((req, res, next) => {
//     res.set('Cache-Control', 'no-store');
//     next();
// });


app.use(express.json());

app.use(cookieParser());

app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/', require('./routes/publicViews'));

app.use(express.static(path.join(__dirname, '/public')));

app.use(generalLimiter);
app.use(verify_JWT);

app.use('/protected', require('./routes/protectedViews'));
app.use('/logout', require('./routes/logout'));

app.use('/student', require('./routes/student'));
app.use('/faculty', require('./routes/faculty'));
app.use('/course', require('./routes/course'));
// app.use('/admin', require('./routes/admin'));



app.all(/^.*$/, (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});


mongoose.connection.once('open', () => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});