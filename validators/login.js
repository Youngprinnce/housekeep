let validator = require('validator');
let models = require('../models');
const bcrypt = require('bcrypt')

const validateCreateUserField = (errors, req) => {
	if(!validator.isEmail(req.body.email)){
		errors['email'] = 'Please use a valid email';
	}
	if(!validator.isAscii(req.body.password)){
		errors['email'] = 'Invalid characters in email please try another';
	}
} 

 exports.validateLogin = (errors, req) => {
 	return new Promise((resolve, reject) => {
 		validateCreateUserField(errors, req);
 		return models.admin.findOne({
		where: {
			email: req.body.email
		}
	}).then(usr => {
	if(!usr){
		errors["email"] = "Invalid Login Details"
	}
	else if(!bcrypt.compareSync(req.body.password, usr.password)){
		errors["password"] = "Invalid Login Details"
	}
	resolve(errors)
 	})
	
})
}