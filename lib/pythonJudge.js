var tmp = require('tmp'),
		fs  = require('fs'),
		execFile = require('child_process').execFile;

function pythonJudge(ans, input, output, cb) {
	tmp.tmpName({postfix: '.py'}, (err, path) => {
		if (err) {
			cb(err);
		} else {
			fs.writeFile(path, ans, (err) => {
				if (err) {
					cb(err);
				} else {
					var child = execFile('python', [path], (err, stdout, stderr) => {
						if (err) {
							cb(err);
						} else {
							if (stdout == output + '\n') {
								cb(null, 'AC');
							} else {
								cb(null, 'WA');
							}
							fs.unlink(path, (err) => {
								cb(err);
							});
						}
					});
					child.stdin.write(input);
					child.stdin.end();
				}
			});
		}
	});
}

module.exports = pythonJudge;