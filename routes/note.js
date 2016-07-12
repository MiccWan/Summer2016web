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


//Note - index
router.get('/', middleware.isLoggedIn, function(req, res) {
	var name = req.params.className;
	Class.findOne({"name": name}).populate("notes").exec(function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
			
		}
		else {
			res.render('notes/note', {inforClass: foundClass});
		}
	});
});

//Note - New
router.get('/new', middleware.isTeacher, function(req, res) {
	var name = req.params.className;
	Class.findOne({name: name}, function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
			
		}
		else {
			res.render('notes/new', {inforClass: foundClass});
		}
	});
});

router.post('/', middleware.isTeacher, function(req, res) {
	var name = req.params.className;
	Class.findOne({"name": name}, function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
		}
		else {
			Note.create({content: req.body.text}, function(err, note) {
				if (err) {
					console.log(err);
					req.flash('error', 'Jizz, something went wrong...');
					res.redirect('back');
					
				}
				else {
					note.save();
					foundClass.notes.push(note);
					// console.log(note.content);
					foundClass.save();
					req.flash('success', 'Yeah, new note');
					res.redirect('/class/' + foundClass.name + '/note');
					
				}
			});
		}
	});
});

//Note - Edit
router.get('/:id/edit', middleware.isTeacher, function(req, res) {
	var name = req.params.className;
	Class.findOne({name: name}, function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
			
		}
		else {
			Note.findById(req.params.id, function(err, foundNote) {
				if (err) {
					console.log(err);
					req.flash('error', 'Jizz, something went wrong...');
					res.redirect('back');
					
				}
				else {
					res.render('notes/edit', {inforClass: foundClass, note: foundNote});
				}
			});
		}
	});
});

router.put('/:id', middleware.isTeacher, function(req, res) {
	var text = req.body.text;
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		Note.findByIdAndUpdate(req.params.id, {content: text}, function(err, note) {
			if (err) {
				console.log(err);
				req.flash('error', 'Jizz, something went wrong...');
				res.redirect('back');
				
			}
			else {
				console.log(note);
				console.log(foundClass);
				req.flash('success', 'Note edited successfully');
				res.redirect('/class/' + req.params.className + '/note');
			}
		});
	});
});

//Note - Delete
router.delete('/:id', middleware.isTeacher, function(req, res) {
	Note.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
			
		}
		else {
			req.flash('success', 'Note deleted successfully');
			res.redirect('/class/' + req.params.className + '/note');
			
		}
	});
});

module.exports = router;