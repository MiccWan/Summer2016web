var tmp = require('tmp'),
		fs  = require('fs'),
		execFile = require('child_process').execFile,
		exec = require('child_process').exec;

// cb(err)
// db(null, 'AC')
function TLE(ans, input, output, cb) {
	tmp.tmpName({postfix: '.cpp'}, (err, path) => {
		if (err) {
			cb(err);
		} else {
			// console.log("cpp file: " + path);
			tmp.tmpName({postfix: '.out'}, (err, path2) => {
				if (err) {
					cb(err);
				} else {
					// console.log('output file: ' + path2);
					fs.writeFile(path, ans, (err) => {
						if (err) {
							cb(err);
						} else {
							// console.log('write file');
							var out = execFile('g++', [path, '-o', path2], (err, stdout, stderr) => {
								if (stderr) {
									console.log('stderr: ' + stderr);
									cb(null, 'CE');
								} else {
									// console.log("execute cpp file");
									var child = exec(path2, {timeout: 1000}, (err, stdout, stderr) => {
										if (err) {
											cb(null, 'TLE');
										} else {
											// console.log("execute output file");
											if (stdout == output) {
												cb(null, 'AC');
											} else {
												cb(null, 'WA');
											}
										}
										fs.unlink(path2, (err) => {
											if (err) console.log(err);
											// else console.log("unlink output");
										});
										fs.unlink(path, (err) => {
											if (err) console.log(err);
											// else console.log("unlink cpp file");
										});
									});

									// console.log('Writing input');
									child.stdin.write(input + '\n');
									// console.log("Fiinish writing");
								}
								
							});
							
						}
					});
				}
			});
		}
	});
} 

module.exports = TLE;
