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
	if (req.isAuthenticated()) {
		res.redirect('/index');
	} else {
		res.redirect('/login');	
	}
	
});

router.get('/index', middleware.isLoggedIn, function(req, res) {
	res.render('index');
});

//Profile
router.get('/profile', middleware.isLoggedIn, function(req, res) {
	var pyCnt = 0; var cppCnt = 0;
	var p = []; var c = [];
	var t = 0;
	var delay = 500;
	var py = [];
	var cpp = []
	Class.findOne({name: 'python'}, function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			for (let i = 0; i < foundClass.judges.length; i++) {
				p.push(function(cb) {
					Judge.findById(foundClass.judges[i], function(err ,judge) {
						let j = judge;
						cb(err, j);	
					});
				});
			}
			async.series(p, (err, results) => {
				if (err) {
					console.log(err);
				} else {
					for (let i = 0; i < foundClass.judges.length; i++) {
						if (results[i]) {
							pyCnt++;
							py.push(results[i]._id);
						}
					}
				}
			});
		}
	});
	setTimeout(function() {
		Class.findOne({name: 'cpp'}, function(err, foundClass) {
			if (err) {
				console.log(err);
			} else {
				for (let i = 0; i < foundClass.judges.length; i++) {
					c.push(function(cb) {
						Judge.findById(foundClass.judges[i], function(err, judge) {
							let j = judge;
							cb(err, j);
						});
					});
				}
				async.series(c, (err, results) => {
					if (err) {
						console.log(err);
					} else {
						for (let i = 0; i < foundClass.judges.length; i++) {
							if (results[i]) {
								cppCnt++;
								cpp.push(results[i]._id)
							}
						}
						Judge.find({}, function(err, allJudge) {
							if (err) {
								console.log(err);
							} else {
								res.render('index/profile', {pyCnt: pyCnt, cppCnt: cppCnt, user: req.user, py: py, cpp: cpp, allJudge: allJudge});
							}
						});	
					}
				});
			}
		});
	}, delay);
});

//Profile
router.get('/profile/:username', middleware.isLoggedIn, function(req, res) {
	var pyCnt = 0; var cppCnt = 0;
	var p = []; var c = [];
	var t = 0;
	var delay = 500;
	var py = [];
	var cpp = [];
	// console.log(req.params.username);
	User.findOne({username: req.params.username}, function(err, user) {
		Class.findOne({name: 'python'}, function(err, foundClass) {
			if (err) {
				console.log(err);
			} else {
				for (let i = 0; i < foundClass.judges.length; i++) {
					p.push(function(cb) {
						Judge.findById(foundClass.judges[i], function(err ,judge) {
							let j = judge;
							cb(err, j);	
						});
					});
				}
				async.series(p, (err, results) => {
					if (err) {
						console.log(err);
					} else {
						for (let i = 0; i < foundClass.judges.length; i++) {
							if (results[i]) {
								pyCnt++;
								py.push(results[i]._id);
							}
						}
					}
				});
			}
		});
		setTimeout(function() {
			Class.findOne({name: 'cpp'}, function(err, foundClass) {
				if (err) {
					console.log(err);
				} else {
					for (let i = 0; i < foundClass.judges.length; i++) {
						c.push(function(cb) {
							Judge.findById(foundClass.judges[i], function(err, judge) {
								let j = judge;
								cb(err, j);
							});
						});
					}
					async.series(c, (err, results) => {
						if (err) {
							console.log(err);
						} else {
							for (let i = 0; i < foundClass.judges.length; i++) {
								if (results[i]) {
									cppCnt++;
									cpp.push(results[i]._id)
								}
							}
							Judge.find({}, function(err, allJudge) {
								if (err) {
									console.log(err);
								} else {
									res.render('index/profile', {pyCnt: pyCnt, cppCnt: cppCnt, user: user, py: py, cpp: cpp, allJudge: allJudge});
								}
							});	
						}
					});
				}
			});
		}, delay);
	});
});



//Rank
router.get('/rank', function(req, res) {
	User.find({}, function(err, allUser) {
		if (err) {
			console.log(err);
			req.flash("error", "Jizz, something went wrong...");
			res.redirect("back");
			
		} else {
			let users = [];
			for (let i = 0; i < allUser.length; i++) {
				users.push(allUser[i]);
			}
			var filtered = users.filter(isStudent);
			filtered.sort(function(a, b) {
				return rankSum(a) < rankSum(b);
			});
			res.render('index/rank', {allUser: filtered, rankSum: rankSum});
			// res.send(filtered);
		}
	});
});

function rankSum(a) {
	var sum = 0;
	a.rank.python.forEach(function(p) {
		if (p) {
			sum += p;
		}
	});
	a.rank.cpp.forEach(function(p) {
		if (p) {
			sum += p;
		}
	});
	return sum;
}

function isStudent(a) {
	return a.username.substring(0, 7) != 'summer_';
}

//Login
router.get('/login', function(req, res) {
	if (req.isAuthenticated()) {
		res.redirect('/index');
	} else {
		res.render('index/login');	
	}
	
});

router.post('/login', passport.authenticate('local', {
		successRedirect: '/index',
		failureRedirect: '/login'
	}), function(req, res) {
	req.flash('success', 'Successfully Log In!');
});

//Logout
router.get('/logout', function(req, res) {
	req.logout();
	req.flash("success", "You have logged out");
	res.redirect('/index');
});

//Register
router.get('/register', function(req, res) {
	res.render("index/register");
});

router.post('/register', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var nickname = req.body.nickname;
	User.register(new User({username: username, nickname: nickname}), password, function(err, user) {
		if (err) {
			console.log(err);
			req.flash("error", "Jizz, something went wrong...");
			return res.render('index/register');
		}
		passport.authenticate('local')(req, res, function() {
			req.flash("success", "Successfully Sign Up!");
			res.redirect('/index');
		});
	});
});

module.exports = router;