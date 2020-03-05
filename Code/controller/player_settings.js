function Player() {
  this.lastServer = null;
  this.name = null;
  this.nameSet = false;
}
Player.prototype.chooseRandomName = function() {
  const names = ["Xerxes","Kane","Shoshana","Wing","Mohammad","Sydney","Keefe","Nicole","Malik","Carson","Seth","Hashim","Fritz","Rafael","Melodie","Phelan","Axel","Mufutau","Cameron","Gannon","Hamish","Sydnee","Glenna","Chaim","Beverly","Devin","Florence","Addison","Upton","Barbara","Patrick","Reese","Naomi","Berk","Caryn","Avram","Ruby","Guinevere","Kennedy","Zeus","Lewis","Xenos","Armando","Gannon","Ashton","Coby","Samuel","Lewis","Armand","Illiana","Ali","Nigel","Macey","Sophia","Bernard","Stephanie","Rachel","Gail","Merritt","Eugenia","Isabelle","Irma","Quynn","Orson","Madeson","Jermaine","Mary","Hall","Otto","Mona","Camille","Andrew","Maris","Ray","Nina","Tanek","Vanna","Tate","Cleo","Briar","Rafael","Hunter","Ian","Caldwell","Felicia","Brock","Odysseus","Tate","Amber","Yvette","Kristen","Giselle","Neil","Noble","Octavia","Uriah","Chiquita","Taylo","Chiquita","Taylor","Rahim","Lana"];
  player.name = names[Math.floor(Math.random() * names.length)];
}

Player.prototype.save = function() {
  save_object("Player", player, 1);
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
  if (!player.nameSet) {
    player.chooseRandomName();
  }
  if (player.lastServer != null) {
    metaCtrl.setIdText(player.lastServer);
  }
  var playerNameInput = document.getElementById("name-code");
  if(player.nameSet) {
    metaCtrl.setText(playerNameInput, player.name);
  }
  else {
	  metaCtrl.setPlaceholder(playerNameInput, "e.g. " + player.name);
  }
}

Player.prototype.updateLastId = function(id) {
  player.lastServer = id;
  player.save();
}

var player = new Player();
player.initialize();


  // TODO
  /*
  var updatePlayerName = function() {
    if(playerNameInput.value != "") {
      player.name = playerNameInput.value;
      player.nameSet = true;
      bake_cookie("Player", player, 1);
    }
  }*/