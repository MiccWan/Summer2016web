var mongoose = require('mongoose');
var Note = require('./note.js');

var classSchema = new mongoose.Schema({
	name: String,
	notes: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Note"
	}],
	book: String
});

module.exports = mongoose.model("Class", classSchema);