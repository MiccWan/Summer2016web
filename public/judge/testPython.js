var pythonJudge = require('../lib/pythonJudge.js');

var ans = 'a = 1\n\rwhile True:\n\r\ta += 1';
var ans2 = 'cin >> a';
var input = '1\n\r2\n\r';
var output = '3';

pythonJudge(ans, input, output, (err, status) => {
	if (err) {
		console.log(err);
	} else {
		console.log(status);
	}
});