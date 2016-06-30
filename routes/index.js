var express       = require('express'),
	  router        = express.Router({mergeParams: true}),
	  passport      = require('passport'),
	  localStrategy = require('passport-local');

var Note  = require('../models/note.js'),
	  Class = require('../models/class.js'),
	  Judge = require('../models/judge.js'),
	  User  = require('../models/User.js');

var middleware = require('../middleware/');

//Index
router.get('/', function(req, res) {
	res.render('index');
});

//Profile
router.get('/profile', middleware.isLoggedIn, function(req, res) {
	res.render('profile');
});

//Rank
router.get('/rank', function(req, res) {
	User.find({}, function(err, allUser) {
		if (err) {
			console.log(err);
		} else {
			allUser.sort(function(a, b) {
				return a.rank < b.rank;
			});
			res.render('rank', {allUser: allUser});
		}
	});
});

//Login
router.get('/login', function(req, res) {
	res.render('login');
});

router.post('/login', passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login'
	}), function(req, res) {

});

//Logout
router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

//Register
router.get('/register', function(req, res) {
	res.render("register");
});

router.post('/register', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	User.register(new User({username: username}), password, function(err, user) {
		if (err) {
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req, res, function() {
			res.redirect('/');
		});
	});
});


//Class - index
router.get('/:className', middleware.isLoggedIn, function(req, res) {
	var name = req.params.className;
	Class.findOne({"name": name}, function(err, foundClass) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('class', {inforClass: foundClass});
		}
	});
});

module.exports = router;