var findJudge = function(allJudge, id) {
	allJudge.forEach(function(judge) {
		if (judge._id == id) {
			return judge;
		}
	});
}

module.exports = findJudge;