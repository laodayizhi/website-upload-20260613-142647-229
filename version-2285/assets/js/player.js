(function () {
  function bootPlayer(shell) {
    var video = shell.querySelector('video');
    var curtain = shell.querySelector('.video-curtain');
    var stream = shell.getAttribute('data-stream');
    var hls = null;
    var loaded = false;

    if (!video || !curtain || !stream) {
      return;
    }

    function attachStream() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function playVideo() {
      attachStream();
      curtain.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    curtain.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
      if (!loaded) {
        playVideo();
      }
    });

    video.addEventListener('ended', function () {
      curtain.classList.remove('is-hidden');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bootPlayer);
})();
