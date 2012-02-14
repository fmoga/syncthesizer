var PLAYING = 'Now playing';
var PAUSED = 'Paused';
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

  socket.on('load', function(data) {
    console.log('Received load: ' + data.url);
    $('#nowplaying .title').text(data.artist + ' - ' + data.title);
    $('#nowplaying .status').text(PLAYING);
    audio.src = data.url;
  });

  socket.on('play', function() {
    console.log('Received play');
    $('#nowplaying .status').text(PLAYING);
    audio.play();
  });

  socket.on('pause', function() {
    console.log('Received pause');
    $('#nowplaying .status').text(PAUSED);
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
    socket.emit('load', {
      url: $(this).attr('url'),
      artist: $(this).find('.artist').text(),
      title: $(this).find('.title').text()
    });
    return false;
  });

  $('#search').keyup(function() {
    var searchText = $(this).val().toLowerCase();
    $('ul#songs li').each(function() {
      var title = $(this).find('.title').text().toLowerCase();
      var artist = $(this).find('.artist').text().toLowerCase();
      if (title.indexOf(searchText) > -1 || artist.indexOf(searchText) > -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });

  $('#search').focus();
});
