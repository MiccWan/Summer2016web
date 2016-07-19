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
			if (req.user.username == 'summer_wayne' || req.user.username == 'summer_william' || req.user.username == 'summer_hfy') {
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
