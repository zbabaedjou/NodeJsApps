var mongoose = require('mongoose'); //include de mongoose: Module qui permet d'interragir avec un base mongodb
var bcrypt = require('bcrypt'); //include de Bcrypt: Module utilisé pour le hashage des mot de passe
//var hash = bcrypt.hashSync(password, 10);

var Schema = mongoose.Schema;

//Schema de la collection Patient
var Patient_Schema = mongoose.Schema({
    id_pat: { type: String}, 
    nom: { type: String}, 
    prenoms: { type: String}, 
    sexe: String,
    photo: String,
    sec_num: { type: String },
    grp_sanguin: String,    
    allergies: String,   
    trait_en_cours: String,
    mld_declarer: String,
    op_recent: String,
    contact: String
  
}, { collection : 'pat_collection' });     
var Patient = mongoose.model('pat_collection', Patient_Schema);

//Schema de la collection Log
var Log_Schema = mongoose.Schema({
    id_med: { type: Number, required: true }, 
    date: { type: Date,required:true}, 
    id_pat: { type: String, required: true }
   
}, { collection : 'log_collection' }); 
var Log = mongoose.model('log_collection', Log_Schema);

//Schema de la collection Medecin
var Med_Schema = mongoose.Schema({
    id_med: { type: Number, required: true },
    username: { type: String, required: true }, 
    password: { type: String,required:true}, 
    fonction: { type: String, required: true },
    service: { type: String, required: true }

}, { collection : 'med_collection' }); 
var Med = mongoose.model('med_collection', Med_Schema);


var syncgetPatData = (username,password,qrcodeData) => {
       //var hash = bcrypt.hashSync(password, 10);
       return new Promise((resolve, reject) => {
        //Chercher l'utilisateur dans la base de donnée
        Med.
          findOne().
          where('username').equals(username).
          select('id_med password'). //récupérer le mot de passe
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
             
                    Patient.
                      findOne().
                      where('id_pat').equals(qrcodeData).
                      select('nom prenoms sexe sec_num photo grp_sanguin allergies trait_en_cours mld_declarer op_recent contact').
                      exec(function (err, data) {
                        if (err) reject(err);
                        //s'il y a de donnée retournée
                        else if(data){
                          //ajouter un log pour signaler l'accès aux données
                          syncAddLog(utilisateur.id_med,qrcodeData);       
                          //création du schema à retourner
                          var return_data = {
                              nom: data.nom,
                              prenoms: data.prenoms,
                              sexe: data.sexe,
                              photo: data.photo,
                              numero_ss: data.sec_num,
                              groupe_sgn: data.grp_sanguin,
                              allergi: data.allergies,
                              traitememt_en_cours:data.trait_en_cours,
                              operation_rcnt: data.op_recent,
                              maladies_dclr: data.mld_declarer,
                              num_urgence: data.contact
                  
                          };
                          
                          resolve(return_data);
                        }
                        else
                          resolve("noPat");
                      }); 


                } 
                //si les mot de passes ne correspondent pas
                else {
                   resolve("Login");
                }

            } 
            //s'il n'y a pas d'erreur et que l'utilisateur n'est pas retrouvé dans la base
            else{
              resolve("noMed");
            }
           
          }); 
  
        
    });        
};
var syncAddLog = (m_id,uid) => { 
   
             Log.create({ 
                     id_med: m_id, 
                     id_pat:uid,
                     date:new Date().toString() 
               
                      }, function (err, result) {
              if (err)  
                console.log(err);
             
        });         
            
  
         
};

var syncData = {
  getPatData:syncgetPatData  
};


module.exports = {
  sync: syncData
};