var BUFFER = 1000; // 1 min

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

$(document).ready(function() {
  socket = io.connect();

  socket.on('connect', function() {
  });

  socket.on('play', function(data) {
    if (!threeSixtyPlayer.lastSound || threeSixtyPlayer.lastSound.url !== data.url) {
      loadTrack(data.url);
    }
    if (threeSixtyPlayer.lastSound.duration + BUFFER < data.pos) {
      socket.emit('play', data);
    } else {
      threeSixtyPlayer.lastSound.setPosition(data.pos); 
      if (threeSixtyPlayer.lastSound.paused) {
        threeSixtyPlayer.lastSound.play();
      }
    }
  });

  socket.on('pause', function() {
    threeSixtyPlayer.lastSound.pause();
  });

  $('li a').click(function() {
    socket.emit('play', {
      url: $(this).attr('url'),
      pos: 0
    });
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
      sendPlayUpdate();
    }
    threeSixtyPlayer.lastSound.onplay = function() {
      sendPlayUpdate();
    }
    threeSixtyPlayer.lastSound.onpause = function() {
      sendPause();
    }
    threeSixtyPlayer.lastSound.finished = false;
  }
});

function sendPlayUpdate() {
  socket.emit('play', {
    url: threeSixtyPlayer.lastSound.url,
    pos: threeSixtyPlayer.lastSound.position,
  });
}

function sendPause() {
  socket.emit('pause');
}
