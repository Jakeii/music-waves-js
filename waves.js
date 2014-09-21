(function(document, window, SC){
  Musicwave = function() {
    this.amplitude = 200;

    this.escapeRegexes = {
      "&amp;": /&/g,
      "&lt;": /</g,
      "&gt;": />/g,
      "&quot;": /"/g,
      "&#39;": /'/g,
    };

    this.escapeKeys = Object.keys(this.escapeRegexes);
    document.getElementById('status').innerHTML = "Fetching Track Data...";
    SC.get("/tracks/144638044", function(track){
      this.waveform = new Waveform({
        container: document.getElementById("waveform"),
        innerColor: "#333"
      });

      this.desiredWaveformLength = 1200;
      this.positionToUpdateInterval = track.duration / this.desiredWaveformLength;
      //this.desiredWaveformLength = track.duration;
      //this.positionToUpdateInterval = 1;
      this.nextPositionToUpdate = this.positionToUpdateInterval;

      this.waveform.dataFromSoundCloudTrack(track);

      var streamOptions = this.waveform.optionsForSyncedStream();


      SC.whenStreamingReady(function() {
        SC.stream(track.uri, streamOptions, function(stream){
          this.stream = stream;    
          console.log('stream loaded');  
        }.bind(this));
      }.bind(this));

    }.bind(this));
  }

  Musicwave.prototype.renderLines = function(data) {
    this.lines = this.genLines(data);

    var text = this.lines.join('<br>');
    document.getElementById("left").innerHTML = text;
    document.getElementById("right").innerHTML = text;

    document.getElementById('status').innerHTML = "Done! <a onclick=\"musicwave.play();\" href=\"#\">&#9658; Play</a> <a onclick=\"musicwave.pause();\" href=\"#\">&#9616;&#9616; Pause</a>";
  }

  Musicwave.prototype.play = function() {
    this.stream.play();
  }
  Musicwave.prototype.pause = function() {
    this.stream.pause();
  }
  Musicwave.prototype.genLines = function(data) {
    var waveData = this.waveform.interpolateArray(data, this.desiredWaveformLength);
    var length = 0,
        x = 0,
        i, words, lines, word, text;

    document.getElementById("left").innerHTML = "";
    words = content.split(/\s/);
    lines = [];

    for (i = 0; i < waveData.length; i++) {
      document.getElementById('status').innerHTML = "Rendering text as waveform (" + ((i/waveData.length)*100).toFixed() + "%)";
      if (!lines[i]) {
        lines[i] = '';
      }

      while(length < (waveData[i] * this.amplitude)) {
        word = this.clean(words[x]) + '&nbsp;';
        lines[i] += word;
        length += word.length;
        x++;
        if(x === words.length) x = 0;
      }

      length = 0;
    }
    return lines;
  }

  Musicwave.prototype.update = function(stream) {
    if(stream.position > this.nextPositionToUpdate){
      this.lines.shift();
      var text = this.lines.join('<br>');
      document.getElementById("left").innerHTML = text;
      document.getElementById("right").innerHTML = text;
      this.nextPositionToUpdate = this.nextPositionToUpdate + this.positionToUpdateInterval;
    }
  }

  Musicwave.prototype.clean = function(word) {
    this.escapeKeys.forEach(function (key) {
      word = word.replace(this.escapeRegexes[key], key);
    }.bind(this));
    return word;
  }

  window.Musicwave = Musicwave;

})(document, window, SC);
