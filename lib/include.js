var include = function(a, b) {
	for (var i = 0; i < a.length; i++) {
		if (a[i] == b) {
			return true;
		}
	}
	return false;
}

module.exports = include;