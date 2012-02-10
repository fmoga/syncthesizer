var INITIAL_TIMEOUT = 2000; // 1 sec
var LIMIT_TIMEOUT = 10000; // 10 sec
var EPSILON = 50; // 50 ms
var _master = false;
var timer;
var timeout;
var socket;

soundManager.url = '/public/soundManager/swf/';
soundManager.flashVersion = 9;
soundManager.useFlashBlock = false;
soundManager.waitForWindowLoad = true;
soundManager.setVolume(100);
soundManager.ontimeout(function() {
  alert("Error was encountered when loading the player");
});
soundManager.onready(function() {
});
// threeSixtyPlayer.config.autoPlay = true;
// threeSixtyPlayer.config.useEQData = true;
// threeSixtyPlayer.config.useWaveformData = true;
// threeSixtyPlayer.config.waveformDataLineRatio = 0;
threeSixtyPlayer.onfinish = function() {
  threeSixtyPlayer.lastSound.finished = true;
}

function setMaster() {
  document.title = 'master';
  _master = true;
  if (timer) clearTimeout(timer);
  timeout = INITIAL_TIMEOUT;
  timer = setTimeout(sync, timeout);
}

function isMaster() {
  return _master;
}

function sync() {
  sendPlayUpdate();
  timeout = 2 * timeout;
  if (timeout < LIMIT_TIMEOUT) {
    timer = setTimeout(sync, timeout);
  }
}

function setSlave() {
  document.title = 'slave';
  _master = false;
  if (timer) clearTimeout(timer);
}

$(document).ready(function() {
  socket = io.connect();

  socket.on('connect', function() {
  });

  socket.on('play', function(data) {
    if (isMaster() && data.master !== socket.socket.sessionid) {
      setSlave();
    }
    if (!threeSixtyPlayer.lastSound || threeSixtyPlayer.lastSound.url !== data.url) {
      loadTrack(data.url);
    }
    var diff = data.pos - threeSixtyPlayer.lastSound.position;
    console.log('diff: ' + diff);
    if (threeSixtyPlayer.lastSound.duration >= data.pos && !(-EPSILON < diff && diff < EPSILON)) {
      threeSixtyPlayer.lastSound.setPosition(data.pos); 
      if (threeSixtyPlayer.lastSound.paused) {
        threeSixtyPlayer.lastSound.play();
      }
    }
  });

  socket.on('pause', function() {
    setSlave();
    console.log('pause');
    threeSixtyPlayer.lastSound.pause();
  });

  $('li a').click(function() {
    changeTrack($(this).attr('url'));
  });

  function loadTrack(url) { 
    console.log('Loading new track');
    if (threeSixtyPlayer.lastSound) threeSixtyPlayer.lastSound.pause();
    var player = $('.ui360');
    player.empty();
    // break threeSixtyPlayer cache
    player.append('<a href="' + url + '" type="audio/mpeg"></a>');
    threeSixtyPlayer.init();
    threeSixtyPlayer.handleClick({target:threeSixtyPlayer.links[0],preventDefault:function(){}});
    threeSixtyPlayer.lastSound.options.onposition = function(pos) {
      setMaster();
      sendPlayUpdate();
    }
    threeSixtyPlayer.lastSound.onplay = function() {
      setMaster();
      sendPlayUpdate();
    }
    threeSixtyPlayer.lastSound.onpause = function() {
      sendPause();
    }
    threeSixtyPlayer.lastSound.finished = false;
  }
});

function changeTrack(url) {
  setMaster();
  socket.emit('play', {
    url: url,
    pos: 0,
    master: socket.socket.sessionid
  });
}

function sendPlayUpdate() {
  socket.emit('play', {
    url: threeSixtyPlayer.lastSound.url,
    pos: threeSixtyPlayer.lastSound.position,
    master: socket.socket.sessionid
  });
}

function sendPause() {
  socket.emit('pause');
}
