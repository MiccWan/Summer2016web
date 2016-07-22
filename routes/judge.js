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


//Judge -Index
router.get('/', middleware.isLoggedIn, function(req, res) {
	Class.findOne({name: req.params.className}).populate('judges').exec(function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash("error", "Jizz, something went wrong...");
			res.redirect("back");
			
		} else {
			foundClass.judges.sort(function(a, b) {
				return a.number - b.number;
			});
			res.render('judges/allJudges', {inforClass: foundClass});
		}
	});
});

//Judge - New
router.get('/new', middleware.isTeacher, function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash("error", "Jizz, something went wrong...");
			res.redirect('back');
		} else {
			res.render('judges/new', {inforClass: foundClass});
		}
	});
});

router.post('/', middleware.isTeacher, function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
		} else {
			var name = req.body.name;
			var number = parseInt(req.body.number);
			var description = req.body.description;
			var input = req.body.input;
			var output = req.body.output;
			var data = parseInt(req.body.data);
			var exInput = req.body.exInput;
			var exOutput = req.body.exOutput;
			Judge.create({name: name, number: number, data: data, description: description, input: input, output: output, exInput: exInput, exOutput: exOutput}, function(err, judge) {
				if (err) {
					console.log(err);
					req.flash('error', 'Jizz, something went wrong...');
					res.redirect('back');
					
				} else {
					judge.save();
					foundClass.judges.push(judge);
					foundClass.save();
					req.flash('success', 'Yeah, new judge');
					res.redirect('/class/' + foundClass.name + '/judge');
				}
			});
		}
	});
});

//Judge - Edit
router.get('/:id/edit', middleware.isTeacher, function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
		} else {
			Judge.findById(req.params.id, function(err, judge) {
				if (err) {
					console.log(err);
					req.flash('error', 'Jizz, something went wrong...');
					res.redirect('back');
				} else {
					res.render('judges/edit', {inforClass: foundClass, judge: judge});
				}
			});
		}
	});
});

router.put('/:id', middleware.isTeacher, function(req, res) {
	var name = req.body.name;
	var number = parseInt(req.body.number);
	var description = req.body.description;
	var input = req.body.input;
	var output = req.body.output;
	var exInput = req.body.exInput;
	var exOutput = req.body.exOutput;
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
		} else {
			Judge.findByIdAndUpdate(req.params.id, {name: name, number: number, description: description, input: input, output: output, exInput: exInput, exOutput: exOutput}, function(err, judge) {
				if (err) {
					console.log(err);
					req.flash('error', 'Jizz, something went wrong...');
					res.redirect('back');
				} else {
					req.flash('success', 'Judge edited successfully');
					res.redirect('/class/' + foundClass.name + '/judge');
				}
			});
		}
	});
});

//Judge - Delete
router.delete('/:id', middleware.isTeacher, function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
		} else {
			Judge.findByIdAndRemove(req.params.id, function(err, judge) {
				if (err) {
					console.log(err);
					req.flash('error', 'Jizz, something went wrong...');
					res,redirect('back');
				} else {
					let num = judge.number;
					User.find({}, function(err, user) {
						if (err) {
							console.log(err);
						} else {
							user.forEach(function(u) {
								u.rank[foundClass.name][num - 1] = null;
								u.judges[foundClass.name][num - 1] = null;
							});
							req.flash('success', 'Judge deleted successfully');
							res.redirect('/class/' + foundClass.name + '/judge');
						}
					});
				}
			});
		}
	});
});

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

//Judging
router.post('/:id', middleware.isLoggedIn, function(req, res) {
	var ans = req.body.ans;
	var flashStatus;
	Class.findOne({name: req.params.className}).populate('judges').exec(function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
			
		} else {
			if (foundClass.name == 'python') {
				Judge.findById(req.params.id, function(err, judge) {
					if (err) {
						console.log(err);
						req.flash('error', 'Jizz, something went wrong...');
						res.redirect('back');
					} else {
						var status = 'AC';
						var score = 0;
						var tasks = [];
						var oldScore = req.user.rank[foundClass.name][judge.number - 1];
						for (var i = 0; i < judge.data; i++) {
							let input = judge.input[i].replaceAll('\r', '');
							let output = judge.output[i].replaceAll('\r', '');
							tasks.push(function(cb) {
								pythonJudge(ans, input, output, (err, status) => {
									cb(err, status);
								});	
							});
						}
						async.series(tasks, (err, results)=> {
							if (err) {
								console.log(err);
								req.flash('error', 'Jizz, something went wrong...');
								res.redirect('back');
							}
							else {
								for (var i = 0; i < judge.data; i++) {
									if (results[i] == 'AC') {
										score += 100 / judge.data;
									} else if (results[i] == 'CE') {
										status = 'CE';
									} else if (results[i] == 'TLE') {
										if (status == 'AC' || status == 'WA') {
											status = 'TLE';
										}
									} else {
										if (status == 'AC') {
											status = 'WA';
										}
									}
								}
								console.log(status);
								if (score > oldScore || !oldScore) {
									var newRank = req.user.rank;
									newRank[foundClass.name][judge.number - 1] = score;
									var newJudges = req.user.judges;
									newJudges[foundClass.name][judge.number - 1] = status;
									User.findByIdAndUpdate(req.user._id, {rank: newRank, judges: newJudges}, function(err, user) {
										if (err) {
											console.log(err);
											req.flash('error', 'Jizz, something went wrong...');
											res.redirect('back');
										} else {
											if (status == 'AC') {
												req.flash('success', 'Accepted');
											} else if (status == 'WA') {
												req.flash('error', 'Wrong Answer');
											} else if (status == 'CE') {
												req.flash('jizz', 'Compilation Error');
											} else {

												req.flash('tle', 'Time Limit Exceed');
											}
											res.redirect('/class/' + foundClass.name + '/judge');
										}
									});
								} else {
									if (status == 'AC') {
										req.flash('success', 'Accepted');
									} else if (status == 'WA') {
										req.flash('error', 'Wrong Answer');
									} else if (status == 'CE') {
										req.flash('jizz', 'Compilation Error');
									} else {
										console.log('TLETLE');
										req.flash('tle', 'Time Limit Exceed');
									}
									res.redirect('/class/' + foundClass.name + '/judge');
								}
							}
						});
					}
				});
			} else if (foundClass.name == 'cpp') {
				Judge.findById(req.params.id, function(err, judge) {
					if (err) {
						console.log(err);
					} else {
						var status = 'AC';
						var score = 0;
						var tasks = [];
						var oldScore = req.user.rank[foundClass.name][judge.number - 1];
						for (var i = 0; i < judge.data; i++) {
							let input = judge.input[i].replaceAll('\r', '');
							let output = judge.output[i].replaceAll('\r', '');
							tasks.push(function(cb) {
								cppJudge(ans, input, output, (err, status) => {
									cb(err, status);
								});	
							});
						}
						async.series(tasks, (err, results)=> {
							if (err) {
								console.log(err);
								req.flash('error', 'Jizz, something went wrong...');
								res.redirect('back');
							}
							else {
								for (var i = 0; i < judge.data; i++) {
									if (results[i] == 'AC') {
										score += 100 / judge.data;
									} else if (results[i] == 'CE') {
										status = 'CE';
									} else {
										if (results[i] == 'TLE') {
											if (status == 'WA' || status == 'AC') {
												status = 'TLE';
											}
										}
										else {
											if (status == 'AC') {
												status = 'WA';
											}
										}
									}
								}
								if (score > oldScore || !oldScore) {
									var newRank = req.user.rank;
									newRank[foundClass.name][judge.number - 1] = score;
									var newJudges = req.user.judges;
									newJudges[foundClass.name][judge.number - 1] = status;
									User.findByIdAndUpdate(req.user._id, {rank: newRank, judges: newJudges}, function(err, user) {
										if (err) {
											console.log(err);
											req.flash('error', 'Jizz, something went wrong...');
											res.redirect('back');
										} else {
											if (status == 'AC') {
												req.flash('success', 'Accepted');
											} else if (status == 'WA') {
												req.flash('error', 'Wrong Answer');
											} else if (status == 'CE') {
												req.flash('jizz', 'Compilation Error');
											} else {
												req.flash('tle', 'Time Limit Exceed');
											}
											res.redirect('/class/' + foundClass.name + '/judge');
										}
									});
								} else {
									if (status == 'AC') {
										req.flash('success', 'Accepted');
									} else if (status == 'WA') {
										req.flash('error', 'Wrong Answer');
									} else if (status == 'CE') {
										req.flash('jizz', 'Compilation Error');
									} else {
										req.flash('tle', 'Time Limit Exceed');
									}
									res.redirect('/class/' + foundClass.name + '/judge');
								}
							}
						});
					}
				});
			}
		}
	});
});


//Judge - Show one
router.get('/:id', middleware.isLoggedIn, function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
			req.flash('error', 'Jizz, something went wrong...');
			res.redirect('back');
			
		} else {
			Judge.findById(req.params.id, function(err, judge) {
				if (err) {
					console.log(err);
					req.flash('error', 'Jizz, something went wrong...');
					res.redirect('back');
					
				} else {
					res.render('judges/judge', {inforClass: foundClass, judge: judge});
				}
			});
		}
	});
});

module.exports = router;