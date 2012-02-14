var util = require('util'),
    exec = require('child_process').exec;

function index(req, res) {
  exec('find public/audio -type f', function(err, stdout, stderr) {
    var files = stdout.split('\n');
    files = files.filter(function(x) { return x !== ''; });
    var audioFiles = [];
    for (i in files) {
      fullName = files[i].substring(0, files[i].lastIndexOf('.'));
      fullName = fullName.substring(fullName.lastIndexOf('/') + 1);
      dash = fullName.lastIndexOf('-');
      if (dash == -1) {
        artist = 'Unknown Artist';
        title = fullName;
      } else {
        artist = fullName.substring(0, dash);
        title = fullName.substring(dash + 1);
      }
      audioFiles.push({
        artist: artist,
        title: title,
        url:'/' + files[i]
      });
    }
    res.render('index', {audioFiles: audioFiles.sort(function(a, b) {
      return strcmp(a.artist, b.artist);
    })});
  });
}

function strcmp(a, b) {   
  return (a<b?-1:(a>b?1:0));  
}

exports.index = index
