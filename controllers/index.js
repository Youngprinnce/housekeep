const passport = require('passport')
const {isEmpty} = require('lodash');
const moment = require("moment")
const Sequelize = require('sequelize')
const myPassport = require('../passport-setup')(passport)
var models = require("../models")
const {validateLogin} = require("../validators/login");
var nodemailer = require('nodemailer')
const fileUpload = require('express-fileupload');
const validator = require("validator")
var bcrypt = require("bcrypt")
const fs = require("fs")
const Op = require('sequelize').Op
const cron = require('node-cron')
const today = moment();
            let Pusher = require('pusher');
                let pusher = new Pusher({
                     appId: '1018647',
                  key: '5bee59e13c42b1428b28',
                  secret: '42187d55f95d94009a44',
                  cluster: 'eu',
                  encrypted: true
                });


cron.schedule('59 23 * * *', function() {
models.user.findAll().then(users => {
    
    users.forEach(user => {
        	const dt = moment(user.rent_date)
    
    if(dt.diff(today, "days") > 3 ) {
    var rent = "active"
    }
     else if(dt.diff(today, "days") == 3  || today.diff(dt, "days") == 2){
     var rent = "almost due"
     }
     else if(dt.diff(today, "days") == 1 ) {
     var rent = "due"
     }
      else if(dt.diff(today, "days") < 1) {
     var rent = "expired"
     }
     
     models.users.update({rent_status: rent}, {where: {id: user.id}})
    })
})
});


var sendmail = (email, subject, page) => {
const transporter = nodemailer.createTransport({sendmail: true}, {
  from: "HOUSEKEEP@housekeep.app",
  to: email,
  subject: subject,
});
var contact
transporter.sendMail({html: page}, (error, info) => {
     if (error) {
	console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
})
}
  
  
exports.get_index = function(req, res, next){
 	
	models.user.findAll().then(users => {
    	models.property.findAll().then(props => {
        	models.flat.findAll().then(flats => {
        	    models.maintenance.findAll().then(tasks => {
        	        	models.maintenance.findAll({
    order: [["createdAt", "desc"]],
    where: {[Op.or]: [{status: "pending"}, {status: "in-progress"}, {status: "processing"}]},
    include: [{association: "flat", include: [{association: "property", include: ['manager']}]}]
    }).then(pending => {
            	res.render('index', { title: 'Maintainaxe', user: req.user, flats: flats, properties: props, users: users, tasks, pending, moment: moment});
            })
            
        	    })
            
    	})
        })
    })
	
}

exports.get_login = function(req, res, next){
	res.render('login', {title: "Housekeep"})

               
}

exports.login = function(req, res, next) {
if(req.body.password && req.body.email){
		let errors = {}
	return validateLogin(errors, req).then(errors => {
		if(!isEmpty(errors)){
			res.json(errors)
		}
		else{
       passport.authenticate('local', function(err, user, info) {
                	if(err){
                    	return res.json({
                        	error: "There was an error signing you in, try again later"
                        })
                    }
                	if(!user) {
                    	return res.json({
                        	error: "Couldn't identify user please try again later"
                        })
                    }
                	req.logIn(user, function(err) {
                    	res.json({
                        	message: 'Login Successful',
                        	status: 'success',
                        	path: "/dash"
                        })
                    })
                })(req, res, next)
        }
})
}
else {
	res.json({
    	error: "Incomplete Details Provided"
    })
}
}

exports.get_properties = function(req, res, next) {
	models.property.findAll({order: [['createdAt', "DESC"]]}).then(props => {
    	models.manager.findAll().then(managers => {
    	res.render('properties', {title: 'Maintain', user: req.user, props, managers})
        })        
    })
}

exports.get_property_flats = function(req, res, next) {
	models.flat.findAll({
    	where: {property_id: req.params.id}, include: ['property'], order: [['createdAt', "DESC"]]}).then(flats => {
    
    models.property.findOne({where: {id: req.params.id}}).then(prop => {
    	res.render('property_flats', {title: "Housekeep", user: req.user, flats: flats, prop: prop})
    })
    })
}

exports.get_flats = function(req, res, next) {
	models.flat.findAll({include: ['property'], order: [['createdAt', "DESC"]] }).then(flats => {
    models.property.findAll().then(props => {
    	res.render("flats", {title: "Housekeep", user: req.user, flats: flats, props: props})
    
    })
    })
}

exports.create_flat = function(req, res, next){
if(req.body.num && req.body.id ){
models.flat.findOne({where: {flat_number: req.body.num, property_id: req.body.id}}).then(fl => {
		if(fl) {
        	res.json({
            	error: "A flat with this number exists"
            })
        }
else {
	models.flat.create({flat_number: req.body.num, flat_description: req.body.desc, property_id: req.body.id}).then(flat => {
    if(flat){
    	res.json({
        	message: 'Flat added successfully'
        })
    }
    
    else {
    	res.json({
        error: "Couldn't process your request at this time"
        })
    }
    })
}
})
	
}

else {
	res.json({error: "Incomplete Details Provided"})
}
}

exports.check_flat_props = (req, res, next) => {
	models.property.findOne({where: {id: req.params.id}}).then(prop => {
    	if(prop){
        next()
        }
    	else {
        res.redirect("/flats")
        }
    })
}

exports.create_property = function(req, res, next) {
	if(req.body.location && req.body.name && req.body.mng && req.body.desc && req.files){
      var att = req.files.img;
  var attname = today.format() + req.user.id + "property" + att.name
  var atturl = "/uploads/properties/" + attname
  att.mv(`public/uploads/properties/${attname}`, function(err) {
    if(err){
      return res.status(500).json({err: err})
    }
    
    models.property.create({
    	property_name: req.body.name,
    	manager_id: req.body.mng,
    	property_description: req.body.desc,
    	location: req.body.location,
		img_url: atturl
    }).then(rp => {
    	res.json({
        message: "Property Added Successfully"
        })
    })
  
   })
    }else {
    
    	res.json({
        	error: "Incomplete Details supplied"
        })
    }


}

exports.get_property = function(req, res, next) {
	models.property.findOne({where: {id: req.params.id}, include: ['manager']}).then(prop => {
    	res.render('property', {title: "Housekeep", user: req.user, prop})
    })
}

exports.check_for_property = function(req, res, next) {
	models.property.findOne({where: {id: req.params.id}}).then(prp => {
    	if(prp){
        	next()
        }
    else{
    res.redirect("/properties")
    }
    })
}

exports.logout = function(req, res, next){
	req.logout()
	req.session.destroy()
res.redirect('/')
}

exports.get_managers = function(req, res, next) {
	models.manager.findAll({include: ["properties"], order: [['createdAt', 'desc']]}).then(managers => {
    	models.property.findAll().then(pr => {
        res.render("managers", {title: "Housekeep", user: req.user, props: pr, managers})
        })
    })
}

exports.get_contractors = function(req, res, next) {
	models.contractor.findAll({include: ["maintenances"],order: [['createdAt', 'desc']]}).then(contractors => {
        res.render("contractors", {title: "Housekeep", user: req.user, contractors})
        })

}

exports.add_manager = function(req, res, next) {
if(req.body.fname && req.body.lname && req.body.phone && req.files && req.body.password && req.body.email){
    	      var att = req.files.img;
  var attname = today.format() + req.user.id + "manager" + att.name
  var atturl = "/uploads/managers/" + attname
   if(!validator.isEmail(req.body.email)){
     res.json({
     error: 'Please use a valid email'
     })
     }
  else if(!validator.isAscii(req.body.password)) {
  	res.json({
    	error: 'Invalid characters in password please try another'
    })
  }
  else if(!validator.isLength(req.body.password, {min: 8, max: 30})){
  res.json({
  error: 'Please ensure that your password has a minimum of 8 characters'
  })
  }
  
  else {
    models.admin.findOne({where: {email: req.body.email}}).then(adm => {
  	if(adm){
    res.json({
    error: 'This email address is already taken'
    })
    }
  else {
  models.manager.findOne({where: {email: req.body.email}}).then(mn => {
  	if(mn){
    res.json({
    error: 'This email address is already taken'
    })
    }
  
  else {
  	models.user.findOne({where: {email: req.body.email}}).then(usr => {
    if(usr) {
    res.json({
    error: 'This email address is already taken'
    })
    }else {
    models.contractor.findOne({where: {email: req.body.email}}).then(cont => {
    if(cont){
    	res.json({
        error: 'This email address is already taken'
        })
    }
    else {
     att.mv(`public/uploads/managers/${attname}`, function(err) {
    if(err){
      return res.status(500).json({err: err})
    }
  
  const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
 var nums = req.body.phone.split("")
if(nums[0] == "+"){
if(nums[0] == "+" && nums[1] == "2" && nums[2] == "3" ){
    var phn = req.body.phone
}
else {
    
    var phn = req.body.phone
    
}

}else if(nums[0] == "0") {
    nums.shift()
nums.unshift("+","2","3","4")
var phn = nums.join('')
}
 

  models.manager.create({firstName: req.body.fname, lastName: req.body.lname, email: req.body.email, password: hash, phone: phn, img_url: atturl}).then(manager => {
      sendmail(manager.email, "Manager account creation on Maintainaxe", `<p>Hi ${manager.firstName}, An account was created recently on Housekeep on your behalf. Sign in as a manager on the Housekeep mobile app with the following credentials:</p><br /><p>Email: <b>${manager.email}</b></p><br /><p>Password: <b>${req.body.password}</b></p>`)
  	res.json({
    	message: 'Manager Added Succesfully'
    })
  })
     
     })
  
    }
    })
    }
    })
  }
  })
  }
  })
    
  
  }
    
    

  
    }

else {
	res.json({
    	error: "Incomplete info provided"
    })
}
}


exports.add_contractor = function(req, res, next) {
	if(req.body.fname && req.body.lname && req.body.phone && req.files && req.body.email){
    	      var att = req.files.img;
  var attname = today.format() + req.user.id + "contractor" + att.name
  var atturl = "/uploads/contractors/" + attname
   if(!validator.isEmail(req.body.email)){
     res.json({
     error: 'Please use a valid email'
     })
     }
  
  else {
    models.admin.findOne({where: {email: req.body.email}}).then(adm => {
  	if(adm){
    res.json({
    error: 'This email address is already taken'
    })
    }
  else {
  models.manager.findOne({where: {email: req.body.email}}).then(mn => {
  	if(mn){
    res.json({
    error: 'This email address is already taken'
    })
    }
  
  else {
  	models.user.findOne({where: {email: req.body.email}}).then(usr => {
    if(usr) {
    res.json({
    error: 'This email address is already taken'
    })
    }else {
    models.contractor.findOne({where: {email: req.body.email}}).then(cont => {
    if(cont){
    	res.json({
        error: 'This email address is already taken'
        })
    }
    else {
     att.mv(`public/uploads/contractors/${attname}`, function(err) {
    if(err){
      return res.status(500).json({err: err})
    }
  
 
 var nums = "07016195980".split("")
 console.log(nums)
if(nums[0] == "+"){
if(nums[0] == "+" && nums[1] == "2" && nums[2] == "3" ){
    var phn = req.body.phone
}
else {
    
    var phn = req.body.phone
    
}

}else if(nums[0] == "0") {
    nums.shift()
nums.unshift("+","2","3","4")
var phn = nums.join('')
     console.log(phn)
}
  models.contractor.create({firstName: req.body.fname, lastName: req.body.lname, email: req.body.email, phone: phn, img_url: atturl}).then(cnt => {
  	res.json({
    	message: 'Contractor Added Succesfully'
    })
  })
     
     })
  
    }
    })
    }
    })
  }
  })
  }
  })
    
  
  }
    
    

  
    }

else {
	res.json({
    	error: "Incomplete info provided"
    })
}
}



exports.add_user = function(req, res, next) {
	if(req.body.fname && req.body.lname && req.body.phone && req.files && req.body.email && req.body.flat_id){
    	      var att = req.files.img;
  var attname = today.format() + req.user.id + "user" + att.name
  var atturl = "/uploads/tenants/" + attname
   if(!validator.isEmail(req.body.email)){
     res.json({
     error: 'Please use a valid email'
     })
     }
  
  else {
    models.admin.findOne({where: {email: req.body.email}}).then(adm => {
  	if(adm){
    res.json({
    error: 'This email address is already taken'
    })
    }
  else {
  models.manager.findOne({where: {email: req.body.email}}).then(mn => {
  	if(mn){
    res.json({
    error: 'This email address is already taken'
    })
    }
  
  else {
  	models.user.findOne({where: {email: req.body.email}}).then(usr => {
    if(usr) {
    res.json({
    error: 'This email address is already taken'
    })
    }else {
    models.contractor.findOne({where: {email: req.body.email}}).then(cont => {
    if(cont){
    	res.json({
        error: 'This email address is already taken'
        })
    }
    else {
     att.mv(`public/uploads/tenants/${attname}`, function(err) {
    if(err){
      return res.status(500).json({err: err})
    }
  
   const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
	const dt = moment(req.body.rent_date)
    
    if(dt.diff(today, "days") > 3 ) {
    var rent = "active"
    }
     else if(dt.diff(today, "days") == 3  || today.diff(dt, "days") == 2){
     var rent = "almost due"
     }
     else if(dt.diff(today, "days") == 1 ) {
     var rent = "due"
     }
      else if(dt.diff(today, "days") < 1) {
     var rent = "expired"
     }
      var nums = req.body.phone.split("")
 console.log(nums)
if(nums[0] == "+"){
if(nums[0] == "+" && nums[1] == "2" && nums[2] == "3" ){
    var phn = req.body.phone
}
else {
    
    var phn = req.body.phone
    
}

}else if(nums[0] == "0") {
    nums.shift()
nums.unshift("+","2","3","4")
var phn = nums.join('')
     console.log(phn)
}
     console.log(today.diff(dt, "days"))
  models.user.create({firstName: req.body.fname, lastName: req.body.lname, email: req.body.email, password: hash, phone: phn, img_url: atturl, flat_id: req.body.flat_id, rent_expiry: req.body.rent_date, rent_status: rent}).then(tenant => {
  models.flat.update({status: "occupied"},{where: {id: req.body.flat_id}}).then(rows => {
      sendmail(tenant.email, "Tenant account creation on Maintainaxe", `<p>Hi ${tenant.firstName}, An account was created recently on Maintainaxe on your behalf. Sign in on the maintainaxe mobile app with the following credentials:</p><br /><p>Email: <b>${tenant.email}</b></p><br /><p>Password: <b>${req.body.password}</b></p>`)
    res.json({
    	message: 'Tenant Added Succesfully'
    })
  })

  })
     
     })
  
    }
    })
    }
    })
  }
  })
  }
  })
    
  
  }
    
    

  
    }

else {
	res.json({
    	error: "Incomplete info provided"
    })
}
}



exports.get_tenants = function(req, res, next) {
	models.user.findAll({include: [{association: "flat", include: ["property"]}], order: [['createdAt', 'desc']]}).then(tenants => {
    	models.property.findAll({include: [{association: "flats"}]}).then(pr => {
         	models.flat.findAll({where: {status: "available"}}).then(flats => {

    var obj = {}    
        pr.forEach((prop => {
        
       var text_arr = []
       var val_arr = []
        prop.flats.forEach((prp, index, arr) => {
           
        text_arr.push(prp.flat_number)
        val_arr.push(prp.id)

            })
       obj["p_" + prop.id] = {
            text: text_arr,
            value: val_arr
        }
    
    }    
        
        ))
        res.render("tenants", {title: "Housekeep", user: req.user, props: pr, tenants, obj, flats})
            
            })
        })
    })
}

exports.get_cats = function(req, res, next){
models.maintenance_cat.findAll().then(ct => {
	res.render("maint_categories", {title: "Housekeep", user: req.user, categories: ct})
})
}

exports.add_category = function(req, res, next) {
	if(req.body.title && req.files && req.body.desc){
  var att = req.files.img;
  var attname = today.format() + req.user.id + "category_icon" + att.name
  var atturl = "/uploads/category-icons/" + attname
  att.mv(`public/uploads/category-icons/${attname}`, function(err) {
    if(err){
      return res.status(500).json({err: err})
    }
    	models.maintenance_cat.create({title: req.body.title, description: req.body.desc, img_url: atturl}).then(ct => {
        	res.json({
            	message: "Category Added Successfully"
            })
        })
  
  })
    }

	else {
    	res.json({
        	error: "Incomplete Details provided"
        })
    }

}

exports.get_priors = function(req, res, next){
models.priority.findAll().then(ct => {
	res.render("priorities", {title: "Housekeep", user: req.user, priorities: ct})
})
}

exports.add_prior = function(req, res, next) {
	if(req.body.title){

    	models.priority.create({title: req.body.title}).then(ct => {
        	res.json({
            	message: "Priority Added Successfully"
            })
  
  })
    }

	else {
    	res.json({
        	error: "Incomplete Details provided"
        })
    }

}

exports.get_maints = function(req, res, next){
models.maintenance.findAll({include: [{association: "flat", include: ["property"]}, "priority"], order: [["createdAt", "desc"]]}).then(maints => {
	res.render("maints", {title: "Housekeep", user: req.user, maints: maints,  moment: moment})
})
}

exports.get_complete = function(req, res, next){
     models.maintenance.findAll({where: {status: "completed"}, include: [{association: "flat", include: ["property"]}, "priority", "observation"], order: [["createdAt", "desc"]]}).then(completed => {
	res.render("complete", {title: "Housekeep", user: req.user,  moment: moment, completed})
	
    })
}

exports.get_maint = function(req, res, next){
models.maintenance.findOne({where: {id: req.params.id},include: [{association: "flat", include: [{association: "property", include: ['manager']}]}, "priority", "category", "observation", "purchases", "activities", "issues"]}).then(maint => {
	res.render("maintenance", {title: "Housekeep", user: req.user, maintenance:maint,  moment: moment})
})
}

exports.check_maint = function(req, res, next){
models.maintenance.findOne({where: {id: req.params.id}}).then(maint => {
	if(maint){
    next()
    }
else{
res.redirect("/tasks")
}
})
}

exports.get_activities = function(req, res, next) {
    if(req.query.id){
        models.activity.findAll({
            where: {maintenance_id: req.query.id}
        })
        .then(activities => {
            res.json(
                activities
            )
        })
    }
    else {
        res.json({
            error: "No maintenance id provided"
        })
    }
}
exports.get_observation = function(req, res, next){
    if(req.query.id){
        models.observation.findOne({where: {maintenance_id: req.query.id}}).then(observation => {
            models.purchase.findAll({where: {maintenance_id: req.query.id}}).then(purchases => {
                res.json({
                    observation,
                    purchases
                })
            })
        })
    }
    else {
    res.json({
        error: "No maintenance id provided"
    })
        
    }
}
exports.approve_task = function(req, res, next) {
    if(req.body.id){
        models.maintenance.update({status: "processing", progress_status: "ongoing"}, {where: {id: req.body.id}}).then(mn => {
            models.activity.create({
                maintenance_id: req.body.id,
                title: "Admin approved the task"
            }).then(active => {
            res.json({
                message: "You've approved the maintenance task"
            })
        })
        })
    }
    else {
        res.json({
            error: "No maintenance id provided"
        })
    }
}

exports.edit_user = function(req, res, next){
    if(req.body.id){
        models.user.findOne({where: {id: req.body.id}}).then(user => {
            if(req.files){
               if(user.email === req.body.email && !req.body.password){
                  fs.unlink(`public${user.img_url}`, (err) => {
                      if (err) {
                        console.error(err)
                        return
                      }
                    
                          	      var att = req.files.img;
  var attname = today.format() + req.body.id + "user" + att.name
  var atturl = "/uploads/tenants/" + attname
  
        att.mv(`public/uploads/tenants/${attname}`, function(err) {
            if(err){
              return res.status(500).json({err: err})
            }
          
          	var dt = moment(req.body.date)
    
    if(dt.diff(today, "days") > 3 ) {
    var rent = "active"
    }
     else if(dt.diff(today, "days") == 3  || today.diff(dt, "days") == 2){
     var rent = "almost due"
     }
     else if(dt.diff(today, "days") == 1 ) {
     var rent = "due"
     }
      else if(dt.diff(today, "days") < 1) {
     var rent = "expired"
     }
     
     models.user.update({firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, rent_expiry: req.body.date, rent_status: rent, img_url: atturl}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
               })
                    }) 
                  }
                  
               else if(user.email != req.body.email && !req.body.password) {
          if(!validator.isEmail(req.body.email)){
     res.json({
     error: 'Please use a valid email'
     })
     }
  
  else {
    models.admin.findOne({where: {email: req.body.email}}).then(adm => {
  	if(adm){
    res.json({
    error: 'This email address is already taken'
    })
    }
  else {
  models.manager.findOne({where: {email: req.body.email}}).then(mn => {
  	if(mn){
    res.json({
    error: 'This email address is already taken'
    })
    }
  
  else {
  	models.user.findOne({where: {email: req.body.email}}).then(usr => {
    if(usr) {
    res.json({
    error: 'This email address is already taken'
    })
    }else {
    models.contractor.findOne({where: {email: req.body.email}}).then(cont => {
    if(cont){
    	res.json({
        error: 'This email address is already taken'
        })
    }
    else {
                 fs.unlink(`public${user.img_url}`, (err) => {
                  if (err) {
                    console.error(err)
                    return
                  }
                
                  //file removed
                      	      var att = req.files.img;
                              var attname = today.format() + req.body.id + "user" + att.name
                              var atturl = "/uploads/tenants/" + attname
                              att.mv(`public/uploads/tenants/${attname}`, function(err) {
                    if(err){
                      return res.status(500).json({err: err})
                    }
                  
                	var dt = moment(req.body.date)
    
    if(dt.diff(today, "days") > 3 ) {
    var rent = "active"
    }
     else if(dt.diff(today, "days") == 3  || today.diff(dt, "days") == 2){
     var rent = "almost due"
     }
     else if(dt.diff(today, "days") == 1 ) {
     var rent = "due"
     }
      else if(dt.diff(today, "days") < 1) {
     var rent = "expired"
     }
     
      models.user.update({email: req.body.email, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, rent_expiry: req.body.date, rent_status: rent, img_url: atturl}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
               })
                              
                })
                
    }
    })
    }
    })
  }
  })
  }
  })
    
  
  }
               }
               
               else if(user.email === req.body.email && req.body.password){
                   fs.unlink(`public${user.img_url}`, (err) => {
                  if (err) {
                    console.error(err)
                    return
                  }
                
                  //file removed
                    	      var att = req.files.img;
  var attname = today.format() + req.body.id + "user" + att.name
  var atturl = "/uploads/tenants/" + attname  
  
        att.mv(`public/uploads/tenants/${attname}`, function(err) {
            if(err){
              return res.status(500).json({err: err})
            }
          
          	var dt = moment(req.body.date)
    
    if(dt.diff(today, "days") > 3 ) {
    var rent = "active"
    }
     else if(dt.diff(today, "days") == 3  || today.diff(dt, "days") == 2){
     var rent = "almost due"
     }
     else if(dt.diff(today, "days") == 1 ) {
     var rent = "due"
     }
      else if(dt.diff(today, "days") < 1) {
     var rent = "expired"
     }
     
   const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                 models.user.update({password: hash, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, rent_expiry: req.body.date, rent_status: rent, img_url: atturl}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
               })
                })    
               }
               
               else if(user.email != req.body.email && req.body.password) {
                    if(!validator.isEmail(req.body.email)){
     res.json({
     error: 'Please use a valid email'
     })
     }
  
  else {
    models.admin.findOne({where: {email: req.body.email}}).then(adm => {
  	if(adm){
    res.json({
    error: 'This email address is already taken'
    })
    }
  else {
  models.manager.findOne({where: {email: req.body.email}}).then(mn => {
  	if(mn){
    res.json({
    error: 'This email address is already taken'
    })
    }
  
  else {
  	models.user.findOne({where: {email: req.body.email}}).then(usr => {
    if(usr) {
    res.json({
    error: 'This email address is already taken'
    })
    }else {
    models.contractor.findOne({where: {email: req.body.email}}).then(cont => {
    if(cont){
    	res.json({
        error: 'This email address is already taken'
        })
    }
    else {
                   fs.unlink(`public${user.img_url}`, (err) => {
                  if (err) {
                    console.error(err)
                    return
                  }
                
                  //file removed
                      	      var att = req.files.img;
          var attname = today.format() + req.body.id + "user" + att.name
          var atturl = "/uploads/tenants/" + attname
          
               att.mv(`public/uploads/tenants/${attname}`, function(err) {
            if(err){
              return res.status(500).json({err: err})
            }
          
          	var dt = moment(req.body.date)
    
    if(dt.diff(today, "days") > 3 ) {
    var rent = "active"
    }
     else if(dt.diff(today, "days") == 3  || today.diff(dt, "days") == 2){
     var rent = "almost due"
     }
     else if(dt.diff(today, "days") == 1 ) {
     var rent = "due"
     }
      else if(dt.diff(today, "days") < 1) {
     var rent = "expired"
     }
          
   const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
              models.user.update({email: req.body.email, password: hash, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, rent_expiry: req.body.date, rent_status: rent, img_url: atturl}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
               })
                        })   
               }
    })
    }
    })
  }
  })
  }
  })
    
  
  }     
                        
               }
            }
            
            //else for if req.files
            else {
                 if(user.email === req.body.email && !req.body.password){
                 
          	var dt = moment(req.body.date)
    
    if(dt.diff(today, "days") > 3 ) {
    var rent = "active"
    }
     else if(dt.diff(today, "days") == 3  || today.diff(dt, "days") == 2){
     var rent = "almost due"
     }
     else if(dt.diff(today, "days") == 1 ) {
     var rent = "due"
     }
      else if(dt.diff(today, "days") < 1) {
     var rent = "expired"
     }
     
     models.user.update({firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, rent_expiry: req.body.date, rent_status: rent}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
                  }
                  
               else if(user.email != req.body.email && !req.body.password) {
          if(!validator.isEmail(req.body.email)){
     res.json({
     error: 'Please use a valid email'
     })
     }
  
  else {
    models.admin.findOne({where: {email: req.body.email}}).then(adm => {
  	if(adm){
    res.json({
    error: 'This email address is already taken'
    })
    }
  else {
  models.manager.findOne({where: {email: req.body.email}}).then(mn => {
  	if(mn){
    res.json({
    error: 'This email address is already taken'
    })
    }
  
  else {
  	models.user.findOne({where: {email: req.body.email}}).then(usr => {
    if(usr) {
    res.json({
    error: 'This email address is already taken'
    })
    }else {
    models.contractor.findOne({where: {email: req.body.email}}).then(cont => {
    if(cont){
    	res.json({
        error: 'This email address is already taken'
        })
    }
    else {
                 
                  
                	var dt = moment(req.body.date)
    
    if(dt.diff(today, "days") > 3 ) {
    var rent = "active"
    }
     else if(dt.diff(today, "days") == 3  || today.diff(dt, "days") == 2){
     var rent = "almost due"
     }
     else if(dt.diff(today, "days") == 1 ) {
     var rent = "due"
     }
      else if(dt.diff(today, "days") < 1) {
     var rent = "expired"
     }
     
      models.user.update({email: req.body.email, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, rent_expiry: req.body.date, rent_status: rent}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
                
    }
    })
    }
    })
  }
  })
  }
  })
    
  
  }
               }
               
               else if(user.email === req.body.email && req.body.password){
          
          	var dt = moment(req.body.date)
    
    if(dt.diff(today, "days") > 3 ) {
    var rent = "active"
    }
     else if(dt.diff(today, "days") == 3  || today.diff(dt, "days") == 2){
     var rent = "almost due"
     }
     else if(dt.diff(today, "days") == 1 ) {
     var rent = "due"
     }
      else if(dt.diff(today, "days") < 1) {
     var rent = "expired"
     }
     
   const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                 models.user.update({password: hash, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, rent_expiry: req.body.date, rent_status: rent}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })  
               }
               
               else if(user.email != req.body.email && req.body.password) {
                    if(!validator.isEmail(req.body.email)){
     res.json({
     error: 'Please use a valid email'
     })
     }
  
  else {
    models.admin.findOne({where: {email: req.body.email}}).then(adm => {
  	if(adm){
    res.json({
    error: 'This email address is already taken'
    })
    }
  else {
  models.manager.findOne({where: {email: req.body.email}}).then(mn => {
  	if(mn){
    res.json({
    error: 'This email address is already taken'
    })
    }
  
  else {
  	models.user.findOne({where: {email: req.body.email}}).then(usr => {
    if(usr) {
    res.json({
    error: 'This email address is already taken'
    })
    }else {
    models.contractor.findOne({where: {email: req.body.email}}).then(cont => {
    if(cont){
    	res.json({
        error: 'This email address is already taken'
        })
    }
    else {
          	var dt = moment(req.body.date)
    
    if(dt.diff(today, "days") > 3 ) {
    var rent = "active"
    }
     else if(dt.diff(today, "days") == 3  || today.diff(dt, "days") == 2){
     var rent = "almost due"
     }
     else if(dt.diff(today, "days") == 1 ) {
     var rent = "due"
     }
      else if(dt.diff(today, "days") < 1) {
     var rent = "expired"
     }
          
   const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
              models.user.update({email: req.body.email, password: hash, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, rent_expiry: req.body.date, rent_status: rent}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
               }
    })
    }
    })
  }
  })
  }
  })
    
  
  }     
                        
               }
            }
        })
    }
    else {
        res.json({
            error: "user id not provided"
        })
    }
}

exports.block_user = function(req, res, next){
    if(req.body.id){
        models.user.update({status: "blocked"}, {where: {id: req.body.id}}).then(rows => {
            res.json({
                message: "User blocked successfully"
            })
        })
    }
    else {
        res.json({
            error: "User id not provided"
        })
    }
}

exports.unblock_user = function(req, res, next){
    if(req.body.id){
         models.user.update({status: "active"}, {where: {id: req.body.id}}).then(rows => {
            res.json({
                message: "User reactivated successfully"
            })
        })
    }
    else {
        res.json({
            error: "User id not provided"
        })
    }
}

exports.edit_manager = function(req, res, next){
    if(req.body.id){
        models.manager.findOne({where: {id: req.body.id}}).then(user => {
            if(req.files){
               if(user.email === req.body.email && !req.body.password){
                  fs.unlink(`public${user.img_url}`, (err) => {
                      if (err) {
                       return res.json({
                            err: err,
                            error: "There was an error during file upload"
                        })
                        
                      }
                    
                          	      var att = req.files.img;
  var attname = today.format() + req.body.id + "manager" + att.name
  var atturl = "/uploads/managers/" + attname
  
        att.mv(`public/uploads/managers/${attname}`, function(err) {
            if(err){
              return res.status(500).json({err: err})
            }
          
     models.manager.update({firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, img_url: atturl}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
               })
                    }) 
                  }
                  
               else if(user.email != req.body.email && !req.body.password) {
          if(!validator.isEmail(req.body.email)){
     res.json({
     error: 'Please use a valid email'
     })
     }
  
  else {
    models.admin.findOne({where: {email: req.body.email}}).then(adm => {
  	if(adm){
    res.json({
    error: 'This email address is already taken'
    })
    }
  else {
  models.manager.findOne({where: {email: req.body.email}}).then(mn => {
  	if(mn){
    res.json({
    error: 'This email address is already taken'
    })
    }
  
  else {
  	models.user.findOne({where: {email: req.body.email}}).then(usr => {
    if(usr) {
    res.json({
    error: 'This email address is already taken'
    })
    }else {
    models.contractor.findOne({where: {email: req.body.email}}).then(cont => {
    if(cont){
    	res.json({
        error: 'This email address is already taken'
        })
    }
    else {
                 fs.unlink(`public${user.img_url}`, (err) => {
                  if (err) {
                    return res.json({
                            err: err,
                            error: "There was an error during file upload"
                        })
                    
                  }
                
                  //file removed
                      	      var att = req.files.img;
                              var attname = today.format() + req.body.id + "manager" + att.name
                              var atturl = "/uploads/managers/" + attname
                              att.mv(`public/uploads/managers/${attname}`, function(err) {
                    if(err){
                      return res.status(500).json({err: err})
                    }
               
     
      models.manager.update({email: req.body.email, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, img_url: atturl}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
               })
                              
                })
                
    }
    })
    }
    })
  }
  })
  }
  })
    
  
  }
               }
               
               else if(user.email === req.body.email && req.body.password){
                   fs.unlink(`public${user.img_url}`, (err) => {
                  if (err) {
                     return res.json({
                            err: err,
                            error: "There was an error during file upload"
                        })
                    
                  }
                
                  //file removed
                    	      var att = req.files.img;
  var attname = today.format() + req.body.id + "manager" + att.name
  var atturl = "/uploads/managers/" + attname  
  
        att.mv(`public/uploads/managers/${attname}`, function(err) {
            if(err){
              return res.status(500).json({err: err})
            }
          
          	var d
   const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                 models.manager.update({password: hash, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, img_url: atturl}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
               })
                })    
               }
               
               else if(user.email != req.body.email && req.body.password) {
                    if(!validator.isEmail(req.body.email)){
     res.json({
     error: 'Please use a valid email'
     })
     }
  
  else {
    models.admin.findOne({where: {email: req.body.email}}).then(adm => {
  	if(adm){
    res.json({
    error: 'This email address is already taken'
    })
    }
  else {
  models.manager.findOne({where: {email: req.body.email}}).then(mn => {
  	if(mn){
    res.json({
    error: 'This email address is already taken'
    })
    }
  
  else {
  	models.user.findOne({where: {email: req.body.email}}).then(usr => {
    if(usr) {
    res.json({
    error: 'This email address is already taken'
    })
    }else {
    models.contractor.findOne({where: {email: req.body.email}}).then(cont => {
    if(cont){
    	res.json({
        error: 'This email address is already taken'
        })
    }
    else {
                   fs.unlink(`public${user.img_url}`, (err) => {
                  if (err) {
                    return res.json({
                            err: err,
                            error: "There was an error during file upload"
                        })
                    
                  }
                
                  //file removed
                      	      var att = req.files.img;
          var attname = today.format() + req.body.id + "manager" + att.name
          var atturl = "/uploads/managers/" + attname
          
               att.mv(`public/uploads/managers/${attname}`, function(err) {
            if(err){
              return res.status(500).json({err: err})
            }
          
   const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
              models.manager.update({email: req.body.email, password: hash, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone, img_url: atturl}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
               })
                        })   
               }
    })
    }
    })
  }
  })
  }
  })
    
  
  }     
                        
               }
            }
            
            //else for if req.files
            else {
                 if(user.email === req.body.email && !req.body.password){
      
     models.manager.update({firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
                  }
                  
               else if(user.email != req.body.email && !req.body.password) {
          if(!validator.isEmail(req.body.email)){
     res.json({
     error: 'Please use a valid email'
     })
     }
  
  else {
    models.admin.findOne({where: {email: req.body.email}}).then(adm => {
  	if(adm){
    res.json({
    error: 'This email address is already taken'
    })
    }
  else {
  models.manager.findOne({where: {email: req.body.email}}).then(mn => {
  	if(mn){
    res.json({
    error: 'This email address is already taken'
    })
    }
  
  else {
  	models.user.findOne({where: {email: req.body.email}}).then(usr => {
    if(usr) {
    res.json({
    error: 'This email address is already taken'
    })
    }else {
    models.contractor.findOne({where: {email: req.body.email}}).then(cont => {
    if(cont){
    	res.json({
        error: 'This email address is already taken'
        })
    }
    else {
      models.manager.update({email: req.body.email, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
                
    }
    })
    }
    })
  }
  })
  }
  })
    
  
  }
               }
               
               else if(user.email === req.body.email && req.body.password){
          hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                 models.manager.update({password: hash, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })  
               }
               
               else if(user.email != req.body.email && req.body.password) {
                    if(!validator.isEmail(req.body.email)){
     res.json({
     error: 'Please use a valid email'
     })
     }
  
  else {
    models.admin.findOne({where: {email: req.body.email}}).then(adm => {
  	if(adm){
    res.json({
    error: 'This email address is already taken'
    })
    }
  else {
  models.manager.findOne({where: {email: req.body.email}}).then(mn => {
  	if(mn){
    res.json({
    error: 'This email address is already taken'
    })
    }
  
  else {
  	models.user.findOne({where: {email: req.body.email}}).then(usr => {
    if(usr) {
    res.json({
    error: 'This email address is already taken'
    })
    }else {
    models.contractor.findOne({where: {email: req.body.email}}).then(cont => {
    if(cont){
    	res.json({
        error: 'This email address is already taken'
        })
    }
    else {
          	   
   const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
              models.manager.update({email: req.body.email, password: hash, firstName: req.body.fname, lastName: req.body.lname, phone: req.body.phone}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "User updated successfully"
         })
     })
               }
    })
    }
    })
  }
  })
  }
  })
    
  
  }     
                        
               }
            }
        })
    }
    else {
        res.json({
            error: "user id not provided"
        })
    }
}

exports.block_manager = function(req, res, next){
    if(req.body.id){
        models.manager.update({status: "blocked"}, {where: {id: req.body.id}}).then(rows => {
            res.json({
                message: "User blocked successfully"
            })
        })
    }
    else {
        res.json({
            error: "User id not provided"
        })
    }
}

exports.unblock_manager = function(req, res, next){
    if(req.body.id){
         models.manager.update({status: "active"}, {where: {id: req.body.id}}).then(rows => {
            res.json({
                message: "User reactivated successfully"
            })
        })
    }
    else {
        res.json({
            error: "User id not provided"
        })
    }
}

exports.create_general_maint = function(req, res, next){
    if(req.body.p_id && req.body.title && req.body.desc && req.body.date && req.body.time){
        models.general_maintenance.create({
            title: req.body.title,
            description: req.body.desc,
            date: req.body.date,
            time: req.body.time,
            property_id: req.body.p_id
        }).then(mnt => {
            res.json({
                message: "General maintenance schedule created"
            })
               pusher.trigger('General Maintenance', 'New General Maintenance Scheduled', mnt, req.headers['x-socket-id']);
            
        })
    }
    else {
        res.json({
            error: "Please provide required info"
        })
    }
}

exports.get_generals = function(req, res, next){
    models.general_maintenance.findAll({include: [{association: "property", include: ["manager"]}]}).then(schedules => {
        models.property.findAll().then(props => {
            res.render("general", {title: "Housekeep",user: req.user, schedules,props, moment: moment })
        })
    })
}

exports.edit_category = function(req, res, next){
  if(req.files){
     if(req.body.title && req.body.desc && req.body.id){
         models.maintenance_cat.findOne({where: {id: req.body.id}}).then(mn => {
                         fs.unlink(`public${mn.img_url}`, (err) => {
                  if (err) {
                     return res.json({
                            err: err,
                            error: "There was an error during file upload"
                        })
                    
                  }
                
                  //file removed
   var att = req.files.img;
  var attname = today.format() + req.user.id + "category_icon" + att.name
  var atturl = "/uploads/category-icons/" + attname
  att.mv(`public/uploads/category-icons/${attname}`, function(err) {
            if(err){
              return res.status(500).json({err: err})
            }
          
                 models.maintenance_cat.update({title: req.body.title, description: req.body.desc, img_url: atturl}, {where: {id: req.body.id}}).then(rows => {
         res.json({
             message: "Update complete"
         })
     })
               })
                }) })
                
                
      }
      else {
          res.json({
              error: "Please provide required info"
          })
      } 
  }
  else {
      if(req.body.title && req.body.desc && req.body.id){
          models.maintenance_cat.update({title: req.body.title, description: req.body.desc}, {where: {id: req.body.id}}).then(rows => {
              res.json({
                  message: "Update complete successfully"
              })
          })
      }
      else {
          res.json({
              error: "Please provide required info"
          })
      }
  }
}

exports.edit_priority = function(req, res, next){
        if(req.body.title && req.body.id)
    {
        models.priority.update({title: req.body.title},{where: {id: req.body.id}}).then(rows => {
            res.json({
                message: "Update completed successfully"
            })
        })
    }
    
    else{
        res.json({
            error: 'Incomplete details supplied'
        })
    }
}

exports.edit_property = function(req, res, next){
      if(req.body.name && req.body.loc && req.body.id)
    {
        models.property.update({property_name: req.body.name, location: req.body.locc},{where: {id: req.body.id}}).then(rows => {
            res.json({
                message: "Update completed successfully"
            })
        })
    }
    
    else{
        res.json({
            error: 'Incomplete details supplied'
        })
    }
}
