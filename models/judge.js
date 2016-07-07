var mongoose =  require('mongoose');

var judgeSchema = new mongoose.Schema({
	number: Number,
	data: Number,
	name: String,
	description: String,
	input: [String],
	output: [String]
});

module.exports = mongoose.model("Judge", judgeSchema);
