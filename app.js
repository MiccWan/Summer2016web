//Packages
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
		execFile       = require('child_process').execFile;

//Models
var User  = require("./models/User.js"),
		Class = require('./models/class.js'),
		Note  = require('./models/note.js'),
		Judge = require('./models/judge.js');


var middleware = require('./middleware');
var seedDB = require('./seed.js');

var indexRoute = require('./routes/index.js'),
		noteRoute  = require('./routes/note.js'),
		judgeRoute = require('./routes/judge.js');

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
app.use(express.static(__dirname + '/public'));
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

app.use(indexRoute);
app.use(noteRoute);
app.use(judgeRoute);

app.listen(7122, function() {
	console.log("Server is Jizzing...");
});