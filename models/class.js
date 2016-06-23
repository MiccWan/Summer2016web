var mongoose = require('mongoose');
var Note = require('./note.js');
var Judge = require('./judge.js');

var classSchema = new mongoose.Schema({
	name: String,
	notes: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Note"
	}],
	book: String,
	judges: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Judge"
	}]
});

module.exports = mongoose.model("Class", classSchema);