# Syncthesizer

Syncthesizer offers a web interface for listening tracks in a music library synchronizing sound on all connected browsers. It is written using [node.js][2] and websockets support in [socket.io][3]. It relies on HTML5 audio support in browsers to minimize differences between playback on different operating systems (as it happens with Flash). Mainly tested with Google Chrome.

### Features

* Listen to music from multiple browsers simultaneously in sync
* All browsers sync on track change, play, pause, seek operations
* Tracklist, player and search interface 
* Symbolic links to music folders can be used to add tracks to library

### Installation

* Install [node.js][2] and [npm][4]
* Run `npm install`
* Create symlinks to folders containing audio files in the `public/audio` folder
* Run `node app.js`
* Open multiple browsers at `http://<server host>:8000`

### Notes

For sloppy sound in Ubuntu, try adding `tsched=0` in `/etc/pulse/default.pa` on line:
    
    load-module module-udev-detect tsched=0

Reference: [http://askubuntu.com/questions/6655/choppy-audio-video-playback-experience][1]

[1]: http://askubuntu.com/questions/6655/choppy-audio-video-playback-experience
[2]: http://nodejs.org/
[3]: http://socket.io/
[4]: http://npmjs.org/
