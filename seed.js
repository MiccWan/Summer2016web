var mongoose = require('mongoose');
var Class = require('./models/class.js');
var Note = require('./models/note.js');

function seedDB() {
	Class.create({
		name: 'python'
	});
	Class.create({
		name: 'pygame'
	});
	Class.create({
		name: 'web'
	});
	Class.create({
		name: 'unity'
	});
	Class.create({
		name: 'ai'
	});
	Class.create({
		name: 'ae'
	});
	Class.create({
		name: 'java'
	});
	Class.create({
		name: 'rpg'
	});
	Class.create({
		name: 'cpp'
	});
}

module.exports = seedDB;