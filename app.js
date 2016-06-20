var express        = require('express'),
		app            = express(),
		bodyParser     = require('body-parser'),
		mongoose       = require('mongoose'),
		passport       = require('passport'),
		localStrategy  = require('passport-local'),
		methodOverride = require('method-override'),
		flash          = require('connect-flash');

var User = require("./models/User.js");
mongoose.connect('mongodb://localhost/infor');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

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

app.get('/python', isLoggedIn, function(req, res) {
	res.render('python');
});

app.get('/cpp', isLoggedIn, function(req, res) {
	res.render('cpp');
});

app.get('/java', isLoggedIn, function(req, res) {
	res.render('java');
});

app.get('/unity', isLoggedIn, function(req, res) {
	res.render('unity');
});

app.get('/web', isLoggedIn, function(req, res) {
	res.render('web');
});

app.get('/register', function(req, res) {
	res.render("register.ejs");
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

app.get('/profile', isLoggedIn, function(req, res) {
	res.render('profile');
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