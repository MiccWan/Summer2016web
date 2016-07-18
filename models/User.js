var mongoose              = require('mongoose'),
		passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	username: String,
	nickname: String,
	password: String,
	rank: {
		python: [],
		cpp: [],
	},
	judges: {
		python: [],
		cpp: [],
	}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);