const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var mailer = require('./mailer');
var crypto = require('crypto');

//Define a schema
const Schema = mongoose.Schema;
let UserSchema = new Schema({
 login: {
  type: String,
   sparse: true,
  trim: true,  // permet de suprimer les espaces
 },
  id_pat: {
    type:String,
    sparse: true,
    trim: true,
  },
 password: {
  type: String,
  trim: true,
 },
  token : {
  type: String,
  trim: true
 },
  active : {
  type: Boolean,
  default: false
 },
  activeToken: String,
  activeExpires: Date,
  
  
}, { collection : 'pat_login_collection' });
var Patient_User = mongoose.model('User', UserSchema);

const PatCollectionSchema = new Schema({
    id_pat: {
        type: String,
        trim: true,  
    },
    prenoms: {
        type: String,
   },
    nom: {
        type: String,
        trim: true,  
    
   },
    sexe: {
        type: String,
        trim: true,  
       
   },
    sec_num: {
        type: Number,
        trim: true,  
   },
    photo: {
        type: String,
        trim: true,  
   },
    grp_Sanguin: {
        type: String,
        trim: true,
     
    },
    allergies: {
        type: String,
   
    },
    trait_en_cours: {
        type: String,
       
   },
    mld_declarer: {
        type: String,
        trim: true,  
     
    },
    op_recent: {
        type: String,
        trim: true,  
      
   },
    contact: {
        type: String,
        trim: true,  
    
    },

},{ collection : 'pat_collection' });     
var Patient_info_col = mongoose.model('pat_collection', PatCollectionSchema);

/****%  les functions ****/


    
// function de verification de comptes dans la base de données.

var syncLogin = (login,password) =>{
  
  return new Promise((resolve, reject) => {
    // verifier si username dans la base de donnée
    Patient_User.
      findOne().
      where('login').equals(login).
      select('id_pat password active'). //récupérer le mot de passe
      exec(function (err, utilisateur) {
      //s'il y  a une erreur
          if (err){ 
                reject(err);
          }
      //si l'utilisateur est retrouvé dans la base de donnée      
          else if(utilisateur){
              //si le compte est activé
              if(utilisateur.active=true){
                  // verifier le mot de passe
                  if(bcrypt.compareSync(password, utilisateur.password)) {
                      //création de token
                    //let token = jwt.encode(login, creation: Date.now(), userID: request.params.userId});

                    var token = jwt.sign({ id: utilisateur.id_pat }, process.env.SECRET, { expiresIn: 60 // expires in 1 hours
                    });
                //donnée envoyé si l'authentification est réussi
                resolve({ success: true, token: token });

                  }
                //si le mot de passe est faux
                  else{
                      resolve({ success: false, message: "noUser" });
                  }
              }

              //si le compte n'est pas activé
              else{
                  accountActivationMail(utilisateur.id_pat,login);
                  resolve({ success: false, message: "inactif" });
              }
          }
          else{
                resolve({ success: false, message: "noUser" });
          }
    })
  })
}



var syncSignUp = (nom, prenom,user,password,sec_number) => {
       //var hash = bcrypt.hashSync(password, 10);
       return new Promise((resolve, reject) => {
         console.log("start")
        //Chercher l'utilisateur dans la base de donnée
          Patient_User.
            findOne().
            where('login').equals(user).
            exec(function (err, utilisateur) {
              //s'il y  a une erreur
              if (err){ 
                       reject(err);
                      }
              //si l'utilisateur est retrouvé dans la base de donnée
              else if(utilisateur){
                resolve({ success:false, message:"userFound"});
              }
              else{
                    //Générer id_pat qui est le haché du num de sécurité sociale encardré a gauche par la prmière lettre du nom et a droite par les trois prmières lettres du premier prénoms
                    var id = bcrypt.hashSync(nom.charAt(0)+sec_number+prenom.charAt(0)+prenom.charAt(1)+prenom.charAt(3), parseInt(process.env.ROUND));
                    //hash du mot de passe
                    var hash = bcrypt.hashSync(password, parseInt(process.env.ROUND));

                  // Créer une entrée pour le patient dans les bases de login et de données du patient
                    Patient_User.create({ 
                         login: user, 
                         id_pat:id,
                         password:hash,
                         
                          }, function (err, result) {
                                if (err)  reject(err);
                                else{
                                  console.log("non trouver")
                                  Patient_info_col.create({ 
                                        id_pat: id,
                                        nom: nom, 
                                        prenoms: prenom, 
                                        sexe: "",
                                        sec_num: sec_number,
                                        photo:"",
                                        grp_sanguin: "",    
                                        allergies: "",   
                                        trait_en_cours: "",
                                        mld_declarer: "",
                                        op_recent: "",
                                        contact: ""
                                  }, function (err, result) {
                                      if (err)  reject(err);
                                      else{
                                        console.log("inserer")
                                        accountActivationMail(id,user);
                                        resolve({ success:true });
                                      }
                                  });               
                                }
                    });     

                } 

            }); 
  
        
    });        
};

//fonction d'envoie de mail de confirmation
var accountActivationMail=(id,login) => {
  
  // Generate 20 bit activation code, ‘crypto’ is nodejs built in package.
  crypto.randomBytes(20, function (err, buf) {
    
     // Ensure the activation code is unique.
     var activeToken = id+buf.toString('hex');
            
    // Set expiration time is 24 hours.
    var activeExpires = Date.now() + 24 * 3600 * 1000;
    var link = 'https://speedsauvweb.glitch.me/active/'+ activeToken;
    var updates = {$set: { activeToken: activeToken, activeExpires:activeExpires} };
    
    Patient_User.updateOne({id_pat: id}, updates, function(err,data) {
        if(data)
          // Sending activation email
            mailer.send({
                    to: login,
                    subject: 'Welcome to Speed Sauvetage',
                    html: 'Please click <a href="' + link + '"> here </a> to activate your account.'
            });
        });      
                
                
        })
}

var accountActivation=(activeToken) => {
   return new Promise((resolve, reject) => {
       // find the corresponding user
        Patient_User.findOne({
          activeToken: activeToken,
          // check if the expire time > the current time       
          activeExpires: {$gt: Date.now()}
          }, {login:1}, function (err, user) {
              if(err)
                reject(err)
                // invalid activation code
              else if (!user) {
                resolve({ success:false, message:"invalide"})     
                   //     content: 'Your activation link is invalid, please <a href="/account/signup">register</a> again'
              }
              else if(user){
                var updates = {$set: { active:true} };

                Patient_User.updateOne({login: user.login}, updates, function(err,data) {
                    if(err)
                      resolve({ success:false, message:"erreur"});
                    if(data){
                      console.log("activé")
                      resolve({ success:true})}
                }); 
              }
          });
     });
}

var updateDataMail=(id) => {
  
       // find the corresponding user
        Patient_User.findOne({
          id_pat: id
          }, {login:1}, function (err, user) {
              if(user)
                 mailer.send({
                    to: user.login,
                    subject: 'Speed Sauvetage',
                    html: 'Bonjour, Une mise a jour de vos données vient detre effectuée'
                 });
          });
  
}
            
var getAllData=(id) => {
   return new Promise((resolve, reject) => {
     console.log(typeof(id));
       // find the corresponding user
     Patient_info_col.
            findOne().
            where('id_pat').equals(id).
            select('id_pat nom prenoms sexe sec_num photo grp_sanguin allergies trait_en_cours mld_declarer op_recent contact'). //récupérer le mot de passe
            exec(function (err, user) {
                console.log(user)
              if(err)
                reject(err);
              else if(user)
                resolve({ success:true, message:user});
              else
                resolve({ success:false});

              
          });
     });
}         
                                       
var updateData=(id,p_nom,p_prenom,p_sexe,p_numSecu,p_photo,p_groupe_Sanguin,p_allergies,p_traitements_en_cours,p_mlds_declarer,p_operations_recentes,p_contact) => {
   return new Promise((resolve, reject) => {
       // find the corresponding user
       var updates = {$set: { nom:p_nom,
              prenoms:p_prenom,
              sexe:p_sexe,
              sec_num:p_numSecu,
              photo:p_photo,
              grp_sanguin:p_groupe_Sanguin,
              allergies:p_allergies,
              trait_en_cours:p_traitements_en_cours,
              mld_declarer:p_mlds_declarer,
              op_recent:p_operations_recentes,
              contact:p_contact} };
        Patient_info_col.updateOne({id_pat: id}, updates, function(err,data) {
          if(err)
            reject(err);
          else if(data){
            updateDataMail(id);
            resolve({success:true,message:data});
          }
        });
        
     });
} 

  


var syncUpdateUserData = (id,data) => { 
   
    return new Promise((resolve, reject) => {
      var updates = {$set: { statut: id } };
      Patient_info_col.updateOne({id_pat: id}, updates, function(err,data) {
        if(err)
          reject(err);
        else if(data)
          resolve("done");
      });
               
    });        
};
var syncUpdateUserPawd = (id,data) => { 
    var hash = bcrypt.hashSync(data, process.env.SECRET);
    return new Promise((resolve, reject) => {
      var updates = {$set: { password: hash } };
      Patient_User.updateOne({id_pat: id}, updates, function(err,data) {
        if(err)
          reject(err);
        else if(data)
          resolve("done");
      });
               
    });        
};


var syncUser = {
  Login:syncLogin,
  SignUp:syncSignUp,
  accountActivation:accountActivation,
  userDetail:getAllData,
  update:updateData
  
};


module.exports = {
  sync: syncUser
};
