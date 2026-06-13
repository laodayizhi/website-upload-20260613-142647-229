function setupMoviePlayer(streamUrl) {
  var video = document.querySelector('.movie-video');
  var overlay = document.querySelector('.play-overlay');
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function bindStream() {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    video.setAttribute('data-ready', '1');
  }

  function playVideo() {
    bindStream();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.setAttribute('controls', 'controls');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.getAttribute('data-ready') !== '1') {
      playVideo();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
