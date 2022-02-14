const socket = io('https://blokusapp.herokuapp.com');

var c = document.getElementById("gamecanvas");
var ctx = c.getContext("2d");

var grid = [];
const pieces = [[[2, 0], [1, 0], [0, 0], [-1, 0], [2, 1]],
              [[-1, 0], [0, 0], [1, 0], [2, 0], [0, 1]],
              [[1, 1], [0, 1], [0, 0], [-1, 0], [-2, 0]],
              [[1, -1], [0, -1], [0, 0], [0, 1], [1, 1]],
              [[0, -2], [0, -1], [0, 0], [1, 0], [2, 0]],
              [[-1, -1], [0, -1], [0, 0], [0, 1], [1, 1]],
              [[0, 1], [0, -1], [0, 0], [-1, 0], [1, 0]],
              [[-1, 0], [0, 0], [1, 0], [0, 1], [0, 2]],
              [[-1, -1], [-1, 0], [0, 0], [0, 1], [1, 1]],
              [[-1, -1], [-1, 0], [0, -1], [0, 0], [0, 1]],
              [[0, -1], [1, -1], [-1, 0], [0, 0], [0, 1]],
              [[-1, 0], [0, 0], [0, 1], [1, 1]],
              [[-2, 0], [-1, 0], [0, 0], [0, 1]],
              [[-1, 0], [0, 0], [1, 0], [0, 1]],
              [[0, 0], [1, 0], [0, 1], [1, 1]],
              [[0, 0], [1, 0], [0, 1]],
              [[0, -2], [0, -1], [0, 0], [0, 1], [0, 2]],
              [[0, -2], [0, -1], [0, 0], [0, 1]],
              [[0, -1], [0, 0], [0, 1]],
              [[0, 0], [0, -1]],
              [[0, 0]]
            ];

const corners = [[[3, -1], [3, 2], [1, 2], [-2, -1], [-2, 1]],
                [[-2, -1], [-2, 1], [-1, 2], [1, 2], [3, 1], [3, -1]],
                [[2, 0], [2, 2], [-1, 2], [-3, 1], [-3, -1], [1, -1]],
                [[2, -2], [2, 0], [2, 2], [-1, 2], [-1, -2]],
                [[-1, -3], [1, -3], [3, 1], [3, -1], [-1, 1]],
                [[-2, -2], [1, -2], [2, 0], [2, 2], [-1, 2], [-2, 0]],
                [[-1, -2], [1, -2], [2, 1], [2, -1], [1, 2], [-1, 2], [-2, -1], [-2, 1]],
                [[-2, -1], [2, -1], [2, 1], [1, 3], [-1, 3], [-2, 1]],
                [[-2, -2], [0, -2], [1, -1], [2, 0], [2, 2], [-1, 2], [-2, 1]],
                [[-2, -2], [1, -2], [1, 2], [-1, 2], [-2, 1]],
                [[-1, -2], [2, -2], [2, 0], [1, 2], [-1, 2], [-2, 1], [-2, -1]],
                [[-2, -1], [1, -1], [2, 0], [2, 2], [-1, 2], [-2, 1]],
                [[-3, -1], [1, -1], [1, 2], [-1, 2], [-3, 1]],
                [[-2, -1], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1]],
                [[-1, -1], [2, -1], [2, 2], [-1, 2]],
                [[-1, -1], [2, -1], [2, 1], [1, 2], [-1, 2]],
                [[-1, -3], [1, -3], [1, 3], [-1, 3]],
                [[-1, -3], [1, -3], [1, 2], [-1, 2]],
                [[-1, -2], [1, -2], [1, 2], [-1, 2]],
                [[-1, -2], [1, -2], [1, 1], [-1, 1]],
                [[-1, -1], [1, -1], [1, 1], [-1, 1]]
              ];
var activepiece = 0;
var placementorder = {
  red: [],
  green: [],
  blue: [],
  yellow: []
};

var piecehistory = {
  red: {},
  green: {},
  blue: {},
  yellow: {}
};

// Pelaajan valitsema väri
var piececolor = "#e03333";
var currentcolor = "red";
const rotation = [[0,1,1,1], [1,0,-1,1], [0,1,-1,-1], [1,0,1,-1]];
var currentrot = 0;
var flip = 1;
// Täytyy tehdä koska tämä törppö kieli ei anna mahdollisuutta selvittää kursorin sijaintia
var previousmouse = [0, 0];
var moveorder = [];
var whoseturn;
var myname;
var sides = [undefined, undefined, undefined, undefined];
var colors = ["Red", "Green", "Blue", "Yellow"];
const gamesound = new Audio("sound.wav");

// Serverin koodit tässä

socket.on('connect', data => {
	socket.emit('join', 'player on server');
});

// Kun yhdistetään ensimmäisen kerran serverille
socket.on('initdata', data => {
  if (data[0]) {
    grid = data[0];
  }
  if (data[1]) {
    placementorder = data[1];
  }
  if (data[2]) {
    piecehistory = data[2];
  }
  if (data[3]) {
    moveorder = data[3];
  }
  if (data[4]) {
    whoseturn = data[4];
  }
  if (data[5]) {
    sides = data[5];
  }
  gameupdate(previousmouse[0], previousmouse[1]);
  drawmenupieces();
  sideselected();
})

// Kun serveri tekee päivityksen
socket.on('serverdata', data => {
  grid = data[0];
  placementorder = data[1];
  piecehistory = data[2];
  moveorder = data[3];
  whoseturn = data[4];
  gameupdate(previousmouse[0], previousmouse[1]);
  drawmenupieces();
  gamesound.play();
})

socket.on('serversides', data => {
  sides = data;
  sideselected();
})

// Kun resetoidaan peli
socket.on('resetdata', data => {
  reset();
})

function reset() {
  activepiece = 0;
  placementorder = {
    red: [],
    green: [],
    blue: [],
    yellow: []
  };
  
  piecehistory = {
    red: {},
    green: {},
    blue: {},
    yellow: {}
  };
  currentrot = 0;
  flip = 1;
  previousmouse = [0, 0];
  moveorder = [];
  whoseturn = undefined;
  grid = [];
  sides = [undefined, undefined, undefined, undefined];
  sideselected();

  for (var i=0; i < pieces.length; i++) {
    document.getElementById("piece" + (i + 1)).style.visibility = 'visible';
  }

  for (var x=0; x < 20; x++) {
    grid[x] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  document.getElementById("redb").style.animation = "none"
  document.getElementById("greenb").style.animation = "none"
  document.getElementById("blueb").style.animation = "none"
  document.getElementById("yellowb").style.animation = "none"

  gameupdate(previousmouse[0], previousmouse[1]);
}


// Piirtää laudan ruudun (x ja y ovat koordinaattimuodossa eli x,y välillä [50, 850])
function draw(x, y) {
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(x, y, 39, 39);
  ctx.stroke();


}

function drawmenupiece(x, y, ref) {
  ref.beginPath();
  ref.rect(x, y, 19, 19);
  ref.stroke();
  ref.fillStyle = piececolor;
  ref.fill();


}

function initialize() {

  for (var x=0; x < 20; x++) {
    grid[x] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  for (var i=0; i < grid.length; i++) {
    for (var j=0; j < grid.length; j++) {
      draw(j*40, i*40);
    }
  }

  // Tekee laudan reunoista särmemmän
  ctx.rect(1,1,799,799);
  ctx.linewidth = 2;
  ctx.stroke();

  // Piirtää menubarin palaset
  for (var k=0; k < 21; k++) {
    var can = document.createElement("canvas");
    can.id = "piece" + (k+1);
    can.className = "piececlass";
    can.width = 100;
    can.height = 100;
    document.getElementById("pieces").appendChild(can);
  }
  drawmenupieces();

  myname = prompt("Enter your name:");

}

  // Tarkistetaan onko palikka laudan rajojen sisäpuolella
function pieceonboard(x, y) {
  var count = 0;
  for (var k=0; k < pieces[activepiece].length; k++) {
    if (drawstartpoint(x, k, 0) >= 0 && drawstartpoint(x, k, 0) < 800 && drawstartpoint(y, k, 1) >= 0 && drawstartpoint(y, k, 1) < 800) {
      count++;
    }
  }
  if (count === pieces[activepiece].length) {
    return true;
  } else {
    return false;
  }
}

// Piirtää valikon palikat
function drawmenupieces() {
  var c1 = document.getElementById("piece1").getContext("2d");
  drawmenupiece(10, 30, c1);
  drawmenupiece(30, 30, c1);
  drawmenupiece(50, 30, c1);
  drawmenupiece(70, 30, c1);
  drawmenupiece(70, 50, c1);

  var c2 = document.getElementById("piece2").getContext("2d");
  drawmenupiece(10, 30, c2);
  drawmenupiece(30, 30, c2);
  drawmenupiece(50, 30, c2);
  drawmenupiece(70, 30, c2);
  drawmenupiece(30, 50, c2);

  var c3 = document.getElementById("piece3").getContext("2d");
  drawmenupiece(10, 30, c3);
  drawmenupiece(30, 30, c3);
  drawmenupiece(50, 30, c3);
  drawmenupiece(50, 50, c3);
  drawmenupiece(70, 50, c3);

  var c4 = document.getElementById("piece4").getContext("2d");
  drawmenupiece(30, 20, c4);
  drawmenupiece(30, 40, c4);
  drawmenupiece(30, 60, c4);
  drawmenupiece(50, 60, c4);
  drawmenupiece(50, 20, c4);

  var c5 = document.getElementById("piece5").getContext("2d");
  drawmenupiece(20, 20, c5);
  drawmenupiece(20, 40, c5);
  drawmenupiece(20, 60, c5);
  drawmenupiece(40, 60, c5);
  drawmenupiece(60, 60, c5);

  var c6 = document.getElementById("piece6").getContext("2d");
  drawmenupiece(20, 20, c6);
  drawmenupiece(40, 20, c6);
  drawmenupiece(40, 40, c6);
  drawmenupiece(40, 60, c6);
  drawmenupiece(60, 60, c6);

  var c7 = document.getElementById("piece7").getContext("2d");
  drawmenupiece(40, 20, c7);
  drawmenupiece(40, 40, c7);
  drawmenupiece(40, 60, c7);
  drawmenupiece(20, 40, c7);
  drawmenupiece(60, 40, c7);

  var c8 = document.getElementById("piece8").getContext("2d");
  drawmenupiece(20, 20, c8);
  drawmenupiece(40, 20, c8);
  drawmenupiece(60, 20, c8);
  drawmenupiece(40, 40, c8);
  drawmenupiece(40, 60, c8);

  var c9 = document.getElementById("piece9").getContext("2d");
  drawmenupiece(20, 20, c9);
  drawmenupiece(20, 40, c9);
  drawmenupiece(40, 40, c9);
  drawmenupiece(40, 60, c9);
  drawmenupiece(60, 60, c9);

  var c10 = document.getElementById("piece10").getContext("2d");
  drawmenupiece(30, 20, c10);
  drawmenupiece(50, 20, c10);
  drawmenupiece(30, 40, c10);
  drawmenupiece(50, 40, c10);
  drawmenupiece(50, 60, c10);

  var c11 = document.getElementById("piece11").getContext("2d");
  drawmenupiece(40, 20, c11);
  drawmenupiece(60, 20, c11);
  drawmenupiece(20, 40, c11);
  drawmenupiece(40, 40, c11);
  drawmenupiece(40, 60, c11);

  var c12 = document.getElementById("piece12").getContext("2d");
  drawmenupiece(20, 30, c12);
  drawmenupiece(40, 30, c12);
  drawmenupiece(40, 50, c12);
  drawmenupiece(60, 50, c12);

  var c13 = document.getElementById("piece13").getContext("2d");
  drawmenupiece(20, 30, c13);
  drawmenupiece(40, 30, c13);
  drawmenupiece(60, 30, c13);
  drawmenupiece(60, 50, c13);

  var c14 = document.getElementById("piece14").getContext("2d");
  drawmenupiece(20, 30, c14);
  drawmenupiece(40, 30, c14);
  drawmenupiece(60, 30, c14);
  drawmenupiece(40, 50, c14);

  var c15 = document.getElementById("piece15").getContext("2d");
  drawmenupiece(30, 30, c15);
  drawmenupiece(30, 50, c15);
  drawmenupiece(50, 30, c15);
  drawmenupiece(50, 50, c15);

  var c16 = document.getElementById("piece16").getContext("2d");
  drawmenupiece(30, 30, c16);
  drawmenupiece(30, 50, c16);
  drawmenupiece(50, 30, c16);

  var c17 = document.getElementById("piece17").getContext("2d");
  drawmenupiece(40, 1, c17);
  drawmenupiece(40, 20, c17);
  drawmenupiece(40, 40, c17);
  drawmenupiece(40, 60, c17);
  drawmenupiece(40, 80, c17);

  var c18 = document.getElementById("piece18").getContext("2d");
  drawmenupiece(40, 10, c18);
  drawmenupiece(40, 30, c18);
  drawmenupiece(40, 50, c18);
  drawmenupiece(40, 70, c18);

  var c19 = document.getElementById("piece19").getContext("2d");
  drawmenupiece(40, 20, c19);
  drawmenupiece(40, 40, c19);
  drawmenupiece(40, 60, c19);

  var c20 = document.getElementById("piece20").getContext("2d");
  drawmenupiece(40, 30, c20);
  drawmenupiece(40, 50, c20);

  var c21 = document.getElementById("piece21").getContext("2d");
  drawmenupiece(40, 40, c21);

  for (var i=0; i < pieces.length; i++) {
    if (placementorder[currentcolor].includes(i)) {
      document.getElementById("piece" + (i + 1)).style.visibility = 'hidden';
    } else {
      document.getElementById("piece" + (i + 1)).style.visibility = 'visible';
    }
  }

}

function gameupdate(x, y) {
  ctx.clearRect(0, 0, 800, 800);

  // Piirtää grid-arrayn perusteella pelilaudan
  for (var i=0; i < grid.length; i++) {
    for (var j=0; j < grid.length; j++) {
      draw(j*40, i*40);

      // Jos laudalla on tässä kohtaa palanen, väritetään se
      if (typeof(grid[i][j]) === "string") {
        ctx.fillStyle = grid[i][j];
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  // Piirtää liikuteltavan palikan palaset (activepiece = -1 kun uusi palanen on juuri
  // asetettu eikä uutta ole vielä valittu)
  if (activepiece !== -1 && pieceonboard(x, y)) {
    for (var k=0; k < pieces[activepiece].length; k++) {
      draw(drawstartpoint(x, k, 0), drawstartpoint(y, k, 1));
      ctx.fillStyle = piececolor;
      ctx.fill();
    }
  }
  // Tekee laudan reunoista särmemmän
  ctx.rect(1,1,799,799);
  ctx.linewidth = 2;
  ctx.stroke();

  // Korostaa vuorossa olevan pelaajan menuvalikon nappulan
  if (whoseturn) {
    document.getElementById(whoseturn + "b").style.animation = `glowing${whoseturn} 1200ms infinite`;
    document.getElementById(moveorder[(moveorder.indexOf(whoseturn) + 3) % 4] + "b").style.animation = "none";
  }

}

// Laskee mistä koordinaateista aletaan piirtämään
// c=cursor, k=koordinaatti (eli piece-arraysta onko x vaiko y)
function drawstartpoint(c, i, k) {
  return (k === 0) ? (Math.floor((c-50)/40) + pieces[activepiece][i][rotation[currentrot][k]]*rotation[currentrot][k+2])*40 : (Math.floor((c-50)/40) + pieces[activepiece][i][rotation[currentrot][k]]*rotation[currentrot][k+2]*flip)*40;
}

function positionavailable() {
  for (var k=0; k < pieces[activepiece].length; k++) {
    var i = Math.floor((previousmouse[0]-50)/40) + pieces[activepiece][k][rotation[currentrot][0]]*rotation[currentrot][2];
    var j = Math.floor((previousmouse[1]-50)/40) + pieces[activepiece][k][rotation[currentrot][1]]*rotation[currentrot][3]*flip;
    if (grid[j][i] !== 0) {
      return false;
    }
  }
  return true;
}

function legalmove() {
  if (placementorder[currentcolor].length === 0) {
    for (var x=0; x < pieces[activepiece].length; x++) {
      var i = Math.floor((previousmouse[0]-50)/40) + pieces[activepiece][x][rotation[currentrot][0]]*rotation[currentrot][2];
      var j = Math.floor((previousmouse[1]-50)/40) + pieces[activepiece][x][rotation[currentrot][1]]*rotation[currentrot][3]*flip;
      if ((i === 0 || i === 19) && (j === 0 || j === 19)) {
        return true;
      }
    }
  } else {
    for (var y=0; y < pieces[activepiece].length; y++) {
      var i = Math.floor((previousmouse[0]-50)/40) + pieces[activepiece][y][rotation[currentrot][0]]*rotation[currentrot][2];
      var j = Math.floor((previousmouse[1]-50)/40) + pieces[activepiece][y][rotation[currentrot][1]]*rotation[currentrot][3]*flip;
      console.log(j, i);
      if (j === 0) {
        if (grid[j][i-1] === piececolor || grid[j+1][i] === piececolor || grid[j][i+1] === piececolor) {
          return false;
        }
      } else if (j === 19) {
        if (grid[j][i-1] === piececolor || grid[j][i+1] === piececolor || grid[j-1][i] === piececolor) {
          return false;
        }
      } else if (i === 0) {
        if (grid[j+1][i] === piececolor || grid[j][i+1] === piececolor || grid[j-1][i] === piececolor) {
          return false;
        }
      } else if (i === 19) {
        if (grid[j][i-1] === piececolor || grid[j+1][i] === piececolor || grid[j-1][i] === piececolor) {
          return false;
        }
      } else {
        if (grid[j][i-1] === piececolor || grid[j+1][i] === piececolor || grid[j][i+1] === piececolor || grid[j-1][i] === piececolor) {
          return false;
        }
      }
    }

    for (var k=0; k < corners[activepiece].length; k++) {
      var i = Math.floor((previousmouse[0]-50)/40) + corners[activepiece][k][rotation[currentrot][0]]*rotation[currentrot][2];
      var j = Math.floor((previousmouse[1]-50)/40) + corners[activepiece][k][rotation[currentrot][1]]*rotation[currentrot][3]*flip;
      // Heittää välillä erroria koska j ja i saattavat olla laudan ulkopuolella. Tästä ei koidu haittaa
      if (i >= 0 && i <= 19 && j >= 0 && j <= 19) {
        if (grid[j][i] === piececolor) {
          return true;
        }
      }
    }
  }
  return false;
}

function sideselected() {
  for (var i=0; i < sides.length; i++) {
    if (sides[i]) {
      document.getElementById("buttons").children[i].textContent = sides[i];
    } else {
      document.getElementById("buttons").children[i].textContent = colors[i];
    }
  }
}

// Muista ottaa huomioon canvas-elementin margin e.x ja e.y laskuissa
c.addEventListener("mousemove", (e) => {
  gameupdate(e.x + window.pageXOffset, e.y + window.pageYOffset);
  previousmouse = [e.x + window.pageXOffset, e.y + window.pageYOffset];
})

// Kun pelaaja siirtää hiiren pois laudalta
c.addEventListener("mouseout", (e) => {
  gameupdate(e.x + window.pageXOffset, e.y + window.pageYOffset);
  previousmouse = [0, 0];
})

// Kun pelaaja haluaa kääntää valittua palasta laudalla
document.addEventListener('keyup', (e) => {
  if (e.code === "KeyD") {
    currentrot += (flip === 1) ? 1 : -1;
    currentrot -= Math.min(currentrot, 0)*4;
    currentrot %= 4;
    gameupdate(previousmouse[0], previousmouse[1]);
  }
  if (e.code === "KeyA") {
    currentrot -= (flip === 1) ? 1 : -1;
    currentrot -= Math.min(currentrot, 0)*4;
    currentrot %= 4;
    gameupdate(previousmouse[0], previousmouse[1]);
  }
  if (e.code === "KeyW") {
    flip *= -1;
    gameupdate(previousmouse[0], previousmouse[1]);
  }
  if (e.code === "KeyS") {
    flip *= -1;
    gameupdate(previousmouse[0], previousmouse[1]);
  }
});

// Kun pelaaja asetta palasen laudalle
document.addEventListener('click', (e) => {
  if (activepiece !== -1 && pieceonboard(previousmouse[0], previousmouse[1]) && positionavailable() && legalmove()) {
    var recentplacement = [];
    for (var k=0; k < pieces[activepiece].length; k++) {
      var i = Math.floor((previousmouse[0]-50)/40) + pieces[activepiece][k][rotation[currentrot][0]]*rotation[currentrot][2];
      var j = Math.floor((previousmouse[1]-50)/40) + pieces[activepiece][k][rotation[currentrot][1]]*rotation[currentrot][3]*flip;
      grid[j][i] = piececolor;
      recentplacement.push([j,i]);
    }
    gamesound.play();
    // Nyt palanen ei ole enää pelattavissa
    document.getElementById("piece" + (activepiece + 1)).style.visibility = 'hidden';

    // Muodostetaan pelin järjestys
    if (moveorder.length < 4) {
      for (var i in placementorder) {
        if (placementorder[i].length === 0) {
          if (!moveorder.includes(currentcolor)) {
            moveorder.push(currentcolor);
            if (moveorder.length === 4) {
              whoseturn = moveorder[0];
            }
          }
        }
      }
    } else {
      whoseturn = moveorder[(moveorder.indexOf(currentcolor) + 1) % 4];
    }


    placementorder[currentcolor].push(activepiece);
    piecehistory[currentcolor][activepiece] = recentplacement;
    activepiece = -1;

    // Lähetetään päivityspyynto serverille
    socket.emit('clientdata', [grid, placementorder, piecehistory, moveorder, whoseturn]);

  }
  gameupdate(previousmouse[0], previousmouse[1]);
});

// Pelaaja valitsee aktiivisen siirrettävän palasen menusta. Aluksi tarkistetaan
// että palasta ei ole vielä laitettu
document.getElementById("pieces").addEventListener('click', (e) => {
  if (parseInt(e.path[0].id.split("piece")[1]) - 1 >= 0) {
    activepiece = parseInt(e.path[0].id.split("piece")[1]) - 1;
    currentrot = 0;
    flip = 1;
  }


  // Efekti valitun palasen korostamiseksi menussa
  for (var i=0; i < pieces.length; i++) {
    document.getElementById("piece" + (i+1)).style.backgroundColor = "linen";
  }
  if (e.path[0].id !== "pieces") {
    document.getElementById(e.path[0].id).style.backgroundColor = "#c0c0c0";
  }
});

// Pelaaja valitsee minkä värisiä palasia katselee
document.getElementById("buttons").addEventListener('click', (e) => {
  console.log(e.path[0].id);
  if (e.path[0].id === "redb") {
    piececolor = "#e03333";
    currentcolor = "red";
  }
  if (e.path[0].id === "greenb") {
    piececolor = "#12bb0c";
    currentcolor = "green";
  }
  if (e.path[0].id === "blueb") {
    piececolor = "#2a2df3";
    currentcolor = "blue";
  }
  if (e.path[0].id === "yellowb") {
    piececolor = "#efff0f";
    currentcolor = "yellow";
  }
  drawmenupieces();

  // Visuaalinen efekti valitun palasen korostamiseksi häviää
  for (var i=0; i < pieces.length; i++) {
    document.getElementById("piece" + (i+1)).style.backgroundColor = "linen";
  }
});

// Edellisen palasen pyyhkiminen laudalta
document.getElementById("undo").onclick = () => {
  if (placementorder[currentcolor].length > 0) {
    // sievennetään koodia tällä sijoituksella
    var lastpiece = placementorder[currentcolor][placementorder[currentcolor].length - 1];
    for (var i=0; i < piecehistory[currentcolor][lastpiece].length; i++) {
      var x = piecehistory[currentcolor][lastpiece][i][0];
      var y = piecehistory[currentcolor][lastpiece][i][1]
      grid[x][y] = 0;
    }
    document.getElementById("piece" + (lastpiece + 1)).style.visibility = 'visible';
    document.getElementById("piece" + (lastpiece + 1)).style.backgroundColor = "linen";
    gameupdate(previousmouse[0], previousmouse[1]);
    delete piecehistory[currentcolor][lastpiece];
    placementorder[currentcolor].pop();

    // Muokkauspyyntö serverille
    socket.emit('clientdata', [grid, placementorder, piecehistory, moveorder, whoseturn]);
  }
};

document.getElementById("reset").onclick = () => {
  var res = confirm("Do you want to reset the game?");
  if (res) {
    socket.emit('clientreset', "reset the game");
    reset();
  }
}

document.getElementById("info").onclick = () => {
  var str = "Select a piece from the piece menu. Press 'a' or 'd' to rotate a piece and 'w' or 's' to turn a piece around. Remember: \n"
  + "Same coloured pieces can only be placed so that no sides are touching each other and at least one corner is connected to another piece.";
  var res = alert(str);
}

document.getElementById("selectside").onclick = () => {
  var side = Number(prompt("Select your side. \n (Enter 1=red, 2=green, 3=blue or 4=yellow)"));
  console.log(side);
  if (side < 1 || side > 4 || Number.isNaN(side)) {
    alert("Error! Select again.");
    side = Number(prompt("Select your side. \n (Enter 1=red, 2=green, 3=blue or 4=yellow)"));
  } else {
    if (!sides[side-1] && !sides.includes(myname)) {
      sides[side-1] = myname;
      console.log(sides);
    } else {
      alert("Error! This color is taken or you already have selected your side.");
    }
  }
  socket.emit('clientside', sides);
  sideselected();
}

initialize();