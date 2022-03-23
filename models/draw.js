const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const drawSchema = new Schema({
    firstCoordinate : { type: Array },
    secondCoordinate : { type: Array },
    timeStarted: { type: String, required: true },
    timeDone: { type: String, required: true },
    firstKide: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    secondKide: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    sync: {type: String, default: 0},
    video: {type: String}
});

module.exports = mongoose.model('Draw', drawSchema);