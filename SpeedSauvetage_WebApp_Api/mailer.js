var _ = require('lodash');	
var nodemailer = require('nodemailer');

var config = {
    service: 'gmail', 
    secure: false,//true
    port: 25,
    auth: {
        user: "speed.sauvetage@gmail.com",
        pass: "SpeedSauv@2019#" // date de naiss 10 aout 1996
    }, 
    tls: {
      rejectUnauthorized: false
    }
};
          
var transporter = nodemailer.createTransport(config);

var defaultMail = {
    from: 'Speed Sauvetage <speed.sauvetage@gmail.com>',
    to:'speed.sauvetage@gmail.com',
    text: 'test text',
};

var sendEmail = (mail)=>{
    // use default setting
    mail = _.merge({}, defaultMail, mail);
    
    // send email
    transporter.sendMail(mail, function(error, info){
        if(error) return console.log(error);
        console.log('mail sent:', info.response);
    });
};

module.exports = {
  send: sendEmail
};