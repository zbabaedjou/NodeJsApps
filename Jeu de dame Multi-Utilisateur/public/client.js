// client-side js
// run by the browser each time your view template is loaded
var ws = new WebSocket('wss://' + window.location.host);
const loginForm = document.getElementById('login');
const signUpForm= document.getElementById('signup');
const logout=document.getElementById('logout');
const info=document.getElementById('info');
const p = document.getElementById('info');
const nb = document.getElementById('nb');
var status = 'AVAILABLE';
const main = document.getElementById('main');
const $ = document.querySelector.bind(document);
const append = (node, type) => node.appendChild(document.createElement(type));
var maj=1;
var adversaire = null;
var turn = 1;
var permition = 0;
var row_f;
var column_f;
var row_s;
var column_s;
var color;
var choix;
var colores = document.createElement("SELECT");
var niveaux = document.createElement("SELECT");
var b= Array(10);
  for (var i = 0 ; i < 10 ; i++) {
    b[i] = Array(10);
  }
//var name;
ws.addEventListener('open', function(e) { 
    
    if (sessionStorage.getItem('username')) {
          maj=0;
          status = 'AVAILABLE';
      
          ws.send(JSON.stringify({ 
                  type: 'connected', 
                }));
      }
  
    ws.addEventListener('message', function(e) {
      const parsed = JSON.parse(e.data);
      
      switch (parsed.type) {
        
        case "userlist":  // Pour la mise à jour de la liste des utilisateurs 
         //console.log(status);
          //status=parsed.state; 
          
          for (var u of parsed.userlist) {
            //nb.innerHTML = 'YOU : '+sessionStorage.getItem('username');
            if(u.name==sessionStorage.getItem('username') & u.state =='AVAILABLE')
              status=u.state;
          }
          if (maj==0 && status == 'AVAILABLE') { 
           
              main.innerHTML = '';
              p.innerHTML='';
              const titre = append(main, 'titre');
              titre.textContent ="La liste des utilisateurs en ligne :";
              titre.className = 'titre';
              main.appendChild(createUserList(parsed.userlist));
              logout.style.display = "block";
             }  
        break;
        
        case 'challenge_demander': //si un chalenge est envoyé,  demander notification
            if (confirm(parsed.username+' aimerait vous challenger. Aceptez vous?')) { //si réponse = yes
              
              //
              createStart();
              adversaire=parsed.username;
              
             } 
            else {//si réponse = no
                 ws.send(JSON.stringify({ 
                    type: 'challenge_refuse', 
                    username: parsed.username,
                }));
             }
        break;
          
        case 'challenge':
            status = 'playing';
            main.innerHTML = '';
            color=parsed.color;
            p.innerHTML="Ton adversaire est : "+parsed.username+"<br/> T'a couleur c'est le : "+color;
            p.align="center";
            render(parsed.b);
            initial(parsed.b);
            adversaire=parsed.username;//conserve le nom de l'adversaire 
            permition=parsed.permition;
            const button = append(main, 'button');
            button.textContent = 'Quit';
            button.className = 'quit';
            logout.style.display = "none";

        break; 
        
        case 'move':
            status = 'playing';
            main.innerHTML = '';
            render(parsed.b);
            initial(parsed.b);
            permition=parsed.permition;
            const bss = append(main, 'button');
            bss.textContent = 'Quit';
            bss.className = 'quit';
            logout.style.display = "none";

        break; 
        
        case 'game_over':
          permition =0;
          adversaire = null;
          turn = 1;
            status = 'AVAILABLE';
          if(parsed.winer==sessionStorage.getItem('username'))
            p.innerHTML ='YOU WIN';
          else
            p.innerHTML ='GOOD LUCK NEXT TIME';
            main.innerHTML = '';
            alert('Game_over');
          
        break;  
         
        case 'alert':
           alert('It is not your turn!! ');
        break;
          
        case 'challenge_rejected':
            alert('The invite was rejected');
        break;
          
        case 'go_to_signup':
          main.innerHTML = '';
          createSignUp();  
        break; 
        
        case 'message_bd':
          info.innerHTML = parsed.msg;
        break; 
          
        case 'logged':
          if (!sessionStorage.getItem('username')) {
            sessionStorage.setItem('username', parsed.username);
          }   
          ws.send(JSON.stringify({ 
                    type: 'new_connection', 
                    username: sessionStorage.username,
                }));
          info.innerHTML='';
          maj = 0;
          
        break;

      }
      window.onbeforeunload = function() {
      main.innerHTML = '';
      main.appendChild(createUserList(parsed.userlist));
      }
    });
    
  
  /////ACTION APRES CLICK DE BOUTTON 
    loginForm.onsubmit = function(event) { //Lorsque le formulaire de login est soumis 
      event.preventDefault();   
      const username = loginForm.elements['username'];
      const password = loginForm.elements['password'];
       
        ws.send(JSON.stringify({ 
          type: 'login', 
          username: encodeURIComponent(username.value),
          password: encodeURIComponent(password.value)
        }));  

        username.value = '';
        username.focus();
    };
  
  
   ///**************Click on logout************/ 
  logout.onclick = function(event) {
      event.preventDefault();   
    
        ws.send(JSON.stringify({ 
          type: 'logout', 
          user: sessionStorage.getItem('username'),
         // adversaire:adversaire
        }));  
     sessionStorage.removeItem('username');
     //adversaire=null;
    location.reload();//rafraichir la page 
    maj=1;
    };
  
  
  main.addEventListener('click', (e) => { // Lorsqu'on choisi un utilisateur à challenger
    if(e.target.className == 'start'){
      
       var x = colores.value;
      var n = niveaux.value;
        ws.send(JSON.stringify({ 
                  type: 'challenge_accepte', 
                  username: adversaire,
                  color : x,
                  niveau : n,
                }));
       
       
       }
    else if (e.target.className == 'challenge') {
      ws.send(JSON.stringify({ // lancer un challenge
        type: 'challenge',
        username: e.target.dataset.username,
      }));
    } 
   else if (e.target.className == 'go_to_signup') {
     
     ws.send(JSON.stringify({ // lancer un challenge
        type: 'go_to_signup',
      }));
    } 
    else if (e.target.className == 'quit') {
      //status = 'AVAILABLE';
      //adversaire=null;
    //  console.log('tot');
      ws.send(JSON.stringify({ type: 'quit',
                               name: adversaire,
                               color:color,
                             }));
    
    } else if (e.target.tagName == "TD") {
      
          let tet=0;
        if(color=='white')
              tet=1;
            else tet=-1;
      if(permition ==1){
        if(turn ==1){
          
          //first clique
          row_f= parseInt(e.target.dataset.row);
          column_f = parseInt(e.target.dataset.column);
          
          turn=0;
          
          if(b[row_f][column_f].pion == tet ){//nb
          //  console.log(row_f);
            //console.log(column_f);
            b[row_f][column_f].selected = true;
            if(color=='white' && niveaux.value == 'BASIC') basic_w(column_f,row_f,b);
            if(color=='black' && niveaux.value == 'BASIC') basic_b(column_f,row_f,b);
            main.innerHTML = '';
            render(b);
            const button = append(main, 'button');
            button.textContent = 'Quit';
            button.className = 'quit';
            b[row_f][column_f].selected = false;
            for (var i = 0 ; i < 10 ; i++) {
                 for (var j = 0 ; j < 10 ; j++) {
                   b[i][j].help=0;
                 }
            }
           
          }
          else{
            turn=1;
            alert("il faut cliqué sur pion "+color);
          }
      }else{
         turn = 1;
        //seconde clique
        column_s = parseInt(e.target.dataset.column);
        row_s = parseInt(e.target.dataset.row);
        if(b[row_s][column_s].pion == tet){
          
        }
        else if(b[row_s][column_s].pion == 0){
          ws.send(JSON.stringify({ // lancer un challenge
            type: 'move',
            username: adversaire,
            a : column_s,
            b : row_s,
            pt :b[row_f][column_f],
            color :color,
          }));
         }else{
           turn = 0;
           alert("la cas doit etre vide");
        }
}
       }else
         alert("ce n'est pas ton tour ");
    }
     });
  });



// Create table from user list
const createUserList = (users) => {
  var list = document.createElement('TABLE');
 /* list.setAttribute("id", "list");*/
  list.border = '2';
  list.width = '60%';
  list.align = 'center';
  var row = document.createElement('TR');
  list.appendChild(row);
  
  append(row, 'TH').textContent = 'ONLINE PLAYERS'; 
  append(row, 'TH').textContent = 'Match Gagner'; 
  append(row, 'TH').textContent = 'Match Perdu'; 
  append(row, 'TH').textContent = 'Chalenged'; 
  
  for (var u of users) {
      var tr = document.createElement('TR');
    
    list.appendChild(tr);
    append(tr, 'TD').textContent = u.name; 
    append(tr, 'TD').textContent = u.gagner; 
    append(tr, 'TD').textContent = u.perdu; 
      const button = append(append(tr, 'TD'), 'button');
      button.textContent = 'Challenge';
      button.className = 'challenge';
      button.dataset.username = u.name;
      if (u.state != 'AVAILABLE' || u.name == sessionStorage.username)
        button.disabled = true;
    }
  return list;
}
const createStart = () => {
  
  main.innerHTML = '';
  //var name = document.createElement("p");
  
  var z = document.createElement("option");
  z.setAttribute("value", "white");
  var t = document.createTextNode("White");
  z.appendChild(t);
  
  var k = document.createElement("option");
  k.setAttribute("value", "black");
  var o = document.createTextNode("Black");
  k.appendChild(o);
  
  colores.appendChild(z);
  colores.appendChild(k);
  
  main.appendChild(colores);
  
  var z = document.createElement("option");
  z.setAttribute("value", "BASIC");
  var t = document.createTextNode("BASIC");
  z.appendChild(t);
  
  var k = document.createElement("option");
  k.setAttribute("value", "AVANCER");
  var o = document.createTextNode("AVENCER");
  k.appendChild(o);
  
  niveaux.appendChild(z);
  niveaux.appendChild(k);
  
  main.appendChild(niveaux);
  const bss = append(main, 'button');
   bss.textContent = 'Start';
   bss.className = 'start';
  main.appendChild(bss);
  }


const createSignUp = () => {
  
   const f = document.createElement("form");
  f.setAttribute('id',"signup");
  f.setAttribute('class',"container");
  
  const username = document.createElement("input"); //input element, text
  username.setAttribute('type',"text");
  username.setAttribute('name',"username");
  username.setAttribute('id',"username");
  username.setAttribute('placeholder',"Enter Username");
  username.required=true;
  
  const email = document.createElement("input");
   email.setAttribute('type',"email");
   email.setAttribute('name',"email");
   email.setAttribute('id',"email");
   email.setAttribute('placeholder',"Enter email");
  email.required=true;
  const password = document.createElement("input");
   password.setAttribute('type',"password");
   password.setAttribute('name',"password");
   password.setAttribute('id',"password");
   password.setAttribute('pattern',"*(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}+$"); 
   password.setAttribute('title',"Doit contenir au moins un nombre, une lettre majuscule et une lettre miniscule et doit faire au moins 8 caractères");
   password.setAttribute('placeholder',"Enter Password");
  password.required=true; 
      
  const passwordA = document.createElement("input");
   passwordA.setAttribute('type',"password");
   passwordA.setAttribute('name',"passwordA");
   passwordA.setAttribute('id',"passwordA");
   passwordA.setAttribute('placeholder',"Enter Password Again");
   passwordA.required=true;
  
  const s = document.createElement("input"); //input element, Submit button
  s.setAttribute('type',"submit");
  s.setAttribute('value',"Submit");
  passwordA.setAttribute('class',"signup");

   
  f.appendChild(username);
  f.appendChild(email);
  f.appendChild(password);
  f.appendChild(passwordA);
  f.appendChild(s);
  main.innerHTML = '';
  main.appendChild(f);
  
  
  //******Code pour Check la valeur de pasword
  
  var myInput = document.getElementById("password");
  var letter = document.getElementById("letter");
  var capital = document.getElementById("capital");
  var number = document.getElementById("number");
  var length = document.getElementById("length");

  // Quand l'utilisateur clique dans le champs mot de passe ,afficher le champe de message
  myInput.onfocus = function() {
    document.getElementById("message").style.display = "block";
  }

  // Quand l'utilisateur clique hors du champs du mot de passe, cacher la champs de message
  myInput.onblur = function() {
    document.getElementById("message").style.display = "none";
  }

  // Quand l'utilisateur commence à taper dans le champ mot de passe
  myInput.onkeyup = function() {
    // Valider lettres miniscules dans le password
    var lowerCaseLetters = /[a-z]/g;
    if(myInput.value.match(lowerCaseLetters)) {  
      letter.classList.remove("invalid");
      letter.classList.add("valid");
    } else {
      letter.classList.remove("valid");
      letter.classList.add("invalid");
    }

    // Valider une lettre Majuscule dasn le password
    var upperCaseLetters = /[A-Z]/g;
    if(myInput.value.match(upperCaseLetters)) {  
      capital.classList.remove("invalid");
      capital.classList.add("valid");
    } else {
      capital.classList.remove("valid");
      capital.classList.add("invalid");
    }

    // Valider l'existance d'un chiffre dans le mot de passe
    var numbers = /[0-9]/g;
    if(myInput.value.match(numbers)) {  
      number.classList.remove("invalid");
      number.classList.add("valid");
    } else {
      number.classList.remove("valid");
      number.classList.add("invalid");
    }

    // Valider la longueur du mot de passe
    if(myInput.value.length >= 8) {
      length.classList.remove("invalid");
      length.classList.add("valid");
    } else {
      length.classList.remove("valid");
      length.classList.add("invalid");
    }
  }

    /********************Fin code pour vérification password*******************/

    f.onsubmit = function(event) { //Lorsque le formulaire de login est soumis 
        event.preventDefault();   
        const username = f.elements['username'];
        const email = f.elements['email'];
        const password = f.elements['password'];
        const passwordA = f.elements['passwordA'];
        

         if(password.value===passwordA.value){
           info.innerHTML=""
            ws.send(JSON.stringify({ 
              type: 'signup', 
              username: encodeURIComponent(username.value),
              email: email.value,
              password: encodeURIComponent(password.value),
             // passwordA: passwordA.value
            }));  
         }else{
           info.innerHTML="Les mot de passes ne correspondent pas !"
         }
          username.value = '';
          email.value='';
          password.value='';
          passwordA.value='';
          username.focus();

      };

  

}
function basic_b(column,row,boards){
      if( 0<row && 0<column && boards[row-1][column-1].pion==0 ) boards[row-1][column-1].help=1;
      if( 0<row && column<9 && boards[row-1][column+1].pion==0 ) boards[row-1][column+1].help=1;
}
function basic_w(column,row,boards){
      if(row<9 && 1<=column && boards[row+1][column-1].pion==0) boards[row+1][column-1].help=1;
      if(boards[row+1][column+1].pion==0 && row<9 && column<9) boards[row+1][column+1].help=1;

  
}
function basic_dame(column,row,boards){

  
}
 

function render(board){
// var div = document.querySelector('#msg');
  var tab = document.createElement("TABLE");
  tab.setAttribute("id", "table");
  for (var i = 0 ; i < 10 ; i++) {
    var lign = document.createElement("TR");
    
    for (var j = 0 ; j < 10 ; j++) {
      var cell = document.createElement("TD");
      cell.dataset.column = j;
      cell.dataset.row = i;
     if(board[i][j].color == 1)
        cell.className = "white";
      if(board[i][j].color == 0)
        cell.className = "black";
       if(board[i][j].pion == 1)
        cell.className = "PION_W";
      if(board[i][j].pion == -1)
        cell.className = "PION_B";
      if(board[i][j].selected == true)
        cell.className = "shine";
      if(board[i][j].dame == true){
        if(board[i][j].pion == 1)
        cell.className = "dame_w";
      if(board[i][j].pion == -1)
        cell.className = "dame_b";
      }
      if(board[i][j].help != 0){
        cell.className = "help";
      }
      
       lign.appendChild(cell);
    }
    tab.appendChild(lign);
  }
  tab.align = 'center';
  main.appendChild(tab);
}

function initial(board){
  for (var i = 0 ; i < 10 ; i++) {
   for (var j = 0 ; j < 10 ; j++) {
     
        b[i][j] = board[i][j];
      }
  }
}