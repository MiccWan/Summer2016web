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
		exec           = require('child_process').exec,
		async          = require('async');

var router     = express.Router({mergeParams: true});
var middleware = require('../middleware/');

var User  = require("../models/User.js"),
		Class = require('../models/class.js'),
		Note  = require('../models/note.js'),
		Judge = require('../models/judge.js');

var pythonJudge = require('../lib/pythonJudge.js'),
		cppJudge    = require('../lib/cppJudge.js');

//Resources
router.get('/class/:className/resource', middleware.isLoggedIn, function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong');
			res.redirect('back');
		} else {
			res.render('resource/' + foundClass.name, {inforClass: foundClass});
		}
	});
});

//Class
router.get('/class/sai', middleware.isLoggedIn, function(req, res) {
	res.render('class/sai');
});

//Class - index
router.get('/class/:className', middleware.isLoggedIn, function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
			
		} else {
			res.render('class/' + foundClass.name, {inforClass: foundClass});
		}
	});
});


module.exports = router;
