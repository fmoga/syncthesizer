var position_requested = false;
var nextSync;

$(document).ready(function() {
  socket = io.connect();
  audio = document.getElementById('player');

  $('audio').bind('play', function() {
    console.log('Sending play...');
    socket.emit('play', audio.currentTime);
  });

  $('audio').bind('pause', function() {
    console.log('Sending pause...');
    socket.emit('pause');
  });

  $('audio').bind('seeked', function(event) {
    // do not emit if previously received position event
    if (!position_requested) {
      console.log('Sending new position...');
      socket.emit('position', audio.currentTime);
    } else {
      position_requested = false;
    }
  });

  socket.on('connect', function() {
  });

  socket.on('load', function(url) {
    console.log('Received load: ' + url);
    audio.src = url;
  });

  socket.on('play', function() {
    console.log('Received play');
    audio.play();
  });

  socket.on('pause', function() {
    console.log('Received pause');
    audio.pause();
  });

  socket.on('position', function(newPos) {
    position_requested = true;
    audio.currentTime = newPos;
  });

  socket.on('ping', function(data) {
    socket.emit('pong', data);
  });

  socket.on('sync', function(data) {
    clearTimeout(nextSync);    
    console.log('Scheduling sync in ' + data.timeout);
    nextSync = setTimeout(function() {
      console.log('Executing sync at ' + data.pos);
      position_requested = true;
      audio.currentTime = data.pos;
    }, data.timeout); 
  });

  $('li a').click(function() {
    console.log('Sending load...');
    socket.emit('load', $(this).attr('url'));
  });
});
