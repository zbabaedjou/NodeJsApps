// server.js
// where your node app starts
// init project
var mongoose = require('mongoose');
const express = require('express');
const app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
//Ppour eviter les injections dans mongodb
var sanitize = require('mongo-sanitize');

//pour autoriser l'access à toute source
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//url de connection à la base de donné
var MONGODB_URI = 'mongodb+srv://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+'/'+process.env.DB;
// Nous connectons l'API à notre base de données
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//include du fichier de la base de donnée
const data = require('./datastore').sync;
app.use(express.static('public'));


app.post('/retrieve', async function (req, res) {

    // Retrieve the tag from our URL path
  try{ 
    //récupération des données des paramettres
    //sanitize permet de vérifier et d'éliminer les "$" qu'il y a dan sles entréé pou réviter les injections
    var user= sanitize(req.body.user);
    var pwd= sanitize(req.body.pwd);
    var id= sanitize(req.body.id);
    //appelle à la fonction d'accès a la base de donné
    var dat = await data.getPatData(user,pwd,id); 
    res.json(dat);
  }
  catch(err){
    console.log(err)
  }
   
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
