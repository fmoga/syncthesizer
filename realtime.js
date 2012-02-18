var io = require('socket.io'),
    express = require('express'),
    config = require('./config'),
    parseCookie = require('connect').utils.parseCookie,
    util = require('util');

var online = {};
var PING_INTERVAL = 5000; // 5 sec
var SYNC_TIMEOUT = 2000; // 2 sec
var SYNC_POINTS = [1000, 3000, 3000, 3000];
var syncIndex = 0;
var syncPosition = 0;
var syncPromise;

function broadcast(type, body) {
  for (id in online) {
    if (online[id].disconnected) {
      delete online[id]; 
    } else {
      online[id].emit(type, body);
    }
  }
}

function startSync(pos) {
  stopSync();
  syncIndex = -1;
  syncPosition = pos;
  scheduleSync();
}

function scheduleSync() {
  syncIndex++;
  if (syncIndex == SYNC_POINTS.length) 
    return;
  syncPosition += SYNC_POINTS[syncIndex] / 1000;
  stopSync();
  syncPromise = setTimeout(function() {
    sendSync();
  }, SYNC_POINTS[syncIndex]);
}

function sendSync() {
  for (id in online) {
    avg_latency = 0;
    if (online[id].pings) {
      avg_latency = online[id].latency / (2 * online[id].pings);
    }
    online[id].emit('sync', {
      pos: syncPosition + SYNC_TIMEOUT / 1000,
      timeout: SYNC_TIMEOUT - avg_latency
    });
  }
  scheduleSync();
}

function stopSync() {
  clearTimeout(syncPromise);
}

setInterval(function() {
  broadcast('ping', new Date().getTime());
}, PING_INTERVAL);

function init(app, sessionStore) {
  var sio = io.listen(app);
  sio.configure(function(){
    sio.set('log level', config.app.sio.log_level);
    sio.set('transports', config.app.sio.transports);
  });


  // customize authorization to transmit express session to socket.io via handshake data
  sio.set('authorization', function (data, accept) {
    if (data.headers.cookie) {
      data.cookie = parseCookie(data.headers.cookie);
      data.sessionID = data.cookie['express.sid'];
      // (literally) get the session data from the session store
      sessionStore.get(data.sessionID, function (err, session) {
        if (err || !session) {
          // if we cannot grab a session, turn down the connection
          accept('Error', false);
        } else {
          // save the session data and accept the connection
          data.session = session;
          accept(null, true);
        }
      });
    } else {
      return accept('No cookie transmitted.', false);
    }
  });

  sio.sockets.on('connection', function(socket) {
    // get any necessary session data from socket.handshake.session
    online[socket.id] = socket;
    socket.pings = 0;
    socket.latency = 0;
    socket.emit('ping', new Date().getTime());

    socket.on('play', function(pos) {
      console.log('Broadcasting play');
      broadcast('play');
      startSync(pos);
    });

    socket.on('pause', function() {
      console.log('Broadcasting pause');
      stopSync();
      broadcast('pause');
    });

    socket.on('load', function(url) {
      console.log('Broadcasting load of ' + url);
      broadcast('load', url);
      startSync(0);
    });

    socket.on('position', function(pos) {
      console.log('Broadcasting new position of ' + pos);
      broadcast('position', pos);
      startSync(pos);
    });    

    socket.on('pong', function(ts) {
      var current_sample = new Date().getTime() - ts;
      socket.pings++;
      socket.latency += current_sample;
    });

  });
}

exports.init = init
