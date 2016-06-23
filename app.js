//Packages
var express        = require('express'),
		app            = express(),
		bodyParser     = require('body-parser'),
		mongoose       = require('mongoose'),
		passport       = require('passport'),
		localStrategy  = require('passport-local'),
		methodOverride = require('method-override'),
		flash          = require('connect-flash');

//Models
var User  = require("./models/User.js"),
		Class = require('./models/class.js'),
		Note  = require('./models/note.js'),
		Judge = require('./models/judge.js');


var middleware = require('./middleware');
var seedDB = require('./seed.js');

var realClassName = {
	'python': 'Python',
	'pygame': 'Pygame',
	'cpp': 'C++',
	'java': 'Java',
	'unity': 'Unity 3D',
	'web': 'Web',
	'ai': 'AI/SAI',
	'ae': 'AE',
	'rpg': 'RPG Maker'
};

mongoose.connect('mongodb://localhost/infor');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

app.use(require('express-session')({
	secret: "Jizz",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.realClassName = realClassName;
	next();
});

//Home
app.get('/', function(req, res) {
	res.render('index');
});

//Profile
app.get('/profile', middleware.isLoggedIn, function(req, res) {
	res.render('profile');
});

//Rank
app.get('/rank', function(req, res) {
	User.find({}, function(err, allUser) {
		if (err) {
			console.log(err);
		} else {
			allUser.sort(function(a, b) {
				return a.rank < b.rank;
			});
			res.render('rank', {allUser: allUser});
		}
	});
});

//Judge
app.get('/:className/judge', function(req, res) {
	Class.findOne({name: req.params.className}).populate('judges').exec(function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			res.render('judges', {inforClass: foundClass});
		}
	});
});

app.get('/:className/judge/:id', function(req, res) {
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

//TODO
app.post('/:className/judge/:id', function(req, res) {
	var ans = req.body.ans;
});

app.get('/:className/judge/new', function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			res.render('newJudge', {inforClass: foundClass});
		}
	});
});

app.post('/:className/judge', function(req, res) {
	Class.findOne({name: req.params.className}, function(err, foundClass) {
		if (err) {
			console.log(err);
		} else {
			Judge.create(req.body.judge, function(err, judge) {
				if (err) {
					console.log(err);
				} else {
					judge.save();
					foundClass.judges.push(save);
					foundClass.save();
					res.redirect('/' + foundClass.name + '/judge');
				}
			});
		}
	});
});

//Login
app.get('/login', function(req, res) {
	res.render('login');
});

app.post('/login', passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login'
	}), function(req, res) {

});

//Logout
app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

//Register
app.get('/register', function(req, res) {
	res.render("register");
});

app.post('/register', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	User.register(new User({username: username}), password, function(err, user) {
		if (err) {
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req, res, function() {
			res.redirect('/');
		});
	});
});

//Class - index
app.get('/:className', middleware.isLoggedIn, function(req, res) {
	var name = req.params.className;
	Class.findOne({"name": name}, function(err, foundClass) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('class', {inforClass: foundClass});
		}
	});
});

//Note - index
app.get('/:className/note', middleware.isLoggedIn, function(req, res) {
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
app.get('/:className/note/new', middleware.isLoggedIn, function(req, res) {
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
app.post('/:className/note', middleware.isLoggedIn, function(req, res) {
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
app.get('/:className/note/:id/edit', middleware.isLoggedIn, function(req, res) {
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
app.put('/:className/note/:id', middleware.isLoggedIn, function(req, res) {
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
app.delete('/:className/note/:id', middleware.isLoggedIn, function(req, res) {
	Note.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			console.log(err);
		}
		else {
			res.redirect('/' + req.params.className + '/note');
		}
	});
});

app.listen(7122, function() {
	console.log("Server is Jizzing...");
});