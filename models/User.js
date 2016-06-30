var mongoose              = require('mongoose'),
		passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	rank: {type: Number, default: 0},
	judges: [{
		type: String,
		default: "--"
	}]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);