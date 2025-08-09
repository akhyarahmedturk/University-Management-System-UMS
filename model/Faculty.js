const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const facultySchema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true }, //  hashed
    email: { type: String, required: true, unique:true},
    designation:{type:String, required:true},
    role:{type:Number, default:1818},
    verified:{type:Boolean ,default:false},
    courses:[{ type: Schema.Types.ObjectId, ref: 'Course' }],
    refreshToken:String
});


module.exports = mongoose.model('Faculty', facultySchema);