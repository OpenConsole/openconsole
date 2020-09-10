function Player() {
  this.lastServer = null;
  this.name = null;
  this.nameSet = false;
}
Player.prototype.chooseRandomName = function() {
  const names = ["Xerxes","Kane","Shoshana","Wing","Mohammad","Sydney","Keefe","Nicole","Malik","Carson","Seth","Hashim","Fritz","Rafael","Melodie","Phelan","Axel","Mufutau","Cameron","Gannon","Hamish","Sydnee","Glenna","Chaim","Beverly","Devin","Florence","Addison","Upton","Barbara","Patrick","Reese","Naomi","Berk","Caryn","Avram","Ruby","Guinevere","Kennedy","Zeus","Lewis","Xenos","Armando","Gannon","Ashton","Coby","Samuel","Lewis","Armand","Illiana","Ali","Nigel","Macey","Sophia","Bernard","Stephanie","Rachel","Gail","Merritt","Eugenia","Isabelle","Irma","Quynn","Orson","Madeson","Jermaine","Mary","Hall","Otto","Mona","Camille","Andrew","Maris","Ray","Nina","Tanek","Vanna","Tate","Cleo","Briar","Rafael","Hunter","Ian","Caldwell","Felicia","Brock","Odysseus","Tate","Amber","Yvette","Kristen","Giselle","Neil","Noble","Octavia","Uriah","Chiquita","Taylo","Chiquita","Taylor","Rahim","Lana"];
  player.defaultName = names[Math.floor(Math.random() * names.length)];
}

Player.prototype.save = function() {
  save_object("Player", player);
}
Player.prototype.load = function() {
  var oldPlayer = load_object("Player");
  if (!oldPlayer) return;
  player.lastServer = oldPlayer.lastServer;
  player.name = oldPlayer.name;
  if (oldPlayer.nameSet != null) player.nameSet = oldPlayer.nameSet;
}

Player.prototype.initialize = function() {
  player.load();
  player.chooseRandomName();
  if (!player.nameSet) {
    player.name = player.defaultName;
  }
  if (player.lastServer != null) {
    metaCtrl.setIdText(player.lastServer);
  }
  var playerNameInput = document.getElementById("name-code");
  if (player.nameSet) {
    metaCtrl.setText(playerNameInput, "&lrm;" + player.name);
  }
  else {
	  metaCtrl.setPlaceholder(playerNameInput, "e.g. " + player.name);
  }
}

Player.prototype.getRealName = function() {
  if (player.nameSet) {
    return player.name;
  }
  else {
    return "";
  }
}
Player.prototype.updatePlayerName = function (newName) {
  var playerNameInput = document.getElementById("name-code");
  if (newName == "") {
    player.nameSet = false;
    player.name = player.defaultName;
	  metaCtrl.setPlaceholder(playerNameInput, "e.g. " + player.name);
  }
  else {
    if (/\s/.test(newName.charAt(0))) return; // First letter cannot be space
    if (newName.length >= 2 && !/\S/.test(newName.slice(-2))) return; // Last two letters cannot be spaces
    if (newName.length >= 10) return;
    player.name = newName;
    player.nameSet = true;
    metaCtrl.setText(playerNameInput, "&lrm;" + player.name);
  }
  player.save();
}

Player.prototype.updateLastId = function(id) {
  player.lastServer = id;
  player.save();
}

var player = new Player();
player.initialize();