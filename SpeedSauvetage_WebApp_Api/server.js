// server.js
// where your node app starts
// init project
var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
var jwt        = require("jsonwebtoken");
var mongoose   = require("mongoose");
var app        = express();
//Ppour eviter les injections dans mongodb
var sanitize = require('mongo-sanitize');
let middleware = require('./verifyToken');
const nunjucks = require("nunjucks");
nunjucks.configure('views', {
    express: app,
    autoescape: true,                 // automatic escaping
    noCache: false                   // cache templates from filesystem
});

//url de connection à la base de donné
var MONGODB_URI = 'mongodb+srv://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+'/'+process.env.DB;
// Nous connectons l'API à notre base de données
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//include du fichier de la base de donnée
var usersLog = require('./pat_login_collection').sync;
var admin = require('./admin_api').sync;
app.use(express.static('public'));
//app.use(express.static('views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, Accept,X-Requested-With,content-type, Authorization');
    next();
});


app.get('/', function (req, res,next) {
  res.send("yes");
});

app.get('/active/:activeToken', async function (req, res, next) {
    console.log("start")
    try{
      var dat= await usersLog.accountActivation(sanitize(req.params.activeToken));
      console.log(dat)
      res.json(dat);
    }
    catch(err){
      console.log(err)
      res.json({ success:false, message:"erreur"})
      
    }
  
   

});

app.post('/signIn',  async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var user= sanitize(req.body.email);
    var pwd= sanitize(req.body.password);
  console.log(req.body)
    try{
      var dat= await usersLog.Login(user,pwd);
      res.json(dat)
    }
    catch(err){
      res.json({ success:false, message:"erreur"})
    }
});

app.post('/signUp',  async function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  console.log(req.body)
    var login= sanitize(req.body.user);
    var pwd= sanitize(req.body.pwd);
    var nom= sanitize(req.body.nom);
    var prenom= sanitize(req.body.prenom);
    var sec_num= sanitize(req.body.sec_num);

    try{
        var dat= await usersLog.SignUp(nom,prenom,login,pwd,sec_num);
      console.log(dat)
        res.json(dat)
    }
    catch(err){
      console.log(err)
      res.json({ success:false, message:"erreur"})
    }
});

app.get('/getData',middleware, async function (req, res, next) {
   
   
  try{
      var dat= await usersLog.userDetail(req.userId);
      console.log(dat)
      res.json(dat);
    }
    catch(err){
      res.json({ success:false, message:"erreur"})
    }
  
   

});

app.post('/updateData',middleware, async function (req, res, next) {
    var nom= sanitize(req.body.nom);
    var prenom= sanitize(req.body.prenom);
    var sec_num= sanitize(req.body.sec_num); 
    var sexe= sanitize(req.body.sexe);
    var photo= sanitize(req.body.photo);
    var grp_sanguin= sanitize(req.body.grp_sanguin);
    var allergies= sanitize(req.body.allergies);
    var trait_en_cours= sanitize(req.body.trait_en_cours);
    var mld_declarer= sanitize(req.body.mld_declarer);
    var op_recent= sanitize(req.body.op_recent);
    var contact= sanitize(req.body.contact);
            
    try{
      var dat= await usersLog.update(req.userId,
                                     nom,
                                     prenom,
                                     sexe,
                                     sec_num,
                                     photo,
                                     grp_sanguin,
                                     allergies,
                                     trait_en_cours,
                                     mld_declarer,
                                     op_recent,
                                     contact  );
      res.json(dat);
    }
    catch(err){
      res.json({ success:false, message:"erreur"})
    }
  
   

});

app.get('/admin',  async function (req, res, next) {
  
    res.render('index.html');
 
});

app.post('/adminSubmit',  async function (req, res, next) {  
    var username= sanitize(req.body.user.name);
    var password= sanitize(req.body.user.pwd);
 
  console.log(req.param);
    try{    
      
      var dat= await admin.adminLogin(username,password);
      var list= await admin.getLog();

      //si mot de passe faut ou utilisateur non trouvé
      console.log(dat)
      if(dat==="Login")
          res.render('index.html',{ warning : 'Username ou mot de passe invalide !' });
      else if(dat==="yes")
          res.render('adminPage.html',{logs:list});

    }
    catch(err){
      res.json({ success:false, message:"erreur"}) 
    }           
});

app.post('/createUser',  async function (req, res, next) {  
    var username= sanitize(req.body.username);
    var password= sanitize(req.body.pwd);
    var fonction= sanitize(req.body.fonction);
    var service= sanitize(req.body.service);
  console.log(req.param);
    try{    
      
      var dat= await admin.addMed(username,password,fonction,service);
      var list= await admin.getLog();
      //si mot de passe faut ou utilisateur non trouvé
      console.log(dat)
      if(dat==="create")
          res.render('adminPage.html',{ warning : 'Utilisateur créer avec success !', logs:list });
      else if(dat==="yes")
          res.render('adminPage.html');

    }
    catch(err){
      res.json({ success:false, message:"erreur"})
    }      
});

    

     
// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});