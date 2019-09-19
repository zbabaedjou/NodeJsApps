/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console


/* Un tableau bidimensionnel en JavaScript 
   est un tableau de tableaux 
   (en jargon, on parle plutôt de "liste de listes")
*/
var turn=1;
var board = Array(7);

for (var i = 0 ; i < 7 ; i++) {
    board[i] = Array(10);
    for (var j = 0 ; j < 10 ; j++) {
        board[i][j] = 0;
    }
}


function set(row,column,player){
  if (player==1)
    board[row][column]=1;
    
  if (player==2)
    board[row][column]=2;

}

function render(){
  // Un objet representant la balise <div id="message">
  var div = document.querySelector('#message');

  // On commence par vider la balise
  div.innerHTML = '';

  var table = document.createElement("TABLE");
      table.setAttribute("id", "table");

  for(var i = 0 ; i < 7 ; i++){
    var ligne = document.createElement("TR");

    for(var j = 0 ; j < 6 ; j++){
      var cell = document.createElement("TD");     
      cell.dataset.column = j;
        
      if(board[i][j]==0)
        cell.className="empty";
      if(board[i][j]==1)
        cell.className="player1";
      if(board[i][j]==2)
        cell.className="player2";
     
      
      ligne.appendChild(cell);
    }
    table.appendChild(ligne);

  }
  div.appendChild(table);
  
  

}

function play(column){
  var check=-1;
  for( var i=6;i>=0;i--)
    if(board[i][column]==0){
      check=i;
      board[i][column]=turn;
      turn=turn%2+1;
      break;
    }
  
  render();
  if(check=-1) 
    return false;
  
  return check;         
}  

render();

var table=document.querySelector('#message');
table.addEventListener("click",function() {
  play(parseInt(event.target.dataset.column));
});

console.log(board);
