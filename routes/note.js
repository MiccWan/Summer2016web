var express = require('express'),
	  router  = express.Router({mergeParams: true});

var Note  = require('../models/note.js'),
	  Class = require('../models/class.js'),
	  Judge = require('../models/judge.js'),
	  User  = require('../models/User.js');

var middleware = require('../middleware/');

//Note - index
router.get('/:className/note', middleware.isLoggedIn, function(req, res) {
	var name = req.params.className;
	Class.findOne({"name": name}).populate("notes").exec(function(err, foundClass) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('note', {inforClass: foundClass});
		}
	});
});

//Note - new
router.get('/:className/note/new', middleware.isLoggedIn, function(req, res) {
	var name = req.params.className;
	Class.findOne({'name': name}, function(err, foundClass) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('newNote', {inforClass: foundClass});
		}
	});
});

//Note - post
router.post('/:className/note', middleware.isLoggedIn, function(req, res) {
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
					res.redirect('/' + foundClass.name + '/note');
				}
			});
		}
	});
});


//Note - edit
router.get('/:className/note/:id/edit', middleware.isLoggedIn, function(req, res) {
	var name = req.params.className;
	Class.findOne({'name': name}, function(err, foundClass) {
		if (err) {
			console.log(err);
		}
		else {
			Note.findById(req.params.id, function(err, foundNote) {
				if (err) {
					console.log(err);
				}
				else {
					res.render('editNote', {inforClass: foundClass, note: foundNote});
				}
			});
		}
	});
});


//Note - update
router.put('/:className/note/:id', middleware.isLoggedIn, function(req, res) {
	var text = req.body.text;
	Class.findOne(req.params.className, function(err, foundClass) {
		Note.findByIdAndUpdate(req.params.id, {content: text}, function(err, note) {
			if (err) {
				console.log(err);
			}
			else {
				console.log(note);
				console.log(foundClass);
				res.redirect('/' + req.params.className + '/note');
			}
		});
	});
});

//Note - destroy
router.delete('/:className/note/:id', middleware.isLoggedIn, function(req, res) {
	Note.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			console.log(err);
		}
		else {
			res.redirect('/' + req.params.className + '/note');
		}
	});
});

module.exports = router;