var mongoose = require('mongoose'); //include de mongoose: Module qui permet d'interragir avec un base mongodb
var bcrypt = require('bcrypt'); //include de Bcrypt: Module utilisé pour le hashage des mot de passe
//var hash = bcrypt.hashSync(password, 10);

var Schema = mongoose.Schema;


//Schema de la collection Log
var Log_Schema = mongoose.Schema({
    id_med: { type: Number, required: true }, 
    date: { type: Date,required:true}, 
    id_pat: { type: Number, required: true }
   
}, { collection : 'log_collection' }); 
var Log = mongoose.model('log_collection', Log_Schema);

//Schema de la collection Medecin
var Med_Schema = mongoose.Schema({
    id_med: { type: Number,  },
    username: { type: String, required: true }, 
    password: { type: String,required:true}, 
    fonction: { type: String, required: true },
    service: { type: String, required: true }

}, { collection : 'med_collection' }); 
var Med = mongoose.model('med_collection', Med_Schema);

//Schema de la collection Medecin
var AdminSchema = mongoose.Schema({
    username: { type: String, required: true }, 
    password: { type: String,required:true}, 
    fonction: { type: String, required: true },
    service: { type: String, required: true }

}, { collection : 'admin_collection' }); 
var Admin = mongoose.model('admin_collection', AdminSchema);   


var syncAdminLogin= (username,password) => {
       //var hash = bcrypt.hashSync(password, 10);
  console.log(username)
       return new Promise((resolve, reject) => {
        //Chercher l'utilisateur dans la base de donnée
        Admin.
          findOne().
          where('username').equals(username).
          select('password'). //récupérer le mot de passe
          exec(function (err, utilisateur) {
            //s'il y  a une erreur
            if (err){ 
                     reject(err);
                    }
            //si l'utilisateur est retrouvé dans la base de donnée
            else if(utilisateur){
                //vérifier le mot de passe
                //si les mot de passes correspondent  
              
                if(bcrypt.compareSync(password, utilisateur.password)) {
                    //récupérer les données du patient
                   resolve("yes")
                    

                } 
                //si les mot de passes ne correspondent pas
                else {
                   resolve("Login");
                }

            }    
            //s'il n'y a pas d'erreur et que l'utilisateur n'est pas retrouvé dans la base
            else{
              console.log("no user found")
              resolve("Login");
            }
           
          }); 
  
        
    });        
};
var syncAddMed = (user,pwd,fonction,service) => { 
    return new Promise((resolve, reject) => {
            var hash = bcrypt.hashSync(pwd, parseInt(process.env.ROUND));

        Med.create({ 
            username: user, 
            password:hash,
            fonction: fonction,
            service: service
               
        }, function (err, result) {
             if (err)  
                reject.log(err);
              else
                 resolve("create");
        });         
            
  }); 
         
};

var syncgetLog = () => { 
    return new Promise((resolve, reject) => {

        Log.
          find().
          select('id_pat id_med date').
          exec(function (err, utilisateurs) {
            if (err) reject(err);
            else
              resolve(utilisateurs);
          }); 
  }); 
         
};

var syncData = {
  adminLogin:syncAdminLogin,
  addMed:syncAddMed,
  getLog:syncgetLog
  //getPatData:syncgetPatData  
};


module.exports = {
  sync: syncData
};