function CurrGame(gameName, gameSettings, gameLoc) {
  this.name = gameName;
  this.settings = gameSettings;
  this.loc = gameLoc;
  this.gameInstance = null;
}

function Games() {
  this.metaGame = "_ChooseGame"; // Website to Choose Game
  // this.corsProxy = "https://cors-anywhere.herokuapp.com/";
  this.corsProxy = "https://cors-proxy-oc.glitch.me/";
  this.unityLoaderLoc = "https://openconsole-games.github.io/Games/_GenericUnityLoader/index.html";
  this.genericLoaderLoc = "https://openconsole-games.github.io/Games/_GenericGameLoader/index.html";
  this.currGame = null;
  this.gamesList = null;
  this.gamesIFrame = null;
  window.addEventListener("message", this.handleMessageFromGame, false);
}
Games.prototype.initialize = function() {
  gamesCtrl.loadDefaultGamesList();
}

Games.prototype.loadJSON = function (path, success, error) {
  console.log("Attemting to read json at: " + path);
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    if (xhr.status === 200) {
      if (success) success(JSON.parse(xhr.responseText));
    }
    else {
      if (error) error(xhr);
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
}

/**
 * If generic: Loads a Generic .html game located at game.loc, INPUT ONLY WORKS IF SAME ORIGIN!
 * Else: Loads a Unity game with the unity .json at game.loc
 */
Games.prototype.onGameLoad = function () {
  // Currently OBSOLETE
  var ogl = gamesCtrl.currGame.settings.OnGameLoad;
  if(!ogl) return;
  
  var delay = Math.ceil(parseFloat(ogl.delay)*1000);
  function startKeySeq(index) {
    if(index < ogl.keys.length) {
      if(ogl.keys[index].isDelay) {
        setTimeout(function() { startKeySeq(index+1); }, ogl.keys[index].data);
      } 
      else {
        gamesCtrl.sendSimulateButton(ogl.keys[index], "Press", "0");
        setTimeout(function() { startKeySeq(index+1); }, 300);
      }
    }
  }
  setTimeout(function () { startKeySeq(0); }, delay);                
}


Games.prototype.setGameContentFrame = function (gameCanvasId) {
  if(gamesCtrl.gamesIFrame == null) return;
  var messageToSend = {"type":"SetGameInstace", "gameCanvasId":gameCanvasId };
  gamesCtrl.gamesIFrame.contentWindow.postMessage(messageToSend, "*");
}
Games.prototype.handleGamePicker = function () {
  if(gamesCtrl.currGame.name != gamesCtrl.metaGame) return;
  var gamesArray = Object.values(gamesCtrl.gamesList).filter(game => { return game.name[0] != "_" });
  var messageToSend = {"type":"SetGames", "gamesList":gamesArray, "prevGame":gamesCtrl.prevGame };
  gamesCtrl.gamesIFrame.contentWindow.postMessage(messageToSend, "*");
}

Games.prototype.cachedFrameLoaded = function () {
  gamesCtrl.setGameContentFrame(gamesCtrl.currGame.settings.canvas.id);
  gamesCtrl.handleGamePicker();
  // TODO: Obsolete?
  gamesCtrl.onGameLoad();
}
Games.prototype.remoteFrameLoaded = function () {
  var messageToSend = {"type":"SetGame", "loc": gamesCtrl.currGame.loc, "canvasId":gamesCtrl.currGame.settings.canvas.id };
  gamesCtrl.gamesIFrame.contentWindow.postMessage(messageToSend, "*");//"https://openconsole-games.github.io");
  // TODO: Obsolete?
  gamesCtrl.onGameLoad();
}
Games.prototype.unityFrameLoaded = function () {
  gamesCtrl.setGameContentFrame("#canvas");
  
  var onLoadUnity = function (message) {
    if(message.data.type == "UnityLoaded") {
      // TODO: Obsolete?
      gamesCtrl.onGameLoad();
      window.removeEventListener("message", onLoadUnity);
    }
  };
  window.addEventListener("message", onLoadUnity, false);
  
  var messageToSend = {"type":"SetUnityGame", "loc": gamesCtrl.currGame.loc, "corsProxy":gamesCtrl.corsProxy };
  gamesCtrl.gamesIFrame.contentWindow.postMessage(messageToSend, "*");//"https://openconsole-games.github.io");
}

Games.prototype.setGameFrame = function (gameObj) {
  gamesCtrl.currGame = gameObj;
  document.getElementById("game").innerHTML = "<iframe id=\"webgl-content\" src=\"\" scrolling=\"no\" frameBorder=\"0\"></iframe>";
  gamesCtrl.gamesIFrame = document.getElementById("webgl-content");
  if(gamesCtrl.currGame.name != gamesCtrl.metaGame) {
    gamesCtrl.prevGame = gamesCtrl.currGame.name;
  }
  
  switch (gameObj.settings.game.type) {
    case "cached":
      // !! Game HTML must be edited to contain: <script src="https://openconsole.github.io/Games/console_game_api.js"></script>
      gamesCtrl.gamesIFrame.src = gameObj.loc;
      gamesCtrl.gamesIFrame.addEventListener("load", gamesCtrl.cachedFrameLoaded );
      break;
    case "remote":
      // Game is on Remote server, try to load game from there. Won't work with all games.
      gamesCtrl.gamesIFrame.src = gamesCtrl.genericLoaderLoc;
      gamesCtrl.gamesIFrame.addEventListener("load", gamesCtrl.remoteFrameLoaded );
      break;
    case "unity":
      // Unity files may be on Remote server, game can be loaded from there.
      gamesCtrl.gamesIFrame.src = gamesCtrl.unityLoaderLoc;
      gamesCtrl.gamesIFrame.addEventListener("load", gamesCtrl.unityFrameLoaded );
      break;
  }
}

Games.prototype.getGamePath = function (gameSettings, currLocation) {
  var gameLoc = null;
  if (gameSettings.relLoc != null) {
    if (gameSettings.type == "remote") {
      console.error("Please use game.type of \"cached\" for games stored on a server you own (relLoc), \"remote\" games are much less efficient!");
    }
    gameLoc = currLocation.substring(0, currLocation.lastIndexOf("/") + 1) + gameSettings.relLoc;
  } 
  else if (gameSettings.absLoc != null) {
    gameLoc = gameSettings.absLoc;
  }
  return gameLoc;
}
Games.prototype.setGame = function (gameName) {
  // Used EXTERNALLY
  if(gamesCtrl.gamesList == null || gamesCtrl.gamesList[gameName] == null) {
    console.error(gamesCtrl.gamesList);
    console.error("Unknown game! " + gameName);
    return;
  }
  var gameSettingsLocation = gamesCtrl.gamesList[gameName].path;
  gamesCtrl.loadJSON(gamesCtrl.corsProxy + gameSettingsLocation,
    function(settings) { 
      console.log(settings);
      var path = gamesCtrl.getGamePath(settings.game, gameSettingsLocation);
      if(path == null) {
        console.error("Path to game not specified!");
        return;
      }
      var game = new CurrGame(gameName, settings, path);
      gamesCtrl.setGameFrame(game);
      consoleNet.resetPlayerIds();
      consoleNet.setContollerGameAll();
      metaConsole.displayNewGame(gameName[0] == "_" ? "" : gameName);
    },
    function(xhr) { console.error(xhr); }
  );
}

Games.prototype.onLoadDefaultGameList = function() {
  if(gamesCtrl.metaGame && gamesCtrl.metaGame != "" && gamesCtrl.currGame == null) {
    if(gamesCtrl.gamesList[gamesCtrl.metaGame] != null)
      gamesCtrl.setGame(gamesCtrl.metaGame);
  }
}
Games.prototype.loadGamesList = function (jsonLocation) {
  gamesCtrl.loadJSON(gamesCtrl.corsProxy + jsonLocation,
    function(data) {
      var relPath = jsonLocation.substring(0, jsonLocation.lastIndexOf("/") + 1);
      for (var i = 0; i < data.length; i++) {
        if(gamesCtrl.gamesList == null) gamesCtrl.gamesList = {};
        gamesCtrl.gamesList[data[i].name] = data[i];
        gamesCtrl.gamesList[data[i].name].path = relPath + data[i].relLocation;
      }
      gamesCtrl.onLoadDefaultGameList();
    },
    function(xhr) { console.error(xhr); }
  );
}
Games.prototype.loadDefaultGamesList = function() {
  if(gamesCtrl.gamesList) return;
  
  //gamesCtrl.loadGamesList('http://localhost:8000/Games/gamesList.json');
  gamesCtrl.loadGamesList('https://openconsole-games.github.io/Games/gamesList.json');
  setTimeout(gamesCtrl.loadDefaultGamesList, 5000);
}

  
Games.prototype.handleMessageFromGame = function (event) {
  var message = event.data;
  switch(message.type) {
    case "SetGame":
      gamesCtrl.setGame(message.game.name);
      break;
  }
}

Games.prototype.getGameInstance = function() {
  // Used EXTERNALLY
  if (!gamesCtrl.currGame) return null;
  return gamesCtrl.currGame.gameInstance;
}
Games.prototype.getCurrGameAspect = function() {
  // Used EXTERNALLY
  if (!gamesCtrl.currGame) return null;
  return gamesCtrl.currGame.settings.canvas.aspect;
}
Games.prototype.getGameIFrame = function() {
  // Used EXTERNALLY
  return gamesCtrl.gamesIFrame;
}
Games.prototype.getMaxPlayers = function() {
  // Used EXTERNALLY
  if (!gamesCtrl.currGame) return null;
  return gamesCtrl.currGame.settings.controls.maxPlayers;
}
Games.prototype.getControllerForCurrentGame = function(playerId) {
  // Used EXTERNALLY
  if (!gamesCtrl.currGame) return null;
  var ctrl = { "name":gamesCtrl.currGame.name, "loc":gamesCtrl.currGame.settings.ctrl.loc };
  var ctrls = gamesCtrl.currGame.settings.controls.keymap;
  if (playerId >= ctrls.length) return ctrl;
  ctrl.keymap = ctrls[playerId];
  
                  /*
            var enabledKeys = "";
            var multiKeys = "";
            if(settings.controls[conn.id]) {
                enabledKeys = Object.keys(settings.controls[conn.id]).toString();
                multiKeys = Object.values(settings.controls[conn.id]).filter(function (key) { return key.isMulti; }).map(
                function(key) {
                    return (key.data.width * key.data.height);
                }).toString();
            }
            signal(conn, "SetLayout--" + settings.controllerLayout + "--" + enabledKeys + "--" + multiKeys);
            */
  return ctrl;
}


Games.prototype.translateKeyIdToButton = function(keyId, playerId) {
  if (!gamesCtrl.currGame) return null;
  var ctrls = gamesCtrl.currGame.settings.controls.keymap;
  if (playerId >= ctrls.length) return null;
  var multiKeys = keyId.split(/--/);
  var translatedButton = ctrls[playerId][multiKeys[0]];
  if (multiKeys.length > 1) {
    translatedButton.x = multiKeys[1];
    translatedButton.y = multiKeys[2];
  }
  return translatedButton;
}

Games.prototype.sendSimulateButton = function (buttonData, upDown, pressId) {
  if(gamesCtrl.gamesIFrame == null) return;
  var messageToSend = {"type":"SimulateBtn", "buttonData":buttonData, "upDown":upDown, "pressId":pressId };
  gamesCtrl.gamesIFrame.contentWindow.postMessage(messageToSend, "*");
}
Games.prototype.simulateButton = function (keyId, playerId, upDown, pressId) {
  // Used EXTERNALLY
  var translatedButton = gamesCtrl.translateKeyIdToButton(keyId, playerId);
  if(translatedButton == null) {
    console.log(keyId + ", " + playerId + " [IGNORED]");
    return;
  }
  gamesCtrl.sendSimulateButton(translatedButton, upDown, pressId);
}

var gamesCtrl = new Games();
gamesCtrl.initialize();