var mongoose = require('mongoose');

var noteSchema = new mongoose.Schema({
	content: String,
	create: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Note", noteSchema);