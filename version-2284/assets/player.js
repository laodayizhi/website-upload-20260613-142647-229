import { H as Hls } from './hls-vendor-DrU42sTK.js';

export function setupPlayer(config) {
  var root = document.querySelector(config.root);

  if (!root) {
    return;
  }

  var video = root.querySelector('video');
  var button = root.querySelector('[data-play-button]');
  var source = config.source;
  var loaded = false;

  function attachSource() {
    if (!video || loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    attachSource();
    root.classList.add('playing');

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        root.classList.remove('playing');
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  root.addEventListener('click', function (event) {
    if (event.target === video) {
      return;
    }

    if (!root.classList.contains('playing')) {
      playVideo();
    }
  });
}
