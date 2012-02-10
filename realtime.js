var io = require('socket.io'),
    express = require('express'),
    config = require('./config'),
    parseCookie = require('connect').utils.parseCookie,
    util = require('util');

var online = {};

function broadcast(type, body) {
  for (id in online) {
    if (online[id].disconnected) {
      delete online[id]; 
    } else {
      online[id].emit(type, body);
    }
  }
}

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

    socket.on('play', function(data) {
      console.log('play: ' + util.inspect(data));
      broadcast('play', data);
    });
    socket.on('pause', function() {
      console.log('pause');
      broadcast('pause');
    });
  });
}

exports.init = init
