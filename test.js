const models = require("./models")
var nodemailer = require('nodemailer')
const fileUpload = require('express-fileupload');
const validator = require("validator")
var bcrypt = require("bcrypt")
const cryptoRandomString = require('crypto-random-string');
const jwt = require("jsonwebtoken")
const AfricasTalking = require('africastalking');
// TODO: Initialize Africa's Talking
const africastalking = AfricasTalking({
  apiKey: 'dd0fde07e829030477d7adc0556201b1c899333de8bacd44db9986f0417c838f', 
  username: 'salonandspa'
});


 async function sendSMS(num, msg) {
    
    try {
  const result=await africastalking.SMS.send({
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
  from: "housekeep@nippongrand.com",
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
  
//  var tasks = []
//   models.property.findAll({where: {
//       manager_id: "0a4e31f0-cb32-469f-9933-6237ab34b061"
//   }, include: [{association: "flats"}]}).then(prop => {
//       if(prop){
//       prop.forEach(prop => {
//       prop.flats.forEach(flat => {
//           models.maintenance.findAll({
//         where: {flat_id: flat.id, status: "pending"},
//         include: [{association: "flat", include: "property"}]
//     }).then(mnts => {
//          let day = moment().format('l');
//         mnts.forEach((mnt, index, arr) => {
//             if(day.diff(moment(mnt.available_date)) == 0){
//                 tasks.push(mnt)
//             }
//         })
       
 
//     }) 
//       });//
       
//       });
       
       
//       console.log(tasks)
       
//       }}
       
//       )

//  	models.maintenance.create({
//     title: "test2", 
//     flat_id: 5,
//     cat_id: 1,
//     status: "pending",
//     priority_id: 2,
//     description: "edfdf",
//     img_url: null,
//     available_date: "new",
//     available_time: "new",
//     progress_status: "not-initiated"
//     }).then(maint => {
//         models.flat.findOne({where :{id: 5}, include: [
//             {association: "property", include: ["manager"]}
//             ]}).then(flt => {
                
//                 console.log(flt.property)
               
               
//             })
    
//     })

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
