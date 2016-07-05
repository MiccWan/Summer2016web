var tmp = require('tmp'),
		fs  = require('fs'),
		execFile = require('child_process').execFile,
		exec = require('child_process').exec;

function javaJudge(ans, input, output, cb) {
	tmp.tmpName({postfix: 'java'}, (err, path) => {
		if (err) {
			cb(err);
		} else {
			fs.writeFile(path, ans, (err) => {
				if (err) {
					cb(err);
				} else {
					var child = execFile('javac', [path], (err, stdout, stderr) => {
						if (err) {
							cb(err);
						} else {
							var out = execFile('java', [path], (err, stdout, stderr) => {
								if (err) {
									cb(err);
								} else {
									if (stdout + '\n' == output) {
										cb(null, 'AC');
									} else {
										cb(null, 'WA');
									}
								}
							});
						}
					});
				}

			child.stdin.write(input);
			child.stdin.end();
			});
			
		}
	});
}

module.exports = javaJudge;