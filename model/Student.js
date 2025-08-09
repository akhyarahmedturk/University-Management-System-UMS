const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: { type: String, required: true },
    rollNo: { type: String, required: true ,unique:true},
    password: { type: String, required: true }, //  hashed
    department: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    email: { type: String, required: true, unique: true },
    cgpa: { type: Number, min: 0, max: 4, default:null },
    coursesPassed:[
        {
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
                required: true
            },
            Grade: Number
        }
    ],
    currentCourses: [
        {
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
                required: true
            },
            faculty: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Faculty',
                required: true
            }
        }
    ],
    role:{type:Number, default:2828},
    refreshToken:String
});


module.exports = mongoose.model('Student', studentSchema);