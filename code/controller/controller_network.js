const NO_PONG_TIMEOUT = 2000;

function Network() {
  this.lastPeerId = null;
  this.peer = null;
  this.conn = null;
  this.currentGame = null;
}
/**
 * Create the Peer object for our end of the connection.
 *
 * Sets up callbacks that handle any events related to our
 * peer object.
 */
Network.prototype.initialize = function() {
  // Create own peer object with connection to shared PeerJS server
  playerNet.peer = new Peer(null, {
    debug: 2
  });
  playerNet.peer.on('open', function () {
    // Workaround for peer.reconnect deleting previous id
    if (playerNet.peer.id === null) {
      console.log('Received null id from peer open');
      playerNet.peer.id = playerNet.lastPeerId;
    } else {
      playerNet.lastPeerId = playerNet.peer.id;
    }
    console.log('ID: ' + playerNet.peer.id);
  });
  playerNet.peer.on('disconnected', function () {
    console.log('Connection lost. Trying to reconnect');
    // Workaround for peer.reconnect deleting previous id
    playerNet.peer.id = playerNet.lastPeerId;
    playerNet.peer._lastServerId = playerNet.lastPeerId;
    playerNet.peer.reconnect();
  });
  playerNet.peer.on('close', function() {
    playerNet.conn = null;
    console.log('Connection destroyed');
  });
  playerNet.peer.on('error', function (err) {
    console.log(err);
    console.log(err.type);
    if (err.type == "peer-unavailable") {
      if (playerNet.connectingFirstTime) {
        metaCtrl.invalidId();
      } else {
        ctrlApi.setGame("");
        metaCtrl.enableConnect();
      }
    }
    else if (err.type == "network") {
      //metaCtrl.enableConnect();
      //if(playerNet.conn && !playerNet.conn.open) {
        //playerNet.conn = null;
      //}
    } else {
      alert('' + err);
    }
  });
}

/**
 * Send a signal via the peer connection and add it to the log.
 * This will only occur if the connection is still alive.
 */
Network.prototype.signal = function (message) {
  if (playerNet.conn && playerNet.conn.open) {
    playerNet.conn.send(message);
    console.log(message);
  }
}

/**
 * All the possible messages we can send.
 */
Network.prototype.sendPing = function(i) {
  if (playerNet.conn === null || !playerNet.conn.open) return;
  const sendPong = (i % (NO_PONG_TIMEOUT / 400)) === 0;
  const expectPong = (i % (2 * NO_PONG_TIMEOUT / 100)) === 0;
  const message = { "type": "Ping", "sendPong": sendPong };
  if (expectPong) { playerNet.gotPong = false; }
  playerNet.signal(JSON.stringify(message));
  if (expectPong) {
    setTimeout(() => {
      if (!playerNet.gotPong) {
        console.log("Reconnecting because didn't get back pong!");
        playerNet.closeConnection();
      }
    }, NO_PONG_TIMEOUT);
  }
  setTimeout(playerNet.sendPing.bind(this, (i + 1) % (NO_PONG_TIMEOUT/100 + 5)), 100);
}
Network.prototype.sendDisconnect = function() {
  var message = { "type":"Disconnect" };
  playerNet.signal(JSON.stringify(message));
}
Network.prototype.sendKey = function (keyPress) {
  // Used EXTERNALLY
  var message = { "type":"KeyPress", "press":keyPress };
  playerNet.signal(JSON.stringify(message));
}
Network.prototype.sendCustomMessage = function (message) {
  // Used EXTERNALLY
  message.type = "Custom";
  playerNet.signal(JSON.stringify(message));
}
Network.prototype.sendControlMessage = function (message) {
  // Used EXTERNALLY
  message.type = "Control";
  playerNet.signal(JSON.stringify(message));
}
Network.prototype.quitGame = function() {
  // Used EXTERNALLY
  var gameSelect = "_ChooseGame";
  if (playerNet.currentGame && playerNet.currentGame != gameSelect) {
    //playerNet.currentGame = null;
    //ctrlApi.setGame(""); // TODO: maybe this breaks stuff/slows down change
    var message = { "type":"SetGame", "name":gameSelect };
    playerNet.signal(JSON.stringify(message));
  }
}

/**
 * Disconnect from console
 */
Network.prototype.closeConnection = function() {
  if (playerNet.conn) {
    playerNet.conn.close(); 
  }
}
Network.prototype.disconnect = function() {
  // Used EXTERNALLY
  if (playerNet.conn) {
    playerNet.conn.wantToDisconnect = true;
    playerNet.sendDisconnect();
    setTimeout(function() {
      playerNet.closeConnection();
    }, 500);
  }
}

/**
 * Create the connection to console Peer.
 *
 * Sets up callbacks that handle any events related to the
 * connection and data received on it.
 */
Network.prototype.isConnReady = function () {
  // Used EXTERNALLY
  return playerNet.peer != null && !playerNet.peer.disconnected;
}
Network.prototype.connect = function (id) {
  // Used EXTERNALLY
  if (id.length < 4)
    return 0;
  var idA = parseInt(id.substr(0, id.length-3));
  var idB = parseInt(id.substr(id.length-3, id.length));
  var idB2 = Math.floor(idB/100);
  var checksum = (idB2 + Math.floor(idB/10) + idB) % 10;
  if (checksum != 3 || idB2 == 0 || idA < 10)
    return 0;
  var connId = utils.getId(idA, idB);
  playerNet.connectingFirstTime = true;
  playerNet.netConnect(connId);
  return 1;
}
Network.prototype.netConnect = function (peerjsId) {
  // Create connection to destination peer specified in the input field
  playerNet.conn = playerNet.peer.connect(peerjsId, {
    reliable: true,
    metadata: player
  });
  playerNet.conn.on('open', function () {
    metaCtrl.connected();
    playerNet.conn.wantToDisconnect = false;
    console.log("Connected to: " + playerNet.conn.peer);
    // Handle incoming data (messages only since playerNet is the signal sender)
    playerNet.conn.on('data', function (data) {
      playerNet.handleMessage(JSON.parse(data));
    });
    playerNet.conn.on('close', function () {
      if (playerNet.conn.wantToDisconnect === null || playerNet.conn.wantToDisconnect) {
        playerNet.conn = null;
        ctrlApi.setGame("");
        metaCtrl.enableConnect();
      } else {
        playerNet.conn = null;
        playerNet.connectingFirstTime = false;
        var reconnectToPeer = function() {
          if (!playerNet.peer.disconnected) {
            playerNet.netConnect(peerjsId);
          }
          else {
            setTimeout(reconnectToPeer, 500);
          }
        }
        reconnectToPeer();
      }
    });
    playerNet.sendPing(0);
  });
}
    
Network.prototype.handleMessage = function (message) {
  switch (message.type) {
    case 'Disconnect':
      playerNet.closeConnection();
      break;
    case 'Pong':
      playerNet.gotPong = true;
      break;
    case 'SetGame':
      playerNet.currentGame = message.name;
      ctrlApi.setGame(message.controllerLoc);
      ctrlApi.setControllerLayout(message.keymap);
      break;
    case 'SetControllerLayout':
      ctrlApi.setControllerLayout(message.keymap);
      break;
    case 'Custom':
      ctrlApi.sendCustomMessage(message);
      break;
    default:
      console.log("Unkown message! " + message.type);
      break;
  }
}


var playerNet = new Network();
// Since all our callbacks are setup, start the process of obtaining an ID
playerNet.initialize();
