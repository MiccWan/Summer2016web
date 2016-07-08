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

var classRouter = require('./routes/class.js');
var indexRouter = require('./routes/index.js');
var include     = require('./lib/include.js');

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

<<<<<<< HEAD
mongoose.connect('mongodb://db:27017/summer2016student');
=======
var roots = ["infor", "infor_william", "infor_wayne"];

mongoose.connect('mongodb://localhost/infor');
>>>>>>> e3e47db80c14dbff1468e721bb846efcf23619b9
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
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success'),
	res.locals.roots = roots;
	res.locals.include = include;
	next();
});

app.use(indexRouter);
app.use(classRouter);

app.listen(7122, function() {
	console.log("Server is Jizzing...");
});
