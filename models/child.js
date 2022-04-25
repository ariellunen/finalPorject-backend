const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const childSchema = new Schema({
    name: { type: String, required: true },
    drawing: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Draw' }],
});

childSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Child ', childSchema);


