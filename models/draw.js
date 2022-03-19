const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const drawSchema = new Schema({
    coordinate : { type: Array },
    timeStarted: { type: String, required: true },
    timeDone: { type: String, required: true },
    firstKide: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    secondKide: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    sync: {type: String, default: 0}
});

module.exports = mongoose.model('Draw', drawSchema);