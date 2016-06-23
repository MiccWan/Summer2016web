var mongoose =  require('mongoose');

var judgeSchema = new mongoose.Schema({
	name: String,
	description: String,
	input: String,
	output: String
});

module.exports = mongoose.model("Judge", judgeSchema);
