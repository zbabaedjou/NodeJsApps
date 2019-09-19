var http = require('http');
var ws = require('ws');
var mongoose = require('mongoose'); 
//var bodyParser = require('body-parser');
const express = require('express');
const app = express();

const User = require('./User').User;

var MONGODB_URI = 'mongodb+srv://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+'/'+process.env.DB;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const dataStore = require('./datastore').sync;

app.use(express.static('public'));

var connected_users={};
var game_instant={};
var game_niveaux={};
var server = http.createServer(app);
var wsserver = new ws.Server({ 
    server: server,
});
//app.use(bodyParser.json());
//var ad;//le nom de celui qui envoie l'invitation 
//var winer;
function noop() {}
/*
function initial(k,board){
  for (var i = 0 ; i < 10 ; i++) {
   for (var j = 0 ; j < 10 ; j++) {
     
        k[i][j] = board[i][j];
      }
  }
}
*/
wsserver.broadcast = function broadcast(data) {
  wsserver.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify({
          type: 'userlist',
          userlist: Object.values(data).map((u) => u.serialize()), 
      }));
    }
  });
};

//**************************************
// tmpcase=1;

class Case {
  constructor(color, pion,row,column) {
    this.color = color;
    this.pion = pion;
    this.row = row;
    this.column = column;
    this.selected=false;
    this.dame=false;
    this.help=0;
  }
}

var b=[[0,1,0,1,0,1,0,1,0,1],
       [1,0,1,0,1,0,1,0,1,0],
       [0,1,0,1,0,1,0,1,0,1],
       [1,0,1,0,1,0,1,0,1,0],
       [0,0,0,0,0,0,0,0,0,0],
       [0,0,0,0,0,0,0,0,0,0],
       [0,-1,0,-1,0,-1,0,-1,0,-1],
       [-1,0,-1,0,-1,0,-1,0,-1,0],
       [0,-1,0,-1,0,-1,0,-1,0,-1],
       [-1,0,-1,0,-1,0,-1,0,-1,0]];


//var turn = 1;
//var row_f;
//var column_f;

//var etat;
class Tab {
  constructor() {
  this.board = Array(10);
for (var i = 0 ; i < 10 ; i++) {
    this.board[i] = Array(10);
}
    
  var tmp=0;
for (var i = 0 ; i < 10 ; i++) {
   for (var j = 0 ; j < 10 ; j++) {
     // etat=new Case(tmp,b[i][j],i,j);
       // board[i][j] = etat;
     this.board[i][j] = new Case(tmp,b[i][j],i,j);
        if(tmp==1) tmp = 0;
               else tmp = 1;
    }
   if(tmp == 1) tmp = 0;
               else tmp = 1;
}
}
}

function win(boards){
var player_w = 0;//point dans une partie
var player_b = 0;//point dans une partie

  for (let i = 0 ; i < 10 ; i++) {
   for (let j = 0 ; j < 10 ; j++) {
      if(boards[i][j].pion == 1) player_w +=1;
      if(boards[i][j].pion == -1) player_b +=1;
     }
  }
  if(player_w == 0){
    return -1;
  }else
    if(player_b == 0) {
      return 1;
    }else
      return 0;
}

function play_W(column,row,i,boards){
  if(boards[row][column]!=i && boards[row][column].color!=0){
  if(boards[row][column].pion==0){
  if(i.dame){
    dame_move(i,row,column,-1,boards);
    
  }else{
    
    if(row==i.row+1 && (column==i.column+1 | column==i.column-1)){
    boards[row][column].pion=i.pion;
    boards[i.row][i.column].pion=0;
    //i.pion=0;
    
      }else{
        if(boards[i.row+1][i.column-1].pion== -1 && row==i.row+2 && column==i.column-2 ){
          
          boards[row][column].pion=i.pion;
          boards[i.row+1][i.column-1].pion= 0;
          boards[i.row][i.column].pion=0;
          //i.pion=0;
        }
        if(boards[i.row+1][i.column+1].pion== -1 && row==i.row+2 && column==i.column+2 ){
          
          boards[row][column].pion=i.pion;
          boards[i.row+1][i.column+1].pion= 0;
          boards[i.row][i.column].pion=0;
         // i.pion=0;
        }
      }
  }
  }else console.log("il y a pas de pion");
  }else console.log("toucher un autre pion ");
  
      dame(row,column,boards);
    
   }

function play_B(column,row,i,boards){
   if(boards[row][column]!=i && boards[row][column].color!=0){
   if(boards[row][column].pion==0){
   if(i.dame){
    dame_move(i,row,column,1,boards);
    
   }else{
       
      
    if(row==i.row-1 && (column==i.column+1 | column==i.column-1)){
    boards[row][column].pion=i.pion;
    boards[i.row][i.column].pion=0;
    //i.pion=0;
    
      }else{
        if(boards[i.row-1][i.column-1].pion== 1 && row==i.row-2 && column==i.column-2 ){
          
          boards[row][column].pion=i.pion;
          boards[i.row-1][i.column-1].pion= 0;
           boards[i.row][i.column].pion=0;
          //i.pion=0;
        }
        if(boards[i.row-1][i.column+1].pion== 1 && row==i.row-2 && column==i.column+2 ){
          
          boards[row][column].pion=i.pion;
          boards[i.row-1][i.column+1].pion= 0;
          boards[i.row][i.column].pion=0;
          //i.pion=0;
        }
      }
  }
  }else console.log("il y a pas de pion");
  }else console.log("toucher un autre pion ");
  dame(row,column,boards);

     
   }
 
function dame_move(i,row,column,t,boards){
  let position_r=Math.abs(i.row-row);
     let position_c=Math.abs(i.column-column);
     
    if(position_r == position_c){//possition correcte
      if(i.row< row){
        if(i.column< column){
            for (let k = i.row, j = i.column ; k < row ,j < column ; k++,j++) {
                   if(boards[k][j].pion== t && boards[k+1][j+1].pion== 0 ){
                      
                     boards[k][j].pion= 0;
                     
                  }
             }
        }else{
            for (let k = i.row ,j = i.column; k < row,j > column ; k++,j--) {
                   if(boards[k][j].pion== t && boards[k+1][j-1].pion== 0 ){
                      
                     boards[k][j].pion= 0;
                  }
               
             }
          
        }
      }else{
         if(i.column< column){
          for (let k = i.row, j = i.column ; k > row ,j < column ; k--,j++) {
                   if(boards[k][j].pion== t && boards[k-1][j+1].pion== 0 ){
                      
                     boards[k][j].pion= 0;
                  }
               
             }
          
        }else{
            for (let k = i.row, j = i.column ; k > row ,j > column ; k--,j--) {
                   if(boards[k][j].pion== t && boards[k-1][j-1].pion== 0 ){
                      
                     boards[k][j].pion= 0;
                  }
               
             }
          
        }   
      }
      
      boards[row][column].pion= i.pion;
      boards[row][column].dame= i.dame;
      boards[i.row][i.column].pion=0;
      //i.pion=0;
       
    }else console.log("possition non correcte");
  
}

function dame(row,column,boards){
  if(boards[row][column].row==0 && boards[row][column].pion==-1)
    boards[row][column].dame=true;
  if(boards[row][column].row==9 && boards[row][column].pion==1)
    boards[row][column].dame=true;
 
}


//********************************************


wsserver.on('connection',  function(wsconn) {
  
    var thisUser=null;
      
    wsconn.on('message', async function(data) {
      
      const parsed = JSON.parse(data);
      
      switch (parsed.type) {
        
        case 'new_connection':
          //connected_users={};
//game_instant={};
//game_niveaux={};
            const name = parsed.username;
            var us;
            try{
              us= await dataStore.getUser(name);
              
            }
            catch(err){
              console.log(""+err)
            }
            thisUser = new User(name,wsconn,us.gagner,us.perdu);//pour chaque nom  connecté créer un user et l'ajouter a connected
            connected_users[name] = thisUser;
          //console.log(thisUser.state);
            wsserver.broadcast(connected_users);

        break;
        case 'connected':
            
            wsserver.broadcast(connected_users);
          
        break;
        case 'challenge':
          
            const adver = connected_users[parsed.username];
            //si l'adverssaire est libre
            if (adver && thisUser.invitation(adver)) {   
              adver.wsconn.send(JSON.stringify({// on envoie une demande a l'aversaire
                type: 'challenge_demander',
                username: thisUser.name,
              }));
              wsserver.broadcast(connected_users);  //mettre à jour la liste des utilisateurs libre
           
            } else {
              // We send back an error
              thisUser.setToAvaible(adver);
              wsconn.send(JSON.stringify({
                type: 'challenge_rejected',
                username: parsed.username,
              }));
              wsserver.broadcast(connected_users); 
            }
        break;
        
        case 'challenge_accepte':
          
          //initial(board);
            //const advers = connected_users[parsed.username];//advers=celui qui envoie la demande de chalalenge
            //ad=advers.name;
          thisUser.invitation_accepter(connected_users[parsed.username]);
          var c;
          var l;
            if(parsed.color=='white'){
              c='black';
              l=0;
             // game_instant[advers.name]=board;
              game_instant[parsed.username]=new Tab();
              game_niveaux[parsed.username]=parsed.niveau;
              
              connected_users[parsed.username].wsconn.send(JSON.stringify({
              type: 'challenge',
              username: thisUser.name,
              b : game_instant[parsed.username].board,
              color: c,
              permition: l,
            }));
            wsconn.send(JSON.stringify({
               type: 'challenge',
               username: parsed.username,
               b : game_instant[parsed.username].board,
               color: parsed.color,
               permition:l+1%2,
            }));
            } 
          else{
            c='white';
            l=1;
            
            //game_instant[thisUser.name]=board;
            game_instant[thisUser.name]=new Tab();
            game_niveaux[thisUser.name]=parsed.niveau;
             connected_users[parsed.username].wsconn.send(JSON.stringify({
              type: 'challenge',
              username: thisUser.name,
              b : game_instant[thisUser.name].board,
              color: c,
              permition: l,
            }));
            wsconn.send(JSON.stringify({
               type: 'challenge',
               username: parsed.username,
               b : game_instant[thisUser.name].board,
               color: parsed.color,
               permition:l+1%2,
            }));
            
          } 
            
            wsserver.broadcast(connected_users); 
        break;
          
        case 'move':
          
          //const pplayer = connected_users[parsed.username];
         
          let e;
          if(parsed.color=='white')
              e = win(game_instant[parsed.username].board);
          else
              e = win(game_instant[thisUser.name].board);
          if(e==0){
              
            if(parsed.color=='white'){  
              play_W(parsed.a,parsed.b,parsed.pt,game_instant[parsed.username].board);
              connected_users[parsed.username].wsconn.send(JSON.stringify({
                  type: 'move',
                  username: thisUser.name,
                  b : game_instant[parsed.username].board,
                  permition:1,
              }));
          
              wsconn.send(JSON.stringify({
                  type: 'move',
                  username: parsed.username,
                  b : game_instant[parsed.username].board,
                  permition:0,
              }));
             
            }else{
              if(parsed.color=='black'){ 
               play_B(parseInt(parsed.a),parseInt(parsed.b),parsed.pt,game_instant[thisUser.name].board);
               
               connected_users[parsed.username].wsconn.send(JSON.stringify({
                  type: 'move',
                  username: thisUser.name,
                  b : game_instant[thisUser.name].board,
                  permition:1,
              }));
          
              wsconn.send(JSON.stringify({
                  type: 'move',
                  username: parsed.username,
                  b : game_instant[thisUser.name].board,
                  permition:0,
              })); 
             
              } 
            }
          }else{//quelqu'un a gagner
            if(parsed.color=='white')
              e = win(game_instant[parsed.username].board);
          else
              e = win(game_instant[thisUser.name].board);
            if(e!=0){
            let winer;
             if(e==-1) {
               if(parsed.color=='black'){
                 winer=thisUser.name;
                 
                delete game_instant[thisUser.name];
                 thisUser.gagnant();
                 connected_users[parsed.username].perdant();
               }
               else{
                 winer= parsed.username;
                 delete game_instant[parsed.username];
                 thisUser.perdant();
                 connected_users[parsed.username].gagnant();
               }
             
             }
            
            connected_users[parsed.username].wsconn.send(JSON.stringify({
                type: 'game_over',
                username: thisUser.name,
                winer:winer,
              }));
              wsconn.send(JSON.stringify({
                type: 'game_over',
                username: parsed.username,
                winer: winer,
              }));
            }
            
          thisUser.setToAvaible(adver);
          }
          wsserver.broadcast(connected_users); 
            
        break;
        
        case 'challenge_refuse':
           let play = connected_users[parsed.username];
          thisUser.invitation_rejeter(play);
            play.send(JSON.stringify({
                type: 'challenge_rejected',
                username: parsed.username,
              }));
            break;
        
        case 'go_to_signup':
          wsconn.send(JSON.stringify({
              type: 'go_to_signup',
          }));
        break;
        
        case 'signup':
          try{
            var add=await dataStore.addUser(parsed.username,parsed.email,parsed.password);
            if(add==="used"){
              wsconn.send(JSON.stringify({ 
                  type: 'message_bd',
                  msg: 'Login déjà utilisé !'
              }));}
            else if(add==="ok")
              wsconn.send(JSON.stringify({
                  type: 'logged',
                  username:parsed.username
              }));
            
          }catch(err){
            console.log(""+err);
          }
        break;
        
        case 'login':
          try{           
              var log= await dataStore.login(parsed.username,parsed.password);
            
              if(log==="no"){
              wsconn.send(JSON.stringify({
                  type: 'message_bd',
                  msg: 'Login ou Mot de Passe Incorrect !',
              }));}
            else if(log==="ok")
              wsconn.send(JSON.stringify({
                  type: 'logged',
                  username:parsed.username
              }));
          }catch(e){
            console.log(""+e)
          }
          
        break;  
        
        case 'logout' :
            delete connected_users[thisUser.name];
            wsserver.broadcast(connected_users); 
        break;
          
        case 'quit' :
          
        let play1 = connected_users[parsed.name];
         if(parsed.color=='white'){
                delete game_instant[parsed.name];
               delete game_niveaux[parsed.name];
               }
               else{
                 delete game_instant[thisUser.name];
                 delete game_niveaux[thisUser.name];
               }
          
                 thisUser.perdant();
                 play1.gagnant();
                 thisUser.quits(play1);
         // console.log(thisUser.state);
          //console.log(play1.state);
          wsserver.broadcast(connected_users); 
        break;
          

      }
    });
    // etc...
});




// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/views/index.html');
});
// listen for requests :)
const listener = server.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

