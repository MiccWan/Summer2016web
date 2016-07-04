var cppJudge = require('../lib/cppJudge.js');

var ans = "#include <iostream>\n\r using namespace std;\n\r int main()\n\r {\n\rcout << '3' << endl; \n\rreturn 0;\n\r}";
var input = "1\n\r2\n\r";
var output = '3';

cppJudge(ans, input, output, (err, status) => {
	if (err) {
		console.log(err);
	} else {
		console.log(status);
	}
});