var express = require('express'),
    config = require('./config'),
    util = require('util'),
    route = require('./route'),
    MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore(),
    realtime = require('./realtime');

var app = express.createServer();
app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    store: sessionStore,
    secret: config.app.sessionKey,
    key: 'express.sid'
  }));
  app.use(app.router);
  app.use(express.favicon(__dirname + '/public/images/ldap-sync.png'));
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use('/public', express.static(__dirname + '/public'));
  app.use(express.errorHandler());
});

route.addRoutes(app);
realtime.init(app, sessionStore);

app.listen(config.server.port);
