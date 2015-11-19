var nodemailer = require('nodemailer');
var server= process.argv[2];
var statistics= process.argv[3];
var stat_value= process.argv[4]; 
// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'vikasgupta20@gmail.com',
        pass: '*******'
    }
});
 
// NB! No need to recreate the transporter object. You can use 
// the same transporter object for all e-mails 
 
// setup e-mail data with unicode symbols 
var mailOptions = {
    from: 'Vikas Gupta ✔ <vikasgupta20@gmail.com>', // sender address 
    to: 'vikasgupta20@gmail.com, vikasgupta20.com', // list of receivers 
    subject: 'ALERT! **RED ZONE**!✔', // Subject line 
    text: 'Server :'+server+' crossed the threshold value for parameter '+statistics+ ':'+stat_value // plaintext body 
    };
 
// send mail with defined transport object 
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
 
});
