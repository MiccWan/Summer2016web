var mongoose              = require('mongoose'),
		passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	rank: {
		python: {type: Number, default: 0},
		cpp: {type: Number, default: 0},
		java: {type: Number, default: 0}
	},
	judges: {
		python: [{type: String, default: "--"}],
		cpp: [{type: String, default: "--"}],
		java: [{type: String, default: "--"}]
	}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);