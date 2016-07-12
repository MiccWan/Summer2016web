var TLE = require('../lib/tleTest.js');

var ans = "using namespace std;\nint main() {\nwhile (true) {}\n return 0;}";
var input = "";
var output = "";

TLE(ans, input, output, (err, status) => {
	if (err) {
		console.log(err);
	} else {
		console.log(status);
	}
});