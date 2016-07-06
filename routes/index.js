var express        = require('express'),
		app            = express(),
		bodyParser     = require('body-parser'),
		mongoose       = require('mongoose'),
		passport       = require('passport'),
		localStrategy  = require('passport-local'),
		methodOverride = require('method-override'),
		flash          = require('connect-flash'),
		fs             = require('fs'),
		tmp            = require('tmp'),
		execFile       = require('child_process').execFile;

var router     = express.Router();
var middleware = require('../middleware/');

var User  = require("../models/User.js"),
		Class = require('../models/class.js'),
		Note  = require('../models/note.js'),
		Judge = require('../models/judge.js');

//Index
router.get('/', function(req, res) {
	res.render('index');
});

//Profile
router.get('/profile', middleware.isLoggedIn, function(req, res) {
	res.render('index/profile');
});

//Rank
router.get('/rank', function(req, res) {
	User.find({}, function(err, allUser) {
		if (err) {
			console.log(err);
			req.flash("error", "Jizz, something went wrong...");
			res.redirect("back");
			
		} else {
			allUser.sort(function(a, b) {
				return rankSum(a) > rankSum(b);
			});
			res.render('index/rank', {allUser: allUser});
		}
	});
});

function rankSum(a) {
	return a.rank.python + a.rank.cpp + a.rank.java;
}

//Login
router.get('/login', function(req, res) {
	res.render('index/login');
});

router.post('/login', passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login'
	}), function(req, res) {
	req.flash('success', 'Successfully Log In!');
});

//Logout
router.get('/logout', function(req, res) {
	req.logout();
	req.flash("success", "You have logged out");
	res.redirect('/');
});

//Register
router.get('/register', function(req, res) {
	res.render("index/register");
});

router.post('/register', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	User.register(new User({username: username}), password, function(err, user) {
		if (err) {
			console.log(err);
			req.flash("error", "Jizz, something went wrong...");
			return res.render('index/register');
		}
		passport.authenticate('local')(req, res, function() {
			req.flash("success", "Successfully Sign Up!");
			res.redirect('/');
		});
	});
});

module.exports = router;