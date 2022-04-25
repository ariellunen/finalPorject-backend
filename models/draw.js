const mongoose = require('mongoose');
var moment = require('moment-timezone');

const Schema = mongoose.Schema;


const drawSchema = new Schema({
    coordinate : { type: Array },
    timeStarted: { type: Object, required: true },
    timeDone: { type: Object, required: true },
    firstKide: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    secondKide: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    sync: {type: String, default: 0},
    colorFirst:{type: String, required: true},
    colorSecond:{type: String, required: true},
});

module.exports = mongoose.model('Draw', drawSchema);