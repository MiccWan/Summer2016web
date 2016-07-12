var tmp = require('tmp'),
		fs  = require('fs'),
		execFile = require('child_process').execFile;


String.prototype.origin = function() {
	var result = '';
	for (var i = 0; i < this.length; i++) {
		if (this[i] == '\n') {
			result += '\\n';
		} else if (this[i] == '\r') {
			result += '\\r';
		} else {
			result += this[i];
		}
	}
	return result;
}

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
						if (stderr) {
							cb(null, 'CE');
						} else {
							if (stdout == output) {
								cb(null, 'AC');
							} else {
								cb(null, 'WA');
							}
							fs.unlink(path, (err) => {
								if (err)
									console.log(err);
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