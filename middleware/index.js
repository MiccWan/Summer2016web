var middleware = {
	isLoggedIn: function(req, res, next) {
		if (req.isAuthenticated()) {
			next();
		}
		else {
			res.redirect('/login');
		}
	},
	isTeacher: function(req, res, next) {
		if (req.isAuthenticated()) {
			if (req.user.username == 'infor' || req.user.username == 'infor_william' || req.user.username == 'infor_wayne') {
				next();
			} else {
				req.flash('error', 'Permission denied.');
				res.redirect('back');
			}
		} else {
			res.redirect('/login');
		}
	}
};

module.exports = middleware;
