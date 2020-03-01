var selectGame = [-1, -1];

(function() {
var selectCanvas = document.getElementById("select_canvas");
var gamesContainer = document.getElementById("games-container");
var gamesArray = [];
var setGames = function (gamesList, prevGame) {
  gamesArray = [];
  var cols = 7;
  var rows = Math.ceil(gamesList.length / cols);
  
  gamesContainer.innerHTML = '';
  for (var y = 0; y < rows; y++) {
	  if (y == rows - 1 && gamesList.length % cols != 0) { cols = gamesList.length % cols }
	  gamesArray.push([]);
	  var gamesRow = document.createElement("div");
	  gamesRow.classList.add("games-row");
	  gamesContainer.appendChild(gamesRow);
    for (var x = 0; x < cols; x++) {
      var currGame = gamesList[y * 7 + x];
	    var gameContainer = document.createElement("div");
	    gameContainer.classList.add("game-container");
	    gamesRow.appendChild(gameContainer);
	    var gameSelect = document.createElement("div");
	    gameSelect.classList.add("game-select");
	    gameContainer.appendChild(gameSelect);
	    gamesArray[y].push([currGame, gameSelect]);
	  
	    var gameImage = document.createElement("div");
	    gameImage.classList.add("game-image", "active");
	    if (currGame.gamePic) {
	      gameImage.setAttribute('style', 'background-image: url(\'' + currGame.gamePic + '\');')
	    }
	    gameSelect.appendChild(gameImage);
      var gameImageGif = document.createElement("div");
	    gameImageGif.classList.add("game-image");
	    if (currGame.highlightPic) {
	      gameImageGif.setAttribute('style', 'background-image: url(\'' + currGame.highlightPic + '\');')
	    }
	    gameSelect.appendChild(gameImageGif);
	  
	    var gameFooter = document.createElement("div");
	    gameFooter.classList.add("game-footer");
      gameSelect.appendChild(gameFooter);
      var gameName = document.createElement("div");
	    gameName.classList.add("game-name");
	    gameName.innerHTML = currGame.name;
	    gameFooter.appendChild(gameName);

      if(currGame.minPayers != null || currGame.maxPlayers != null) {
        var gamePlayersNum = document.createElement("div");
        gamePlayersNum.classList.add("game-players-num-container");
        gameSelect.appendChild(gamePlayersNum);
        var gamePlayersSymbol = document.createElement("div");
        gamePlayersSymbol.classList.add("game-players-num-symbol");
        gamePlayersNum.appendChild(gamePlayersSymbol);
        var gamePlayersNumber = document.createElement("div");
        gamePlayersNumber.classList.add("game-players-num-label");
        gamePlayersNumber.innerHTML = "";
        if(currGame.minPayers != null) gamePlayersNumber.innerHTML += currGame.minPayers;
        if(currGame.minPayers != null && currGame.maxPlayers != null) gamePlayersNumber.innerHTML += " - ";
        if(currGame.maxPlayers != null) gamePlayersNumber.innerHTML += currGame.maxPlayers;
        gamePlayersNum.appendChild(gamePlayersNumber);
      }

      if (prevGame && currGame.name == prevGame) {
        selectGame = [x, y];
      }
	  }
  }
  if (!checkValid(selectGame)) { selectGame = randomSelect(); }
  setGameActive(selectGame[0], selectGame[1]);
};


function setGameActive(x, y) {
  gamesArray[y][x][1].classList.add("active");
  if(gamesArray[y][x][0].highlightPic) {
    gamesArray[y][x][1].children[0].classList.remove("active");
    gamesArray[y][x][1].children[1].classList.add("active");
  }
}
function setGameInactive(x, y) {
  gamesArray[y][x][1].classList.remove("active");
  if(gamesArray[y][x][0].gamePic) {
    gamesArray[y][x][1].children[0].classList.add("active");
    gamesArray[y][x][1].children[1].classList.remove("active");
  }
}
function randomSelect() {
  var rY = Math.floor(Math.random() * gamesArray.length);
  var rX = Math.floor(Math.random() * gamesArray[rY].length);
	return [rX, rY];
}
function checkValid (newSelect) {
	if (newSelect[1] < 0 || newSelect[1] >= gamesArray.length) return false;
	if (newSelect[0] < 0 || newSelect[0] >= gamesArray[newSelect[1]].length) return false;
	return true;
}
document.onkeydown = function(e) {
  var newSelect = selectGame.slice();
  var changedSelect = false;
  switch (e.key) {
    case "ArrowUp":
      changedSelect = true;
	    newSelect[1]--;
      break;
    case "ArrowDown":
      changedSelect = true;
	    newSelect[1]++;
      break;
    case "ArrowLeft":
      changedSelect = true;
	    newSelect[0]--;
      break;
    case "ArrowRight":
      changedSelect = true;
	    newSelect[0]++;
      break;
    case "Enter":
	    PostGameSelectMessageToContainer(gamesArray[selectGame[1]][selectGame[0]][0]);
      break;
    default:
  }
  if (changedSelect && checkValid(newSelect)) {
    setGameInactive(selectGame[0], selectGame[1]);
	  selectGame = newSelect;
    setGameActive(selectGame[0], selectGame[1]);
  }
};

var strict = true;
var controllerPageLocation = "https://openconsole.github.io";
function PostGameSelectMessageToContainer(game) {
    parent.postMessage({ "type":"SetGame", "game":game }, strict ? controllerPageLocation : "*");
}

function receiveMessage(event) {
  // Do we trust the sender of this message?
  if (event.origin !== controllerPageLocation && strict)
    return;
  
  var message = event.data;
  switch(message.type) {
    case "SetGames":
      setGames(message.gamesList, message.prevGame);
      break;
  }
}
window.addEventListener("message", receiveMessage, false);
})();
/*                            
setGames([
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"../LeagueOfPixels/icon-256.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"../LeagueOfPixels/icon-256.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"../LeagueOfPixels/icon-256.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
},
{ "name":"League of Pixels", 
  "relLocation":"None",
  "gamePic":"https://img.itch.zone/aW1nLzI4MTczODUucG5n/original/O7gO0C.png" 
}
]);*/