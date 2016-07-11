'use strict'
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
		execFile       = require('child_process').execFile,
		async          = require('async');

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
	var score = [];
	score[0] = 0;
	score[1] = 0;
	var py, cpp;
	var t = [[], []];	
	var name = ['python', 'cpp'];
	var task = [];
	
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
			res.render('index/rank', {allUser: allUser, rankSum: rankSum});
		}
	});
});

function rankSum(a) {
	var sum1 = 0;
	var sum2 = 0;
	a.rank.python.forEach(function(p) {
		if (p)
			sum1 += p;
	});
	a.rank.cpp.forEach(function(p) {
		if (p)
			sum2 += p;
	});
	return sum1 + sum2;
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