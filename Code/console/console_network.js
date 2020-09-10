function Network() {
  this.lastPeerId = null;
  this.peer = null;
  this.conns = new Array();
  window.setInterval(this.checkTimeout, 2500);
  /**
   * Maybe can show more people on same line after resize
   */
  window.addEventListener('resize', this.showConnections);
  this.a = null;
  this.b = null;
}

/**
 * Reload PeerJS script if it failed
 */
Network.prototype.peerjsLoadError = function() {
  console.log("PeerJS not loaded, retrying");
  var oldScript = document.getElementById("peerjsScript");
  var newScript = document.createElement('script');
  newScript.onload = consoleNet.initialize;
  newScript.onerror = function() {
      setTimeout(consoleNet.peerjsLoadError, 2000);
  }
  newScript.id = "peerjsScript";
  newScript.src = oldScript.src;
  oldScript.parentNode.removeChild( oldScript );
  document.body.appendChild(newScript);
}
/**
 * Create the Peer object for our end of the connection.
 *
 * Sets up callbacks that handle any events related to our
 * peer object.
 */
Network.prototype.loadPreviousAB = function() {
  var prevAB = load_object('prevAB');
  if (prevAB == null) return 0;

  consoleNet.a = prevAB.a;
  consoleNet.b = prevAB.b;
  return 1;
}
Network.prototype.generateRandomAB = function() {
    consoleNet.a = Math.floor(Math.random() * 990) + 10;
    var b1 = Math.floor(Math.random() * 9) + 1, b2 = Math.floor(Math.random() * 10), b3 = (23 - b1 - b2) % 10;
    consoleNet.b = b1 * 100 + b2 * 10 + b3;
}
Network.prototype.saveAB = function(a, b) {
  save_object('prevAB', {"a":a, "b":b });
}
Network.prototype.initialize = function() {
  if(typeof Peer == "undefined") {
    peerjsLoadError();
    return;
  }
  if(consoleNet.loadPreviousAB() == 0) {
    consoleNet.generateRandomAB();
  }
  consoleNet.createPeer();
}
Network.prototype.createPeer = function() {
  var myId = getId(consoleNet.a, consoleNet.b);
  // Create own peer object with connection to shared PeerJS server
  consoleNet.peer = new Peer(myId, {
    host: 'peerjs-openconsole.herokuapp.com',
    secure: true,
    debug: 2
  });
  consoleNet.peer.consoleState = 0;
  consoleNet.peer.on('open', function (id) {
    // Workaround for peer.reconnect deleting previous id
    if (consoleNet.peer.id === null) {
        consoleNet.peer.id = consoleNet.lastPeerId;
    } 
    else {
        consoleNet.lastPeerId = consoleNet.peer.id;
    }
    console.log('ID: ' + consoleNet.peer.id);
    consoleNet.peer.consoleState = 3;
    consoleNet.saveAB(consoleNet.a, consoleNet.b);
    metaConsole.displayServerInfo(consoleNet.a, consoleNet.b);
  });
  consoleNet.peer.on('connection', function (c) {
    consoleNet.setupController(c);
  });
  var lastDC = 0;
  consoleNet.peer.on('disconnected', function () {
    console.log('Disconnected from PeerNet, reconnecting.');
    // Workaround for peer.reconnect deleting previous id
    consoleNet.peer.id = consoleNet.lastPeerId;
    consoleNet.peer._lastServerId = consoleNet.lastPeerId;
    consoleNet.peer.reconnect();
    // If don't dc in next 3.5s hide network error
    metaConsole.displayNoInternet();
    var nowTime = Date.now();
    lastDC = nowTime
    setTimeout(function() { if(lastDC == nowTime) metaConsole.hideNoInternet(); }, 2500);
  });
  consoleNet.peer.on('close', function() {
    switch (consoleNet.peer.consoleState) {
      case 3:
        consoleNet.conns = null;
        metaConsole.connectionDestroyed();
        console.log('Connection destroyed');
        break;
      case 1:
        consoleNet.generateRandomAB();
        consoleNet.createPeer();
        break;
    }
  });
  consoleNet.peer.on('error', function (err) {
    console.log(err);
    console.log(err.type);
    switch (err.type) {
      case 'network':
        //if(consoleNet.peer.open) {
          //metaConsole.displayNoInternet();
        //}
        break;
      case 'unavailable-id':
        consoleNet.peer.consoleState = 1;
        break;
    }
  });
}

/**
 * Triggered once a connection has been achieved.
 * Defines callbacks to handle incoming data and connection events.
 */
 Network.prototype.setupController = function (conn) {
  conn.on('open', function() {
    conn.isActive = 6;
    conn.id = consoleNet.getMinimalId();
    consoleNet.conns.push(conn);
    
    console.log("Connected to: " + conn.peer);
    consoleNet.showConnections();
    consoleNet.sendConnsToGame();
    consoleNet.setContollerGame(conn);
  });
  conn.on('data', function (data) {
    consoleNet.handleMessage(conn, JSON.parse(data));
  });
  conn.on('close', function () {
    console.log("Disconnected " + conn.peer);
    consoleNet.conns = consoleNet.conns.filter(c => c !== conn);
    var maxPlayers = gamesCtrl.getMaxPlayers();
    if (conn.id != null && maxPlayers != null) {
      var oldConnId = conn.id;
      var connToChange = consoleNet.conns.find(c => c.id >= maxPlayers && c.id > oldConnId);
      while (connToChange != null) {
        var tempId = connToChange.id;
        connToChange.id = oldConnId;
        oldConnId = tempId;
        if (connToChange.id < maxPlayers) {
          consoleNet.setControllerLayout(connToChange);
        }
        var connToChange = consoleNet.conns.find(c => c.id >= maxPlayers && c.id > oldConnId);
      }
    }
    consoleNet.showConnections();
    consoleNet.sendConnsToGame();
    conn = null;
  });
  /*
  setTimeout(function() { 
    if(conn && !conn.open) {
      conn = null;
    }
  }, 3000);*/
}
Network.prototype.getMinimalId = function (initialMinId) {
  var newId = initialMinId || 0;
  while(consoleNet.conns.filter(conn => conn.id == newId).length > 0) {
    newId += 1;
  }
  return newId;
}
Network.prototype.handleMessage = function (conn, message) {
  switch (message.type) {
    case 'KeyPress':
      gamesCtrl.simulateButton(message.press.keyId, conn.id, message.press.upDown, message.press.pressId);
      break;
    case 'SetGame':
      console.log("Received: " + message.name);
      gamesCtrl.setGame(message.name);
      break;
    case 'Disconnect':
      console.log("Controller disconnected " + conn.id);
      if(conn.open) {
          conn.close();
      }
      break;
    case 'Pong':
      conn.isActive = 3;
      break;
    case 'Custom':
      gamesCtrl.sendCustomMessage(conn.id, message);
      break;
    default:
      console.log("Received unknown! " + message);
      break;
  }
}
/**
 * Check for dead connections
 */
Network.prototype.resetPlayerIds = function () {
  var minId = consoleNet.getMinimalId();
  for (i = 0; i < consoleNet.conns.length; i++) {
    if(consoleNet.conns[i].id > minId) {
      consoleNet.conns[i].id = minId;
      minId = consoleNet.getMinimalId(minId);
    }
  }
  consoleNet.showConnections();
  consoleNet.sendConnsToGame();
}
/**
 * Check for dead connections
 */
Network.prototype.connectionCheck = function (conn) {
  if (conn.isActive == 0) {
    console.log("Timed out " + conn.peer);
    consoleNet.sendDisconnect(conn);
    setTimeout(function() { 
      if(conn && conn.open)
        conn.close();
    }, 500);
  }
  else {
    consoleNet.sendPing(conn);
    conn.isActive -= 1; 
  }
}
Network.prototype.checkTimeout = function() {
  consoleNet.conns.forEach(consoleNet.connectionCheck);
  consoleNet.showConnections(); // TODO: why do connections sometimes disappear
}

/**
 * Send any message to connection conn
 */
Network.prototype.signal = function (conn, message) {
  if (conn && conn.open) {
    conn.send(message);
    console.log(message);
  }
}

/**
 * All the possible messages we can send.
 */
Network.prototype.setContollerGame = function (conn) {
  var ctrl = gamesCtrl.getControllerForCurrentGame(conn.id);
  if(!ctrl) return;
  
  var message = { "type":"SetGame", "name":ctrl.name, "controllerLoc":ctrl.loc, "keymap":ctrl.keymap };
  consoleNet.signal(conn, JSON.stringify(message));
}
Network.prototype.setControllerLayout = function (conn) {
  var ctrl = gamesCtrl.getControllerForCurrentGame(conn.id);
  if(!ctrl) return;
  
  var message = { "type":"SetControllerLayout", "keymap":ctrl.keymap };
  consoleNet.signal(conn, JSON.stringify(message));
}
Network.prototype.sendPing = function (conn) {
  var message = { "type":"Ping" };
  consoleNet.signal(conn, JSON.stringify(message));
}
Network.prototype.sendDisconnect = function (conn) {
  var message = { "type":"Disconnect" };
  consoleNet.signal(conn, JSON.stringify(message));
}

Network.prototype.setContollerGameAll = function() {
  // Used EXTERNALLY
  consoleNet.conns.forEach(consoleNet.setContollerGame);
}
Network.prototype.sendCustomMessage = function (message) {
  // Used EXTERNALLY
  if (message.to != null) {
    var conn_to = consoleNet.conns.find(conn => conn.id == message.to);
    if (conn_to != null) {
	    consoleNet.signal(conn_to, JSON.stringify(message));
    }
  } else {
    consoleNet.conns.forEach(conn => consoleNet.signal(conn, JSON.stringify(message)));
  }
}



Network.prototype.sendConnsToGame = function() {
  gamesCtrl.sendPlayersToGame(consoleNet.conns);
}
Network.prototype.showConnections = function() {
  metaConsole.displayPlayers(consoleNet.conns);
}

var consoleNet = new Network();
// Since all our callbacks are setup, start the process of obtaining an ID
consoleNet.initialize();