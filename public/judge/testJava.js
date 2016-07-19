var javaJudge = require('../lib/javaJudge.js');

var ans = 'public class HelloWorld {\n\rpublic static void main(String[] args) {\n\rSystem.out.println("Hello! World!");\n\r}\n\r}';
var input = '';
var output = 'Hello World!';

javaJudge(ans, input, output, (err, status) => {
	if (err) {
		console.log(err);
	} else {
		console.log(status);
	}
});