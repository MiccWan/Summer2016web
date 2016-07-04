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
		exec           = require('child_process').exec;

var router     = express.Router();
var middleware = require('../middleware/');

var User  = require("../models/User.js"),
		Class = require('../models/class.js'),
		Note  = require('../models/note.js'),
		Judge = require('../models/judge.js');

//Judge
router.get('/class/:className/judge', middleware.isLoggedIn, function(req, res) {
	Class.findOne({name: req.params.className}).populate('judges').exec(function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			res.render('judges/judges', {inforClass: foundClass});
		}
	});
});

router.get('/class/:className/judge/new', middleware.isLoggedIn, function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			res.render('judges/newJudge', {inforClass: foundClass});
		}
	});
});

router.get('/class/:className/judge/:id', middleware.isLoggedIn, function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			Judge.findById(req.params.id, function(err, judge) {
				if (err) {
					console.log(err);
				} else {
					res.render('judges/judge', {inforClass: foundClass, judge: judge});
				}
			});
		}
	});
});

router.post('/class/:className/judge', middleware.isLoggedIn, function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			var name = req.body.name;
			var number = parseInt(req.body.number);
			var description = req.body.description;
			var input = req.body.input;
			var output = req.body.output;
			Judge.create({name: name, number: number, description: description, input: input, output: output}, function(err, judge) {
				if (err) {
					console.log(err);
				} else {
					judge.save();
					foundClass.judges.push(judge);
					foundClass.save();
					res.redirect('/class/' + foundClass.name + '/judge');
				}
			});
		}
	});
});

//Judging
router.post('/class/:className/judge/:id', middleware.isLoggedIn, function(req, res) {
	var ans = req.body.ans;
	Class.findOne({name: req.params.className}).populate('judges').exec(function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			if (foundClass.name == 'python') {
				Judge.findById(req.params.id, function(err, judge) {
					if (err) {
						console.log(err);
					} else {
						writeTempFile(ans, (err, path) => {
							if (err) {
								console.log(err);
							} else {
								var child = execFile('python', [path], (err, stdout, stderr) => {
									if (err) {
										console.log(err);
									} else {
										if (stdout == judge.output + '\n') {
											console.log('AC');
											if (req.user.judges[foundClass.name][judge.number - 1] != 'AC') {
												var newRank = req.user.rank;
												newRank[foundClass.name] += 100;
												var newJudge = req.user.judges;
												newJudge[foundClass.name][judge.number - 1] = 'AC';
												User.findByIdAndUpdate(req.user._id, {rank: newRank, judges: newJudge}, function(err, user) {
													if (err) {
														console.log(err);
													}
												});	
											}
										} else {
											console.log('WA');
											if (req.user.judges[foundClass.name][judge.number - 1] != 'AC') {
												var newJudge = req.user.judges;
												newJudge[judge.number - 1] = 'WA';
												User.findByIdAndUpdate(req.user._id, {judges: newJudge}, function(err, user) {
													if (err) {
														console.log(err);
													}
												});
											}
										}
										fs.unlink(path, (err) => {
											if (err) console.log(err);
										});
										res.redirect('/class/' + foundClass.name + '/judge');
									}
								});
								child.stdin.write(judge.input);
							}
						});
					}
				});
			} else if (foundClass.name == 'cpp') {
				Judge.findById(req.params.id, function(err, judge) {
					if (err) {
						console.log(err);
					} else {
						
					}
				});
			}
		}
	});
});

//Note - index
router.get('/class/:className/note', middleware.isLoggedIn, function(req, res) {
	var name = req.params.className;
	Class.findOne({"name": name}).populate("notes").exec(function(err, foundClass) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('notes/note', {inforClass: foundClass});
		}
	});
});

//Note - new
router.get('/class/:className/note/new', middleware.isLoggedIn, function(req, res) {
	var name = req.params.className;
	Class.findOne({name: name}, function(err, foundClass) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('notes/newNote', {inforClass: foundClass});
		}
	});
});

//Note - post
router.post('/class/:className/note', middleware.isLoggedIn, function(req, res) {
	var name = req.params.className;
	Class.findOne({"name": name}, function(err, foundClass) {
		if (err) {
			console.log(err);
		}
		else {
			Note.create({content: req.body.text}, function(err, note) {
				if (err) {
					console.log(err);
				}
				else {
					note.save();
					foundClass.notes.push(note);
					// console.log(note.content);
					foundClass.save();
					res.redirect('/class/' + foundClass.name + '/note');
				}
			});
		}
	});
});


//Note - edit
router.get('/class/:className/note/:id/edit', middleware.isLoggedIn, function(req, res) {
	var name = req.params.className;
	Class.findOne({name: name}, function(err, foundClass) {
		if (err) {
			console.log(err);
		}
		else {
			Note.findById(req.params.id, function(err, foundNote) {
				if (err) {
					console.log(err);
				}
				else {
					res.render('notes/editNote', {inforClass: foundClass, note: foundNote});
				}
			});
		}
	});
});


//Note - update
router.put('/class/:className/note/:id', middleware.isLoggedIn, function(req, res) {
	var text = req.body.text;
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		Note.findByIdAndUpdate(req.params.id, {content: text}, function(err, note) {
			if (err) {
				console.log(err);
			}
			else {
				console.log(note);
				console.log(foundClass);
				res.redirect('/class/' + req.params.className + '/note');
			}
		});
	});
});

//Note - destroy
router.delete('/class/:className/note/:id', middleware.isLoggedIn, function(req, res) {
	Note.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			console.log(err);
		}
		else {
			res.redirect('/class/' + req.params.className + '/note');
		}
	});
});



//Class - index
router.get('/class/:className', middleware.isLoggedIn, function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			res.render('class/' + foundClass.name, {inforClass: foundClass});
		}
	});
});

function writeTempFile(data, cb) {
	tmp.tmpName((err, path)=> {
		if (err)
			cb(err);
		else {
			fs.writeFile(path, data, (err)=> {
				if (err) 
					cb(err);
				else
					cb(null, path);
			});
		}
	});
}

// cb(err)
// cb(null)
function cppJudge(ans, output, cb) {
	tmp.tmpName((err, path) => {
		if (err) {
			console.log(err);
		} else {
			tmp.tmpName((err, path2) => {
				if (err) {
					console.log(err);
				} else {
					fs.writeFile(ans, path, (err) => {
						if (err) {
							console.log(err);
						} else {
							var out = execFile('g++', ['-o', path2, path], (err, stdout, stderr) => {
								if (err) {
									console.log(err);
								} else {
									var child = exec('.' + path2, (err, stdout, stderr) => {
										if (err) {
											console.log(err);
										} else {
											if (stdout == judge.output + '\n') {
												console.log('AC');
												if (req.user.judges[foundClass.name][judge.number - 1] != 'AC') {
													var newRank = req.user.rank;
													newRank[foundClass.name] += 100;
													var newJudge = req.user.judges;
													newJudge[foundClass.name][judge.number - 1] = 'AC';
													User.findByIdAndUpdate(req.user._id, {rank: newRank, judges: newJudge}, function(err, user) {
														if (err) {
															console.log(err);
														}
													});	
												}
											} else {
												console.log('WA');
												if (req.user.judges[foundClass.name][judge.number - 1] != 'AC') {
													var newJudge = req.user.judges;
													newJudge[judge.number - 1] = 'WA';
													User.findByIdAndUpdate(req.user._id, {judges: newJudge}, function(err, user) {
														if (err) {
															console.log(err);
														}
													});
												}
											}
										}
										fs.unlink(path2, (err) => {
											if (err) console.log(err);
											res.redirect('/class/' + foundClass.name + '/judge');
										});
									});
								}
								fs.unlink(path, (err) => {
									if (err) console.log(err);
								});
							});
							out.stdin.write(judge.input);
						}
					});
				}
			});
		}
	});
} 

module.exports = router;