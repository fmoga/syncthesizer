var fs = require('fs'),
    util = require('util');

function index(req, res) {
  var files =  fs.readdirSync('public/audio');
  var audioFiles = [];
  for (i in files) {
    audioFiles.push({
      name: files[i],
      url: '/public/audio/' + encodeURIComponent(files[i])
    });
  }
  res.render('index', {audioFiles: audioFiles});
}

exports.index = index
