
const passport = require('passport')
const {isEmpty} = require('lodash');
const moment = require("moment")
const Sequelize = require('sequelize')
const Op = require('sequelize').Op
const myPassport = require('../passport-setup')(passport)
var models = require("../models")
const {validateLogin} = require("../validators/login");
var nodemailer = require('nodemailer')
const fileUpload = require('express-fileupload');
const validator = require("validator")
var bcrypt = require("bcrypt")
const cryptoRandomString = require('crypto-random-string');
const jwt = require("jsonwebtoken")
var today = moment();
const AfricasTalking = require('africastalking');

// TODO: Initialize Africa's Talking
const africastalking = AfricasTalking({
  apiKey: 'dd0fde07e829030477d7adc0556201b1c899333de8bacd44db9986f0417c838f', 
  username: 'salonandspa'
});


async function sendSMS(num, msg) {
    
    try {
  const result = await africastalking.SMS.send({
    to: num, 
    message: msg
  });
  console.log(result);
} catch(ex) {
  console.error(ex);
} 
};
    let Pusher = require('pusher');
                let pusher = new Pusher({
                     appId: '1018647',
                  key: '5bee59e13c42b1428b28',
                  secret: '42187d55f95d94009a44',
                  cluster: 'eu',
                  encrypted: true
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
  

const create_activity = (id, title) => {
    models.activity.create({
        title: title,
        maintenance_id: id
    })
}
const notify_manager = (id, title) => {
    models.manager_info.create({
        title: title,
        manager_id: id
    })
}

const notify_user = (id, title) => {
    models.user_info.create({
        title: title,
        user_id: id
    })
}

exports.get_index_user = function(req, res, next) {
	res.json({
    	text: "placeholder for some shit or sm"
    })
}

exports.login_user = function(req, res, next) {
const email = req.body.email
const password = req.body.password

if(!email || !password) {

	res.status(400).json({
    error: "Incomplete Details provided"
    })

}

else {
	
	models.user.findOne({where: {email: req.body.email}, include: {association: "flat", include: "property"}}).then(user => {
    	if(user){
        const user_data = {
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        profile_image: user.img_url,
        phone_number: user.phone,
        status: "active",
        flat_id: user.flat_id,
        flat: user.flat,
        email: user.email
        }
        const is_pass_valid = bcrypt.compareSync(req.body.password, user.password)
        if(is_pass_valid){
        const token = jwt.sign({user: user_data, role: "tenant"}, "eLFQivL/gdEiW0iuZY1YgdYfF1U=@!")
        res.json({
        message: "Signed in Successfully",
        token: token,
        user_data: user_data
        })
        }
        else {
        res.status(401).json({
        error: "Incorrect Login Details"
        })
        }
        }
    	else {
        res.status(401).json({
        	error: "User Account Not found"
        })
        }
    })
	
}
}

exports.get_index_manager = function(req, res, next) {
	res.json({
    	text: "nothing to see"
    })
}

exports.login_manager = function(req, res, next) {
const email = req.body.email
const password = req.body.password

if(!email || !password) {

	res.status(400).json({
    error: "Incomplete Details provided"
    })

}

else {
	
	models.manager.findOne({where: {email: req.body.email}, include: {association: "properties", include: "flats"}}).then(user => {
    	if(user){
        const user_data = {
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        profile_image: user.img_url,
        phone_number: user.phone,
        status: "active",
        properties_managing: user.properties,
        email: user.email
        }
        const is_pass_valid = bcrypt.compareSync(req.body.password, user.password)
        if(is_pass_valid){
        const token = jwt.sign({user: user_data, role: "manager"}, "eLFQivL/gdEiW0iuZY1YgdYfF1U=@!")
        res.json({
        message: "Signed in Successfully",
        token: token,
        user: user_data
        })
        }
        else {
        res.status(401).json({
        error: "Incorrect Login Details"
        })
        }
        }
    	else {
        res.status(401).json({
        	error: "User Account Not found"
        })
        }
    })
	
}
}

exports.get_all_categories= function(req, res, next){
	jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
    models.maintenance_cat.findAll().then(cats => {
    	res.json({
        	categories: cats
        })
    })
    }
    })
}

exports.search_by_category = function(req, res, next){
jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
    models.maintenance_cat.findAll({where: {title: {[Sequelize.Op.like]: `${req.body.title}`}}}).then(cats => {
    	res.json({
        	results: cats
        })
    })
    }
    })
}

exports.request_maintenance = function(req, res, next) {
jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   	if(req.body.title && req.body.cat_id && req.body.priority_id && req.body.description && req.body.available_date && req.body.available_time){
  	models.maintenance.create({
    title: req.body.title, 
    flat_id: data.user.flat_id,
    cat_id: req.body.cat_id,
    status: "pending",
    priority_id: req.body.priority_id,
    description: req.body.description,
    img_url: req.body.img_url || null,
    available_date: req.body.available_date,
    available_time: req.body.available_time,
    progress_status: "not-initiated"
    }).then(maint => {
        models.flat.findOne({where :{id: data.user.flat_id}, include: [
            {association: "property", include: ["manager"]}
            ]}).then(flt => {
                notify_user(data.user.id, "You made a new maintenance request")
                notify_manager(flt.property.manager.id, "A new maintenance request was made")
                create_activity(maint.id, "Request Was Initiated")
                
                	res.json({message: "Request sent successfully", user_data: data.user})
                	pusher.trigger('New-Request', 'New-maintenance-requested', maint, req.headers['x-socket-id']);
                	sendSMS([data.user.phone_number], `Hi ${data.user.first_name}, your maintenance request on Housekeep has been recieved and is being processed.`)
               
                	var message_1 = `<h3>New Maintenance Request</h3> <br> Dear ${data.user.first_name}, your request has been recieved and below is your schedule: <br><p><b>Title</b>: ${maint.title}<br><b>Flat</b>: ${flt.id}<br><b>Manager</b>: ${flt.property.manager.firstName} ${flt.property.manager.lastName}<br><b>Outcome Status</b>: ${maint.status}<br><b>Property</b>: ${flt.property.property_name}`
                	var message_2 = `<h3>New Maintenance Request</h3> <br> Dear ${flt.property.manager.firstName}, a new request was made: <br><p><b>Title</b>: ${maint.title}<br><b>Flat</b>: ${flt.flat_number}<br><b>Manager</b>: ${flt.property.manager.firstName} ${flt.property.manager.lastName}<br><b>Outcome Status</b>: ${maint.status}<br><b>Property</b>: ${flt.property.property_name} `
                	sendmail(data.user.email, "New Maintenance Request", message_1)
                	sendmail(flt.property.manager.email, "New Maintenance Request", message_2)
            })
    
    })

    }
    else {
    res.status(400).json({
    	error: "Incomplete Details supplied"
    })
    }
    
    }
    })	
}

exports.add_observation = (req, res, next) => {
jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   	if(req.body.is_paid == true || req.body.is_paid == false && req.body.title && req.body.description && req.body.maintenance_id && req.body.contractor_id){
	        models.observation.findOne({where: {maintenance_id: req.body.maintenance_id}}).then(chck => {
        if(chck){
        res.status(403).json({
        error: "An observation for the given task already exists"
        })
        }
        else{
    if(req.body.is_paid == false){
       
        models.observation.create({
        	title: req.body.title,
        	description: req.body.description,
        	payment: false,
        	payment_amount: 0,
        	maintenance_id: req.body.maintenance_id
        }).then(obs => { 
        models.maintenance.findOne({where: {id: req.body.maintenance_id}, include: [{association: "flat", include: ["user"]}]}).then(mnt => {
        notify_manager(data.user.id, "A Submitted An observation for the maintenance request")
        notify_user(mnt.flat.user.id, "Your request has been assessed")
        create_activity(obs.maintenance_id, "An observation for the request was submitted")
        
        res.json({
        message: "Observation added successfully", user_data: data.user
        })
        
        })
        })
        }else if(req.body.is_paid == true){
        if(req.body.purchases.length < 1){
        	res.status(400).json({
            error: "Payment Checked true but no items provided"
            })
        }
        else {
        var amt = 0;
        req.body.purchases.forEach(pur => {
        var tl = pur.price * pur.quantity
        amt += tl
        })
        console.log(amt)
         models.observation.create({
        	title: req.body.title,
        	description: req.body.description,
        	payment: true,
        	payment_amount: amt,
        	maintenance_id: req.body.maintenance_id
        }).then(ob => {
         	req.body.purchases.forEach((pur, index, arr) => {
            
            if(index + 1 == arr.length){
            	models.purchase.create({
                title: pur.item_name,
                payment_amount: pur.price,
                payment_quantity: pur.quantity,
                maintenance_id: req.body.maintenance_id
                }).then(purc => {
                     models.maintenance.findOne({where: {id: req.body.maintenance_id}, include: [{association: "flat", include: ["user"]}]}).then(mne => {
        notify_manager(data.user.id, "A Submitted An observation for the maintenance request")
        notify_user(mne.flat.user.id, "Your request has been assessed")
        create_activity(ob.maintenance_id, "An observation for the request was submitted")
        
                res.json({
                message: "Observation sent Successfully and total cost is: N" + amt, user_data: data.user
                })
                

                         
                     })
                })
            }
            else{
            	models.purchase.create({
                title: pur.item_name,
                payment_amount: pur.price,
                payment_quantity: pur.quantity,
                maintenance_id: req.body.maintenance_id
                })
            }
            })
         })
        
        
        }
        }
    
     
        }
        })
    }
    else {
    res.status(400).json({
    	error: "Incomplete Details supplied",
    body: req.body
    })
    }
    
    }
    })
}


exports.get_all_maintenance_user_comp = function(req, res, next){
	jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }

    
    else {    
    console.log(data)
   	if(data.role == "tenant"){
  	models.maintenance.findAll({
    order: [["createdAt", "desc"]],
    where: {flat_id: data.user.flat.id, status: "completed"},
    include: [{association: "flat", include: "property"}]
    }).then(tasks => {
    res.json({
    tasks: tasks,
    user_data: data.user
    })
    })
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })	
}

exports.get_all_maintenance_user = function(req, res, next){
	jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }

    
    else {    
    console.log(data)
   	if(data.role == "tenant"){
  	models.maintenance.findAll({
    order: [["createdAt", "desc"]],
    where: {flat_id: data.user.flat.id},
    include: [{association: "flat", include: "property"}]
    }).then(tasks => {
    res.json({
    tasks: tasks,
    user_data: data.user
    })
    })
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })	
}

exports.get_all_maintenance_user_pending = function(req, res, next){
	jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   	if(data.role == "tenant"){
  	models.maintenance.findAll({
    order: [["createdAt", "desc"]],
    where: {flat_id: data.user.flat.id, [Op.or]: [{status: "pending"}, {status: "in-progress"}]},
    include: [{association: "flat", include: [ 'property', 'user']}]
    }).then(tasks => {
    res.json({
    tasks: tasks,
    user_data: data.user
    })
    })
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })	
}




exports.get_all_maintenance_manager = function(req, res, next){
jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {

    var the_arr = data.user.properties_managing.forEach((dat, ind, arr) => {
    
    dat.flats.forEach((flat, index, array) => {
     	arr.push(flat.id)
    })
  
    })
    
    console.log(the_arr)
   		if(data.role == "manager"){
  	models.maintenance.findAll({
    order: [["createdAt", "desc"]],
    where: {flat_id: {[Op.or]: the_arr}},
    include: [{association: "flat", include: ["property", "user"]}]
    }).then(tasks => {
    res.json({
    tasks: tasks,
    user_data: data.user
    })
    })
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })	
}

exports.get_maintenance_user = function(req, res, next){
jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant"){
  	models.maintenance.findOne({
    where: {id: req.body.id},
    order: [["createdAt", "desc"]],
    include: [{association: "flat", include:["property", "user"]}, "priority", "category"]
    }).then(task => {
    res.json({
    task: task,
    user_data: data.user
    })
    })
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })	
}

exports.get_maintenance_manager = function(req, res, next){
jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager"){
  	models.maintenance.findOne({
    where: {id: req.body.id},
    order: [["createdAt", "desc"]],
    include: [{association: "flat", include:["property","user"]}, "priority", "category", "activities"]
    }).then(task => {
    res.json({
    task: task,
    user_data: data.user
    })
    })
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })	
}

exports.priorities_user = function(req, res, next){
    jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant" || data.role == "manager"){
  	models.priority.findAll().then(priorities => {
  	    res.json(priorities)
  	})
  
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })	
}

exports.get_activities = function(req, res, next) {
        jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant" || data.role == "manager"){
   		   if(req.body.maintenance_id){
  	models.activity.findAll({where: {maintenance_id: req.body.maintenance_id}, order: [["createdAt", "desc"]]}).then(activities => {
  	    res.json(activities)
  	})
  
   		   }
   		   else {
   		       res.status(400).json({
   		           error: "Please provide a maintenance id"
   		       })
   		   }
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })
}

exports.get_notifications_user = function(req, res, next){
        jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant"){
  	models.user_info.findAll({where: {user_id: data.user.id}, order: [["createdAt", "desc"]]}).then(notifications => {
  	    res.json(notifications)
  	})
  
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })
}

exports.get_notifications_manager = function(req, res, next){
        jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager"){
  	models.manager_info.findAll({where: {manager_id: data.user.id}, order: [["createdAt", "desc"]]}).then(notifications => {
  	    res.json(notifications)
  	})
  
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })
}
exports.assign_contractor = function(req, res, next) {
        jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager"){
  if(req.body.contractor_id && req.body.maintenance_id && req.body.time){
      models.contractor.findOne({where: {id: req.body.contractor_id}}).then(contractor => {
    if(contractor){
      models.maintenance.update({contractor_id: req.body.contractor_id, progress_status: "assigned", contractor_arrival: req.body.time}, {where: {id: req.body.maintenance_id}}).then(rows => {
          if(rows){
              models.maintenance.findOne({where: {id: req.body.maintenance_id}}).then(maint => {
                  
            models.user.findOne({where: {flat_id: maint.flat_id}}).then(user => {
                models.flat.findOne({where: {id: maint.flat_id}, include: ["property"]}).then(flt => {
                      res.json({
                  message: "Successfully assigned contractor to this task",
                  user_data: data.user
              })
              pusher.trigger('Contractor-Assigned', 'A-Contractor-has-been-assigned-to-your-task', {contractor, maint}, req.headers['x-socket-id']);
              	
                  	sendSMS([user.phone], `Hi ${user.firstName}, your maintenance request on Housekeep has been assigned a contractor and is scheduled for: ${moment(maint.available_date).format("l")} ${maint.available_time}. \n Contractor: ${contractor.firstName} ${contractor.lastName} \n Contractor Contact: ${contractor.phone}`)
                sendSMS([contractor.phone], `Hi ${contractor.firstName}, you have been assigned to a new request. \n Title: ${maint.title} \n Description: ${maint.description} \n Flat: ${flt.flat_number} \n Property: ${flt.property.property_name} \n Schedule: ${moment(maint.available_date).format("l")} ${maint.available_time}`)
                	var message_1 = `<h3>Contractor Assignment</h3> <br> Dear ${user.firstName}, your requested task has been assigned to a contractor and scheduled for: ${moment(maint.available_date).format("l")} ${maint.available_time} and below is your schedule: <br><p><b>Title</b>: ${maint.title}<br><b>Flat</b>: ${flt.flat_number}<br><b>Manager</b>: ${user.firstName} ${user.lastName}<br><b>Outcome Status</b>: ${maint.status}<br><b>Property</b>: ${flt.property.property_name}`
                	
                	sendmail(user.email, "Contractor Assignment", message_1)
                })
              
            })
              
              })
          }
      })
      
    }else {
        res.status(400).json({
            error: "Invalid contractor Id provided"
        })
    }
      
      })
  }
  else {
      res.status(400).json({
          error: "Incomplete details provided"
      })
  }
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })
}
exports.get_all_contractors = function(req, res, next){
          jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager"){
 models.contractor.findAll().then(contractors => {
     res.json(contractors)
 })
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })
}

exports.initiate_task = function(req, res, next) {
    jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager" || 
data.role == "tenant"){  
if(req.body.maintenance_id){
      models.maintenance.update({status: "processing", progress_status: "initiated"}, {where: {id: req.body.maintenance_id}}).then(rows => {
          
          
          if(rows){
            models.maintenance.findOne({where: {id: req.body.maintenance_id}}).then(mnt => {
                
                        
            models.user.findOne({where: {flat_id: mnt.flat_id}}).then(user => {
                models.flat.findOne({where: {id: mnt.flat_id}, include: ["property"]}).then(flt => {
               models.contractor.findOne({where: {id: mnt.contractor_id}}).then(contractor => {
                    
              res.json({
                  message: "Task Initiated successfully"
              })
              pusher.trigger('Task-Initiated', 'Contractor-confirmed-and-Task-has-been-initiated', mnt, req.headers['x-socket-id']);
              
              	sendSMS([user.phone], `Hi ${user.firstName}, your maintenance request on Housekeep has been initiated.`)
              	
              	sendSMS([contractor.phone], `Hi ${contractor.firstName}, your current task has been initiated. \n Title: ${mnt.title} \n Description: ${mnt.description} \n Flat: ${flt.flat_number} \n Property: ${flt.property.property_name} \n Schedule: ${moment(mnt.available_date).format("l")} ${mnt.available_time}`)
               
                	var message_1 = `<h3>Task Commencement</h3> <br> Dear ${user.firstName}, your task has been initiated and below is your schedule: <br><p><b>Title</b>: ${mnt.title}<br><b>Flat</b>: ${flt.flat_number}<br><b>Manager</b>: ${user.firstName} ${user.lastName}<br><b>Outcome Status</b>: ${mnt.status}<br><b>Property</b>: ${flt.property.property_name}`
                	
                	sendmail(user.email, "Task Commencement", message_1)
               })    
                   
                })
                
            })
            })
          }
      })
  }
  else {
      res.status(400).json({
          error: "Incomplete details provided"
      })
  }
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })
}

exports.confirm_task = function(req, res, next){
    jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager" || data.role == "tenant"){
  if(req.body.maintenance_id){
      models.maintenance.update({status: "processing", progress_status: "ongoing"}, {where: {id: req.body.maintenance_id}}).then(rows => {
          if(rows){
              res.json({
                  message: "Task Initiated successfully",
                  user_data: data.user
              })
              
              
          }
      })
  }
  else {
      res.status(400).json({
          error: "Incomplete details provided"
      })
  }
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })    
}
// exports.give_feedback  = function(req, res, next){
    
// }
// exports.update_user = function(req, res, next){
    
// }


exports.forgot_password = function(req, res, next){
      if(req.body.email){
          models.user.findOne({where: {email: req.body.email}}).then(user => {
              if(user){
                  const token = cryptoRandomString({length: 6, type: 'numeric'});
                  
                  sendmail(req.body.email, "Password Reset On Housekeep", `<p>Your password reset token is: <b>${token}</b></p>`)
                  models.user.update({
                      pass_reset_token: token
                  }, {where: {id: user.id}}).then(rows => {
                      res.json({
                          message: "Your request to reset your password was recieved and your password reset token has been sent to your email",
                          token: token,
                          user_data: user
                      })
                  })
              }
              else {
                  
                  
        models.manager.findOne({where: {email: req.body.email}}).then(manager => {
            if(manager){
                 const token = cryptoRandomString({length: 6, type: 'numeric'});
                  
                  sendmail(req.body.email, "Password Reset On Housekeep", `<p>Your password reset token is: <b>${token}</b></p>`)
                  models.manager.update({
                      pass_reset_token: token
                  }, {where: {id: manager.id}}).then(rows => {
                      res.json({
                          message: "Your request to reset your password was recieved and your password reset token has been sent to your email",
                          token: token,
                          user_data: manager
                      })
                  })
            }
            else {
                res.status(403).json({
                      error: "You provided an invalid email address"
                  })
              }
            
        })
        }
          })
      }
      else {
          res.status(400).json({
              error: "Please provide your email address"
          })
      }
}

exports.reset_password = function(req, res, next){
    if(req.body.token && req.body.password){
        models.user.findOne({where: {pass_reset_token: req.body.token}}).then(user => {
            if(user){
                if(!validator.isAscii(req.body.password)) {
  	res.json({
    	error: 'Invalid characters in password please try another'
    })
  }
  else if(!validator.isLength(req.body.password, {min: 8, max: 30})){
  res.json({
  error: 'Please ensure that your password has a minimum of 8 characters'
  })
  }else {
  const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
      models.user.update({password: hash, pass_reset_token: null}, {where: {id: user.id}}).then(rows => {
          res.json({
              message: "password changed successfully",
              user_data: data.user
          })
      })
  }
            }
            else {
            models.manager.findOne({where: {pass_reset_token: req.body.token}}).then(manager => {
                if(manager){
                                  if(!validator.isAscii(req.body.password)) {
  	res.json({
    	error: 'Invalid characters in password please try another'
    })
  }
  else if(!validator.isLength(req.body.password, {min: 8, max: 30})){
  res.json({
  error: 'Please ensure that your password has a minimum of 8 characters'
  })
  }else {
  const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
      models.manager.update({password: hash, pass_reset_token: null}, {where: {id: manager.id}}).then(rows => {
          res.json({
              message: "password changed successfully",
              user_data: data.user
          })
      })
  }
                }
                else {
                  res.status(403).json({
                 error: "Invalid token provided"
             })   
                }
            })
               
            }
        })
    }else {
        res.status(400).json({
            error: "Incomplete details provided"
        })
    }
}


exports.get_today_tasks = function(req, res, next){
     jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant"){
   
    models.maintenance.findAll({
        where: {flat_id: data.user.flat_id},
        include: [{association: "flat", include: "property"}]
    }).then(mnts => {
        let day = moment().format('l');
        const tasks = []

        mnts.forEach((mnt, index, arr) => {
            if(day.diff(moment(mnt.available_date)) < 1){
                tasks.push(mnt)
            }
        })
        
        res.json({
            tasks,
            user_data: data.user
        })
    })
 
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })    
}


exports.get_high_priority = function(req, res, next){
     jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant"){

    models.priority.findOne({where: {title: 'high'}}).then(prior => {
        models.maintenance.findAll({where: {flat_id: data.user.flat_id, priority_id: prior.id}, include: [{association: "flat", include: "property"}]}).then(tasks => {
            res.json({
                tasks,
                user_data: data.user
            })
        })
    })

    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request",
    	data
    })
    }
    
    }
    }) 
}

exports.get_past_due = function(req, res, next){
      jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant"){
const today = moment().format('l');
        models.maintenance.findAll({where: {flat_id: data.user.flat_id}, include: [{association: "flat", include: "property"}]}).then(tsks => {
              const tasks = []
        
              	var future = moment(req.body.date)

        tsks.forEach((mnt, index, arr) => {
            if(moment(mnt.available_date).diff(today) < 0){
                tasks.push(mnt)
            }
        })
        
        res.json({
            tasks,
            user_data: data.user
        })
    })

    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    }) 
}

exports.get_general_maintenances = function(req, res, next){
      jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant" || data.role == "manager"){
        
        models.general_maintenance.findAll().then(tsks => {
            res.json({
                general_maintenances: tsks,
                user_data: data.user
            })
        })

    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    }) 
}

exports.get_general_maintenance = function(req, res, next){
      jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant" || data.role ==  "manager"){
        if(req.body.id){
        models.general_maintenance.findOne({where: {id: req.body.id}}).then(tsks => {
            res.json({
                general_maintenances: tsks,
                user_data: data.user
            })
        })
        
        }
        
        else {
            res.status(400).json({
                error: "Maintenance id not given"
            })
        }

    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    }) 
}

exports.get_activities = function(req, res, next){
      jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant" || data.role == "manager"){
        if(req.body.maintenance_id){
        models.activity.findAll({where: {maintenance_id: req.body.maintenance_id}}).then(progress => {
            res.json({
                progress,
                user_data: data.user
            })
        })
        
        }
        
        else {
            res.status(400).json({
                error: "Maintenance id not given"
            })
        }

    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    }) 
}

exports.approve = function(req, res, next){
      jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant"){
        if(req.body.maintenance_id){
        models.maintenance.update({status: "completed", progress_status: "finished"}, {where: {id: req.body.maintenance_id}}).then(mnt => {
            
        models.maintenance.findOne({where: {id: req.body.maintenance_id}}).then(maint => {
                    
            models.user.findOne({where: {flat_id: maint.flat_id}}).then(user => {
                models.flat.findOne({where: {id: maint.flat_id}, include: ["property"]}).then(flt => {
                    models.contractor.findOne({where: {id: maint.contractor_id}}).then(contractor => {
                          models.activity.create({
                title: "Task Completed",
                maintenance_id: req.body.maintenance_id
            }).then(mt => {
                res.json({
                    message: "Task completed"
                })
                	sendSMS([data.user.phone], `Hi ${data.user.first_name}, your maintenance request on Housekeep has been marked complete.`)
                    sendSMS([contractor.phone], `Hi ${contractor.firstName}, your current task has been marked complete.\n Title: ${maint.title}\n Description: ${maint.description}\n Flat: ${flt.flat_number}\n Property: ${flt.property.property_name}\n Schedule: ${moment(maint.available_date).format("l")} ${maint.available_time}`)
                	var message_1 = `<h3>Task Completion</h3> <br> Dear ${data.user.first_name}, has been marked complete and below is the break down: <br><p><b>Title</b>: ${maint.title}<br><b>Flat</b>: ${flt.flat_number}<br><b>Manager</b>: ${data.user.firstName} ${data.user.lastName}<br><b>Outcome Status</b>: ${maint.status}<br><b>Property</b>: ${flt.property.property_name}`
                	
                	sendmail(data.user.email, "Task Completion", message_1)
                        
                    })
                   
                    
                })
        })
           
            })
        })
        
        })
        
        }
        
        else {
            res.status(400).json({
                error: "Maintenance id not given"
            })
        }

    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    }) 
}

exports.get_user_rents = function(req, res, next){
    jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager"){
        
        models.property.findAll({where: {manager_id: data.user.id}, include: [{association: "flats", include: ["user"]}]}).then(rnt => {
            res.json({
                rents: rnt,
                user_data: data.user
            })
        })

    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    }) 
}

exports.get_expenses = function(req, res, next){
    jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager"){
        
        models.property.findAll({where: {manager_id: data.user.id}, include: [{association: "flats", include: [{association: "maintenances", include: ["observation", "purchases"]},"user"]}]}).then(rnt => {
            res.json({
                expenses: rnt
            })
        })

    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    }) 
}

exports.complain = function(req, res, next){
      jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant"){
        if(req.body.maintenance_id && req.body.description){
        models.maintenance.findOne({where: {id: req.body.maintenance_id}}).then(maint => {
        models.flat.findOne({where: {id: maint.flat_id}, include: ["property"]}).then(flat => {
            models.issue.create({
                maintenance_id: req.body.maintenance_id,
                title: req.body.description
            }).then(issue => {
                res.json({
                    message: "Your issue has been delivered and we will respond to it as soon as possible",
                    user_data: data.user
                })
                	var message_1 = `<h3>Task Completion</h3> <br> Dear ${data.user.first_name}, your complaint has been recieved and we will respond to it as soon as possible`
                	sendSMS([contractor.phone], `Hi ${contractor.firstName}, there has been an issue with your current task, please try to rectify.\n Title: ${maint.title}\n Description: ${maint.description}\n Flat: ${flt.flat_number}\n Property: ${flt.property.property_name}\n Issue: ${issue.title}\n Schedule: ${moment(maint.available_date).format("l")} ${maint.available_time}`)
                	sendmail(data.user.email, "Complaint", message_1)
            })})})
        }
        else {
        res.json({
            error: "Incomplete details provided"
        })
        }
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    }) 
}

exports.get_issues = function(req, res, next){
          jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant" || data.role == "manager"){
        if(req.body.maintenance_id){
            models.issue.findAll({
                where: {maintenance_id: req.body.maintenance_id}
            }).then(issues => {
                res.json({
                    issues,
                    user_data: data.user
                })
            })
        }
        else {
        res.json({
            error: "No maintenance id provided"
        })
        }
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    }) 
}

exports.get_not_initiated = (req, res, next) => {
        jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager" || data.role == "tenant"){
   
    models.maintenance.findAll({
        where: {progress_status: "not-initiated"},
        include: [{association: "flat", include: "property"}]
    }).then(tasks => {

        
        res.json({
            tasks
        })
    })
 
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })    
}

exports.get_status = (req, res, next) => {
    if(req.body.id){
        models.maintenance.findOne({where: {id: req.body.id}}).then(mnt => {
            if(mnt){
            res.json({
                main_status: mnt.status,
                progress_status_for_app: mnt.progress_status
            })
            }
            else {
                res.json({
                    error: "Id not valid"
                })
            }
        })
    }
    else {
         res.json({
             error: "No id provided"
         })
    }
}

exports.get_initiated = (req, res, next) => {
        jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant"){
   
    models.maintenance.findAll({
        where: {flat_id: data.user.flat_id, progress_status: "initiated"},
        include: [{association: "flat", include: "property"}]
    }).then(tasks => {

        
        res.json({
            tasks
        })
    })
 
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })    
}

exports.get_contractor = (req, res, next) => {
        jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager" || data.role == "tenant"){
   if(req.body.maintenance_id){
    models.maintenance.findOne({where: {id: req.body.maintenance_id}}).then(maint => {
        models.contractor.findOne({
            where: {id: maint.contractor_id}
        }).then(data => {
            if(data){
            res.json({
                task: maint,
                contractor: data
            })
            }
            else {
                res.json({
                    task: maint,
                    contractor: "not assigned yet"
                })
            }
        })
    })
    
   } else {
       res.json({
           error: "Maintenance id not provided"
       })
   }
 
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })    
}



exports.make_status = (req, res, next) => {
        jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager"){
   if(req.body.maintenance_id && req.body.status){
   models.maintenance.update({progress_status: req.body.status}, {where: {id: req.body.maintenance_id}}).then(row => {
       res.json({
           message: "Status updated successfully",
           user_data: data.user
       })
   })
    }
    else {
    res.json({
    	error: "Please provide complete details"
    })
    }
    
    }
    else {
        res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    
    })
}

exports.get_today_complete = function(req, res, next){
     jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "tenant"){
   
    models.maintenance.findAll({
        where: {flat_id: data.user.flat_id, status: "complete", progress_status: "finished"},
        include: [{association: "flat", include: "property"}]
    }).then(mnts => {
        let day = moment().format('l');
        const tasks = []

        mnts.forEach((mnt, index, arr) => {
            if(day.diff(moment(mnt.available_date)) == 0){
                tasks.push(mnt)
            }
        })
        
        res.json({
            tasks,
            length: tasks.length
        })
    })
 
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })    
}

exports.get_today_complete_manager = function(req, res, next){
     jwt.verify(req.token, 'eLFQivL/gdEiW0iuZY1YgdYfF1U=@!', (err, data) => {
    if(err){
    res.status(400).json({
    error: "Please ensure you've provided a valid token"
    })
    }
    
    else {
   		if(data.role == "manager"){
   	var tasks = []
   models.property.findAll({where: {
       manager_id: data.user.id
   }, include: [{association: "flats"}]}).then(prop => {
       if(prop){
       prop.forEach(prop => {
       prop.flats.forEach(flat => {
           models.maintenance.findAll({
        where: {flat_id: flat.id, status: "complete", progress_status: "finished"},
        include: [{association: "flat", include: "property"}]
    }).then(mnts => {
         let day = moment().format('l');
        mnts.forEach((mnt, index, arr) => {
            if(day.diff(moment(mnt.available_date)) == 0){
                tasks.push(mnt)
            }
        })
       
 
    }) 
       });//
       
       });
       
       res.json({
            tasks,
            length: tasks.length
        })
       } else {
           res.json({
               length: 0
           })      }
   })
    
    }
    else {
    res.status(403).json({
    	error: "You are not authorized to make this request"
    })
    }
    
    }
    })    
}

exports.notify = (req, res, next) => {
          
        
        if(req.body.user_id && req.body.payload && req.body.channel_name && req.body.event_name){
        models.user.findOne({where: {id: req.body.user_id}}).then(user => {
            if(user){
                pusher.trigger(req.body.channel_name, req.body.event_name, {payload: req.body.payload, user: user}, req.headers['x-socket-id']);
                res.json({
                    message: "Pusher Triggered successfully"
                })
            }
            else {
                models.manager.findOne({where: {id: req.body.user_id}}).then(manager => {
                    if(manager){
                        pusher.trigger(req.body.channel_name, req.body.event_name, {payload: req.body.payload, user: manager}, req.headers['x-socket-id']);
                        res.json({
                            message: "Pusher Triggered successfully",
                            user_data: data.user
                        })
                    }
                    else {
                        res.json({
                            error: "User not found with this id"
                        })
                    }
                })
            }
        })
        
    }
    else {
        res.status(400).json({
            error: "Incomplete details provided"
        })
    }

    
    
    
    
    
    
    
    
   
}