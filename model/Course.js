const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    name: { type: String, required: true },
    code:{type: String, required:true, unique:true},
    ch: { type: Number, min: 1, max: 4 },//credit hours
    faculties: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Faculty'
        }
    ]
});


module.exports = mongoose.model('Course', courseSchema);


