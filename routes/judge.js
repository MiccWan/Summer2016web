var express = require('express'),
	  router  = express.Router({mergeParams: true}),
	  fs      = require('fs'),
	  tmp     = require('tmp');

var Note  = require('../models/note.js'),
	  Class = require('../models/class.js'),
	  Judge = require('../models/judge.js'),
	  User  = require('../models/User.js');

var middleware = require('../middleware/');

//Judge
router.get('/:className/judge', function(req, res) {
	Class.findOne({name: req.params.className}).populate('judges').exec(function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			res.render('judges', {inforClass: foundClass});
		}
	});
});

router.get('/:className/judge/new', function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			res.render('newJudge', {inforClass: foundClass});
		}
	});
});

router.get('/:className/judge/:id', function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			Judge.findById(req.params.id, function(err, judge) {
				if (err) {
					console.log(err);
				} else {
					res.render('judge', {inforClass: foundClass, judge: judge});
				}
			});
		}
	});
});

router.post('/:className/judge', function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			var name = req.body.name;
			var description = req.body.description;
			var input = req.body.input;
			var output = req.body.output;
			Judge.create({name: name, description: description, input: input, output: output}, function(err, judge) {
				if (err) {
					console.log(err);
				} else {
					judge.save();
					foundClass.judges.push(judge);
					foundClass.save();
					res.redirect('/' + foundClass.name + '/judge');
				}
			});
		}
	});
});

//Judging
router.post('/:className/judge/:id', function(req, res) {
	var ans = req.body.ans;
	Class.findOne({name: req.params.className}).populate('judges').exec(function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
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
									} else {
										console.log('WA');
									}
									fs.unlink(path, (err) => {
										if (err) console.log(err);
									});
									res.redirect('/' + foundClass.name + '/judge');
								}
							});
							child.stdin.write(judge.input);
						}
					});
				}
			});
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

module.exports = router;