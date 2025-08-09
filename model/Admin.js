const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, //  hashed
    role: { type: Number, default: 5500 },
    refreshToken:String
});

module.exports = mongoose.model('Admin', AdminSchema);