var models = require("../models")

exports.is_logged_in_get = (req, res, next) => {
	if(req.user){
    	next()
    }
	else {
    	res.redirect(`/`)
    }
}
exports.check_jobs = function (req, res, next) {
	models.job.findOne({where: {id: req.params.id}}).then(job => {
		if(job){
			next()
		}
		else {
			res.redirect("/jobs")
		}
	})
}

	exports.logout = (req, res, next) => {
		if(req.user){
			next()
		}
		else{
			res.redirect("/")
		}
	}
exports.is_logged_in_post = (req, res, next) => {
	if(req.user){
    	next()
    }
	else {
    	res.status(401).json({
        	error: "You are not authorized to make this request, please sign in"
        })
    }
}
exports.is_notverified_get = function(req, res, next) {
	if(!req.user.is_verified){
    	next()
    }
	else {
    res.redirect("/")
    }
}

exports.is_notverified_post = function(req, res, next) {
	if(!req.user.is_verified){
    	next()
    }
	else {
    res.status(401).json({
        	error: "You are not authorized to make this request"
        })
    }
}
exports.no_auth_get = function(req, res, next){
	if(req.user){
		res.redirect('/dash')
	}else {
		next()
	}
}
exports.no_auth_post = function(req, res, next){
	if(req.user){
		res.status(401).json({
			error: "You are not allowed to make this request"
		})
	}else {
		next()
	}
}

exports.is_verified_get = (req, res, next) => {
	if(req.user.is_verified){
		next()
	}
	else {
		res.redirect('/verify')
	}
}
exports.is_verified_post = (req, res, next) => {
	if(req.user.is_verified){
		next()
	}
	else {
		res.json({
			error: "Your account has to be verified before making this request"
		})
	}
}

exports.has_tags = (req, res, next) => {
	if(req.query.tag){
		models.schedule.findOne({where: {
			title: req.query.tag
		}}).then(sch => {
			if(sch){
				next()
			}

			else {
				models.department.findOne({
					where: {
						title: req.query.tag
					}
				}).then(cat => {
					if(cat){
						next()
					}
					else{
					res.redirect("/jobs")
					}
				})
			}
		})
	}
	else {
		next()
	}
}