var express        = require('express'),
		app            = express(),
		bodyParser     = require('body-parser'),
		mongoose       = require('mongoose'),
		passport       = require('passport'),
		localStrategy  = require('passport-local'),
		methodOverride = require('method-override'),
		flash          = require('connect-flash');

var User = require("./models/User.js");
var Class = require('./models/class.js');
var Note = require('./models/note.js');

var seedDB = require('./seed.js');

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
	next();
});

app.get('/', function(req, res) {
	res.render('index');
});


app.get('/profile', isLoggedIn, function(req, res) {
	res.render('profile');
});


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

app.get('/login', function(req, res) {
	res.render('login');
});

app.post('/login', passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login'
	}), function(req, res) {

});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/:className', isLoggedIn, function(req, res) {
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

app.get('/:className/note', function(req, res) {
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

app.get('/:className/note/new', function(req, res) {
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

app.post('/:className/note', function(req, res) {
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

app.get('/:className/note/:id/edit', function(req, res) {
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

app.put('/:className/note/:id', function(req, res) {
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

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	}
	else {
		res.redirect('/login');
	}
}
app.listen(7122, function() {
	console.log("Server is Jizzing...");
});