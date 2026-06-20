(function () {
  function preparePlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-button');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-hls');
    var sourceTag = video.querySelector('source');
    if (!source && sourceTag) {
      source = sourceTag.getAttribute('src');
    }
    if (source) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('playing');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('playing');
    });

    video.addEventListener('ended', function () {
      shell.classList.remove('playing');
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(preparePlayer);
})();
