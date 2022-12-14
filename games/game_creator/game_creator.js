function GameCreator() {
  this.corsProxy = "https://cors-anywhere.herokuapp.com/";
  // this.corsProxy = "https://cors-proxy-oc.glitch.me/";
  
  this.gamesListLoc = "";
  
  this.gameInfo = document.getElementById("game-info");
  this.gameSettings = document.getElementById("game-settings");
  this.gameInfoBtn = document.getElementById("game-info-btn");
  this.gameSettingsBtn = document.getElementById("game-settings-btn");
  
  this.gameCachedBtn = document.getElementById("cached-btn");
  this.gameRemoteBtn = document.getElementById("remote-btn");
  this.gameUnityBtn = document.getElementById("unity-btn");
  
  this.gameLocInput = document.getElementById("game-loc-input");
  this.gameCanvasIdInput = document.getElementById("game-canvasid-input");
  this.gameAspectInput = document.getElementById("game-apect-input");
  
  this.gameIFrame = document.getElementById("game");
  
  this.gameCtrlTwoBtn = document.getElementById("two_btn-select");
  this.gameCtrlJoystick = document.getElementById("joystick-select");
  this.gameCtrlMultiBtn = document.getElementById("multi_btn-select");
  this.gameCtrlCustom = document.getElementById("custom-select");
  this.gameCtrlCustomSelect = document.getElementById("custom-ctrl-select");
  this.gameCtrlCustomInput = document.getElementById("custom-ctrl-loc-input");
  
  this.ctrlIFrame = document.getElementById("controller");
  
  this.ctrlPlayerCountInput = document.getElementById("player-count-input");
  this.ctrlTabHolder = document.getElementById("player-tab-holder");
  this.ctrlKeymap = document.getElementById("keymap");
  this.ctrlPlayerTabs = [];
  this.currActiveTab = 0;
}
GameCreator.prototype.initializeGame = function() {
  gCreator.currGameSettings = {};
  gCreator.currGameSettings.game = {};
  gCreator.currGameSettings.canvas = {};
  gCreator.currGameSettings.canvas.aspect = 0;
  gCreator.currGameSettings.ctrl = {};
  gCreator.currGameSettings.controls = { "keymap" : [] };
}
GameCreator.prototype.initialize = function() {
  gCreator.initializeGame();
  
  gCreator.gameInfoBtn.addEventListener('mouseup', gCreator.setScreen.bind(this, "game_info"));
  gCreator.gameSettingsBtn.addEventListener('mouseup', gCreator.setScreen.bind(this, "game_settings"));
  
  gCreator.gameCachedBtn.addEventListener('mousedown', gCreator.setGameType.bind(this, "cached"));
  gCreator.gameRemoteBtn.addEventListener('mousedown', gCreator.setGameType.bind(this, "remote"));
  gCreator.gameUnityBtn.addEventListener('mousedown', gCreator.setGameType.bind(this, "unity"));
  
  gCreator.gameLocInput.addEventListener('change', gCreator.gameLocationChanged);
  gCreator.gameCanvasIdInput.addEventListener('change', gCreator.canvasIdChanged);
  gCreator.gameAspectInput.addEventListener('change', gCreator.aspectChanged);
  
  gCreator.gameCtrlTwoBtn.addEventListener('mousedown', gCreator.chooseControllerType.bind(this, "two_btn"));
  gCreator.gameCtrlJoystick.addEventListener('mousedown', gCreator.chooseControllerType.bind(this, "joystick"));
  gCreator.gameCtrlMultiBtn.addEventListener('mousedown', gCreator.chooseControllerType.bind(this, "multi_btn"));
  gCreator.gameCtrlCustom.addEventListener('mousedown', gCreator.chooseControllerType.bind(this, "custom"));
  gCreator.gameCtrlCustomSelect.addEventListener('mousedown', function(event) { event.stopPropagation(); });
  document.addEventListener('mousedown', gCreator.hideCustomCtrlSelect);
  gCreator.gameCtrlCustomInput.addEventListener('change', gCreator.customCtrlLocChanged);
  
  gCreator.ctrlPlayerCountInput.addEventListener('change', gCreator.controllerPlayersChanged);
  gCreator.setPlayerCount(1);
  
  window.addEventListener("message", gCreator.recieveMessage, false);
  window.addEventListener('resize', gCreator.updateGameSize);
}
GameCreator.prototype.setScreen = function(screen) {
  switch (screen) {
    case "game_settings":
      gCreator.gameInfo.classList.add("disabled");
      gCreator.gameInfoBtn.classList.remove("active");
      gCreator.gameSettings.classList.remove("disabled");
      gCreator.gameSettingsBtn.classList.add("active");
      break;
    case "game_info":
      gCreator.gameInfo.classList.remove("disabled");
      gCreator.gameInfoBtn.classList.add("active");
      gCreator.gameSettings.classList.add("disabled");
      gCreator.gameSettingsBtn.classList.remove("active");
      break;
  }
}

GameCreator.prototype.setGameType = function(type) {
  gCreator.gameCachedBtn.classList.remove("active");
  gCreator.gameRemoteBtn.classList.remove("active");
  gCreator.gameUnityBtn.classList.remove("active");
  switch (type) {
    case "cached":
      gCreator.gameCachedBtn.classList.add("active");
      gCreator.currGameSettings.game.type = "cached";
      gCreator.gameCanvasIdInput.value = gCreator.gameCanvasIdInput.cachedValue || "";
      gCreator.gameCanvasIdInput.readOnly = false;
      break;
    case "remote":
      gCreator.gameRemoteBtn.classList.add("active");
      gCreator.currGameSettings.game.type = "remote";
      gCreator.gameCanvasIdInput.value = gCreator.gameCanvasIdInput.cachedValue || "";
      gCreator.updateCanvasId("#canvas");
      gCreator.gameCanvasIdInput.readOnly = false;
      break;
    case "unity":
      gCreator.gameUnityBtn.classList.add("active");
      gCreator.currGameSettings.game.type = "unity";
      gCreator.gameCanvasIdInput.cachedValue = gCreator.currGameSettings.canvas.id;
      gCreator.gameCanvasIdInput.value = "#canvas";
      gCreator.gameCanvasIdInput.readOnly = true;
      break;
  }
  gCreator.updateCanvasId(gCreator.gameCanvasIdInput.value);
  gCreator.setGameIFrame();
}

GameCreator.prototype.loadPage = function (path, success, error) {
  console.log("Attemting to read page at: " + path);
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    if (xhr.status === 200) {
      if (success) success(xhr.responseText);
    }
    else {
      if (error) error(xhr);
    }
  };
  xhr.open("GET", gCreator.corsProxy + path, true);
  xhr.send();
}
GameCreator.prototype.gameLocationChanged = function(elem) {
  newLocation = elem.srcElement.value;
  if (newLocation.match(/^https?:\/\//)) {
    gCreator.loadPage(newLocation, function() {
      gCreator.currGameSettings.game.relLoc = null;
      gCreator.currGameSettings.game.absLoc = newLocation;
      gCreator.setGameIFrame();
      elem.srcElement.setCustomValidity("");
    }, function() {
      elem.srcElement.setCustomValidity("Invalid field.");
    });
  }
  else {
    if (!gCreator.gamesListLoc.match(/^https?:\/\//)) {
      elem.srcElement.setCustomValidity("Invalid field.");
      return;
    }
    currLoc = gCreator.gamesListLoc.substring(0, gCreator.gamesListLoc.lastIndexOf("/") + 1)
    gCreator.loadPage(currLoc + newLocation, function() {
      gCreator.currGameSettings.game.relLoc = newLocation;
      gCreator.currGameSettings.game.absLoc = null;
      gCreator.setGameIFrame();
      elem.srcElement.setCustomValidity("");
    }, function() {
      elem.srcElement.setCustomValidity("Invalid field.");
    });
  }
  console.log(gCreator.currGameSettings);
}
GameCreator.prototype.canvasIdChanged = function(elem) {
  newCanvasId = elem.srcElement.value;
  gCreator.updateCanvasId(newCanvasId);
  gCreator.setGameCanvasMessage();
}
GameCreator.prototype.updateCanvasId = function(newCanvasId) {
  gCreator.currGameSettings.canvas.id = newCanvasId;
}
GameCreator.prototype.aspectChanged = function(elem) {
  newAspect = elem.srcElement.value;
  if(newAspect == "")
    return;
  gCreator.currGameSettings.canvas.aspect = newAspect;
  gCreator.updateGameSize();
}

GameCreator.prototype.chooseControllerType = function (type, event) {
  gCreator.gameCtrlTwoBtn.classList.remove("active");
  gCreator.gameCtrlJoystick.classList.remove("active");
  gCreator.gameCtrlMultiBtn.classList.remove("active");
  gCreator.gameCtrlCustom.classList.remove("active");
  switch (type) {
    case "two_btn":
      gCreator.gameCtrlTwoBtn.classList.add("active");
      gCreator.currGameSettings.ctrl.loc = "https://openconsole.github.io/openconsole/controllers/two_button/two_button.html";
      gCreator.setControllerIFrame();
      break;
    case "joystick":
      gCreator.gameCtrlJoystick.classList.add("active");
      gCreator.currGameSettings.ctrl.loc = "https://openconsole.github.io/openconsole/controllers/one_joystick/one_joystick.html";
      gCreator.setControllerIFrame();
      break;
    case "multi_btn":
      gCreator.gameCtrlMultiBtn.classList.add("active");
      // TODO: gCreator.currGameSettings.ctrl.loc = "https://openconsole.github.io/openconsole/controllers/";
      break;
    case "custom":
      gCreator.gameCtrlCustom.classList.add("active");
      gCreator.showCustomCtrlSelect();
      event.stopPropagation();
      break;
  }
}
GameCreator.prototype.showCustomCtrlSelect = function() {
  gCreator.gameCtrlCustomSelect.classList.add("active");
}
GameCreator.prototype.hideCustomCtrlSelect = function() {
  gCreator.gameCtrlCustomSelect.classList.remove("active");
}
GameCreator.prototype.customCtrlLocChanged = function(elem) {
  newLocation = elem.srcElement.value;
  gCreator.loadPage(newLocation, function() {
    gCreator.currGameSettings.ctrl.loc = newLocation;
    gCreator.setControllerIFrame();
    elem.srcElement.setCustomValidity("");
  }, function() {
    elem.srcElement.setCustomValidity("Invalid field.");
  });
}

GameCreator.prototype.controllerPlayersChanged = function (elem) {
  if (!elem.srcElement.validity.valid)
    return;
  newPlayerCount = parseInt(elem.srcElement.value);
  gCreator.setPlayerCount(newPlayerCount);
}

GameCreator.prototype.setPlayerCount = function (newPlayerCount) {
  gCreator.currGameSettings.controls.maxPlayers = newPlayerCount;
  while (gCreator.ctrlPlayerTabs.length < newPlayerCount) {
    lastTab = gCreator.ctrlPlayerTabs.length != 0 ? gCreator.ctrlPlayerTabs[gCreator.ctrlPlayerTabs.length - 1] : null;
    newTab = gCreator.createNewTab(lastTab, gCreator.ctrlPlayerTabs.length);
    
    gCreator.ctrlTabHolder.appendChild(newTab.pcTab);
    gCreator.ctrlKeymap.appendChild(newTab.pMap);
    if (gCreator.currActiveTab == gCreator.ctrlPlayerTabs.length) {
      newTab.pcTab.classList.add("active");
      newTab.pMap.classList.remove("disabled");
    }
    gCreator.ctrlPlayerTabs.push(newTab);
  }
  while (gCreator.ctrlPlayerTabs.length > newPlayerCount) {
    oldTab = gCreator.ctrlPlayerTabs.pop();
    gCreator.removeFromGlobalKeymap(oldTab.pMap.playerId);
    oldTab.pcTab.remove();
    oldTab.pMap.remove();
    if (gCreator.currActiveTab > gCreator.ctrlPlayerTabs.length - 1) {
      gCreator.setNewActiveTab(gCreator.ctrlPlayerTabs.length - 1);
    }
  }
}
GameCreator.prototype.createNewTab = function (prevTab, index) {
  newTab = {};
  newTab.pcTab = document.createElement("div");
  newTab.pcTab.classList.add("player-count-num");
  newTab.pcTab.innerHTML = (index + 1);
  newTab.pcTab.addEventListener('mousedown', gCreator.setNewActiveTab.bind(this, index));
  
  newTab.pMap = document.createElement("table");
  newTab.pMap.classList.add("mapping", "disabled");
  newTab.pMap.playerId = index;
  newTab.pMap.keymap = {};
  if (prevTab != null) {
    var children = prevTab.pMap.children;
    for (var i = 0; i < children.length - 1; i++) {
      console.log(i);
      var tableChild = children[i];
      var newRow = tableChild.cloneNode(true);
      newRow.keyId = tableChild.keyId;
      newRow.buttonText = tableChild.buttonText;
      newRow.pressData = tableChild.pressData;
      keyIdIn = newRow.children[0].children[0];
      keyIdIn.addEventListener('change', gCreator.ctrlChangeKeyId.bind(keyIdIn, newTab.pMap, newRow));
      keyTextIn = newRow.children[1].children[0];
      keyTextIn.addEventListener('change', gCreator.ctrlChangeButtonText.bind(keyTextIn, newTab.pMap, newRow));
      pressSelect = newRow.children[2].children[0];
      pressSelect.addEventListener('mouseup', gCreator.ctrlSetPressData.bind(pressSelect, newTab.pMap, newRow));
      deleteRow = newRow.children[3].children[0];
      deleteRow.addEventListener('mouseup', function() {
        newRow.remove();
        gCreator.updateKeymap(newTab.pMap);
      });
      newTab.pMap.appendChild(newRow);
    }
  }
  gCreator.createNewKeymapRow(newTab.pMap);
  gCreator.updateKeymap(newTab.pMap);
  return newTab;
}
GameCreator.prototype.setNewActiveTab = function (newTabIndex) {
  if (gCreator.ctrlPlayerTabs.length > gCreator.currActiveTab) {
    oldActiveTab = gCreator.ctrlPlayerTabs[gCreator.currActiveTab];
    oldActiveTab.pcTab.classList.remove("active");
    oldActiveTab.pMap.classList.add("disabled");
  }
  gCreator.currActiveTab = newTabIndex;
  newActiveTab = gCreator.ctrlPlayerTabs[newTabIndex];
  newActiveTab.pcTab.classList.add("active");
  newActiveTab.pMap.classList.remove("disabled");
  gCreator.setControllerLayout();
}
GameCreator.prototype.createNewKeymapRow = function(keymapTable) {
  var newRow = document.createElement("tr");
  newRow.classList.add("keymap-row");
  keymapTable.appendChild(newRow);
  keymapElems = [];
  for (var i = 0; i < 4; i++) {
    keymapElem = document.createElement("td");
    keymapElem.classList.add("keymap-elem");
    newRow.appendChild(keymapElem);
    keymapElems.push(keymapElem);
  }
  keyIdIn = document.createElement("input");
  keyIdIn.setAttribute("type", "text");
  keyIdIn.classList.add("input", "key-id-input");
  keyIdIn.addEventListener('change', gCreator.ctrlChangeKeyId.bind(keyIdIn, keymapTable, newRow));
  keymapElems[0].appendChild(keyIdIn);
  keyTextIn = document.createElement("input");
  keyTextIn.setAttribute("type", "text");
  keyTextIn.classList.add("input", "button-text-input");
  keyTextIn.addEventListener('change', gCreator.ctrlChangeButtonText.bind(keyTextIn, keymapTable, newRow));
  keymapElems[1].appendChild(keyTextIn);
  pressSelect = document.createElement("div");
  pressSelect.innerHTML = "Select";
  pressSelect.classList.add("press-select");
  pressSelect.addEventListener('mouseup', gCreator.ctrlSetPressData.bind(pressSelect, keymapTable, newRow));
  keymapElems[2].appendChild(pressSelect);
  deleteRow = document.createElement("div");
  deleteRow.innerHTML = "🗑️";
  deleteRow.classList.add("press-delete");
  deleteRow.addEventListener('mouseup', function() {
    if (keymapTable.lastChild != newRow) {
      newRow.remove();
      gCreator.updateKeymap(keymapTable);
    }
  });
  keymapElems[3].appendChild(deleteRow);
}

GameCreator.prototype.ctrlChangeKeyId = function(keymapTable, keymapRow) {
  if (this.value != "") {
    keymapRow.keyId = this.value;
    if (keymapTable.lastChild == keymapRow) {
      gCreator.createNewKeymapRow(keymapTable);
    }
  }
  else {
    keymapRow.keyId = null;
  }
  gCreator.updateKeymap(keymapTable);
}
GameCreator.prototype.ctrlChangeButtonText = function(keymapTable, keymapRow) {
  keymapRow.buttonText = this.value;
  gCreator.updateKeymap(keymapTable);
  if (this.value != "" && keymapTable.lastChild == keymapRow) {
    gCreator.createNewKeymapRow(keymapTable);
  }
}
GameCreator.prototype.ctrlSetPressData = function(keymapTable, keymapRow) {
  if (this.listening) return;
  this.listening = true;
  this.listenerFunction = gCreator.ctrlReadPressData.bind(this, keymapTable, keymapRow);
  document.addEventListener('keydown', this.listenerFunction);
}
GameCreator.prototype.ctrlReadPressData = function(keymapTable, keymapRow, press) {
  document.removeEventListener('keydown', this.listenerFunction);
  this.listening = false;
  keymapRow.pressData = [press.keyCode, press.key, press.code];
  this.innerHTML = press.code;
  if (keymapTable.lastChild == keymapRow) {
    gCreator.createNewKeymapRow(keymapTable);
  }
  gCreator.updateKeymap(keymapTable);
}

GameCreator.prototype.updateKeymap = function (keymapTable) {
  keymapTable.keymap = {};
  var children = keymapTable.children;
  for (var i = 0; i < children.length - 1; i++) {
    var tableChild = children[i];
    //console.log(tableChild);
    if (tableChild.pressData == null || tableChild.keyId == null) {
      continue;
    }
    var pressData = {};
    if (tableChild.buttonText != null) {
      pressData.innerHTML = tableChild.buttonText;
    }
    pressData.isKeyboard = true; // TODO
    pressData.data = tableChild.pressData;
    keymapTable.keymap[tableChild.keyId] = pressData;
  }
  gCreator.addToGlobalKeymap(keymapTable.keymap, keymapTable.playerId);
}
GameCreator.prototype.addToGlobalKeymap = function (newPlayerKeymap, playerId) {
  while(gCreator.currGameSettings.controls.keymap.length <= playerId) {
    gCreator.currGameSettings.controls.keymap.push({});
  }
  gCreator.currGameSettings.controls.keymap[playerId] = newPlayerKeymap;
  gCreator.setControllerLayout();
}
GameCreator.prototype.removeFromGlobalKeymap = function (playerId) {
  while(gCreator.currGameSettings.controls.keymap.length > playerId) {
    gCreator.currGameSettings.controls.keymap.pop();
  }
  gCreator.setControllerLayout();
}

GameCreator.prototype.setControllerIFrame = function () {
  gCreator.ctrlIFrame.setAttribute("frameborder", "1");
  var setLayoutFunct = function (event) {
    gCreator.setControllerLayout();
    gCreator.ctrlIFrame.removeEventListener("load", setLayoutFunct);
  }
  gCreator.ctrlIFrame.addEventListener("load", setLayoutFunct);
  gCreator.ctrlIFrame.src = gCreator.currGameSettings.ctrl.loc;
}
GameCreator.prototype.setControllerLayout = function () {
  keymap = gCreator.currGameSettings.controls.keymap[gCreator.currActiveTab];
  var messageToSend = {"type":"SetLayout", "keymap":keymap };
  gCreator.ctrlIFrame.contentWindow.postMessage(messageToSend, "*");
}
GameCreator.prototype.recieveMessage = function (event) {
  var message = event.data;
  switch(message.type) {
    case "Key":
      console.log(message.key);
	    gCreator.simulateButton(message.key, gCreator.currActiveTab);
      break;
  }
}
GameCreator.prototype.translateKeyIdToButton = function(keyId, playerId) {
  var ctrls = gCreator.currGameSettings.controls.keymap;
  if (playerId >= ctrls.length) return null;
  var multiKeys = keyId.split(/--/);
  var translatedButton = ctrls[playerId][multiKeys[0]];
  if (multiKeys.length > 1) {
    translatedButton.x = multiKeys[1];
    translatedButton.y = multiKeys[2];
  }
  return translatedButton;
}
GameCreator.prototype.simulateButton = function (key, playerId) {
  if(gCreator.gameIFrame == null) {
    return;
  }
  var translatedButton = gCreator.translateKeyIdToButton(key.keyId, playerId);
  if(translatedButton == null) {
    console.log(key.keyId + ", " + playerId + " [IGNORED]");
    return;
  }
  var messageToSend = {"type":"SimulateBtn", "buttonData":translatedButton, "upDown":key.upDown, "pressId":key.pressId };
  gCreator.gameIFrame.contentWindow.postMessage(messageToSend, "*");
}

GameCreator.prototype.updateGameSize = function() {
  var aspectRatio = gCreator.currGameSettings.canvas.aspect;
  var myWidth = 100, myHeight = 100;
  if(aspectRatio && aspectRatio != 0) {
    if (aspectRatio < 1.77777777778) {
      myWidth = aspectRatio / 1.77777777778 * 100;
    }
    else {
      myHeight = 1.77777777778 / aspectRatio * 100;
    }
  }
  gCreator.gameIFrame.style.width = myWidth + '%';
  gCreator.gameIFrame.style.height = myHeight + '%';
}
GameCreator.prototype.getGameLoc = function () {
  var gameLoc = null;
  if (gCreator.currGameSettings.game.relLoc) {
    currLoc = gCreator.gamesListLoc.substring(0, gCreator.gamesListLoc.lastIndexOf("/") + 1)
    gameLoc = currLoc + gCreator.currGameSettings.game.relLoc;
  }
  else if(gCreator.currGameSettings.game.absLoc) {
    gameLoc = gCreator.currGameSettings.game.absLoc;
  }
  return gameLoc;
}
GameCreator.prototype.setGameCanvasMessage = function () {
  if (gCreator.gameIFrame.contentWindow == null) {
    return;
  }
  var messageToSend = {"type":"SetGameInstace", "gameCanvasId": gCreator.currGameSettings.canvas.id };
  gCreator.gameIFrame.contentWindow.postMessage(messageToSend, "*");
}
GameCreator.prototype.setGameIFrame = function () {
  if (gCreator.currGameSettings.game.type == null) {
    return;
  }
  var currGameLoc = gCreator.getGameLoc();
  if (currGameLoc == null) {
    return;
  }
  var onLoadFunct = null, loadLoc = null;
  switch (gCreator.currGameSettings.game.type) {
    case "cached":
      loadLoc = currGameLoc;
      onLoadFunct = function (event) {
        gCreator.setGameCanvasMessage();
        gCreator.gameIFrame.removeEventListener("load", onLoadFunct);
      }
      break;
    case "remote":
      loadLoc = "https://openconsole-games.github.io/Games/_GenericGameLoader/index.html";
      var remoteGameLoc = currGameLoc;
      var messageToSend = {"type":"SetGame", "loc": remoteGameLoc, "canvasId": gCreator.currGameSettings.canvas.id };
      onLoadFunct = function (event) {
        gCreator.gameIFrame.contentWindow.postMessage(messageToSend, "*");
        gCreator.gameIFrame.removeEventListener("load", onLoadFunct);
      }
      break;
    case "unity":
      loadLoc = "https://openconsole-games.github.io/Games/_GenericUnityLoader/index.html";
      var remoteGameLoc = currGameLoc;
      var messageToSend = {"type":"SetUnityGame", "loc": remoteGameLoc, "corsProxy": gCreator.corsProxy };
      onLoadFunct = function (event) {
        gCreator.setGameCanvasMessage();
        gCreator.gameIFrame.contentWindow.postMessage(messageToSend, "*");
        gCreator.gameIFrame.removeEventListener("load", onLoadFunct);
      }
      break;
  }
  if (loadLoc == null) {
    return;
  }
  gCreator.gameIFrame.setAttribute("frameborder", "1");
  gCreator.gameIFrame.addEventListener("load", onLoadFunct);
  gCreator.gameIFrame.src = loadLoc;
}

var gCreator = new GameCreator();
gCreator.initialize();
