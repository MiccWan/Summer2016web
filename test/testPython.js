var pythonJudge = require('../lib/pythonJudge.js');

var ans = 'a = int(input())\n\rb = int(input())\n\rprint(a + b)\n\r';
var input = '1\n\r2\n\r';
var output = '3';

pythonJudge(ans, input, output, (err, status) => {
	if (err) {
		console.log(err);
	} else {
		console.log(status);
	}
});