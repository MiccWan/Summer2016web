var tmp = require('tmp'),
		fs  = require('fs'),
		execFile = require('child_process').execFile,
		exec = require('child_process').exec;

// cb(err)
// db(null, 'AC')
function cppJudge(ans, input, output, cb) {
	tmp.tmpName({postfix: '.cpp'}, (err, path) => {
		if (err) {
			cb(err);
		} else {
			tmp.tmpName({postfix: '.out'}, (err, path2) => {
				if (err) {
					cb(err);
				} else {
					fs.writeFile(path, ans, (err) => {
						if (err) {
							cb(err);
						} else {
							var out = execFile('g++', ['-o', path2, path], (err, stdout, stderr) => {
								if (err) {		
									cb(err);
								} else {
									var child = exec(path2, (err, stdout, stderr) => {
										if (err) {
											console.log(err);
										} else {
											if (stdout == output + '\n') {
												cb(null, 'AC');
											} else {
												cb(null, 'WA');
											}
										}
										fs.unlink(path2, (err) => {
											if (err) console.log(err);
										});
									});
								}
								fs.unlink(path, (err) => {
									if (err) console.log(err);
								});
							});
							out.stdin.end(input);
						}
					});
				}
			});
		}
	});
} 

module.exports = cppJudge;