function setupMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var trigger = document.querySelector("[data-play-trigger]");
  var initialized = false;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (initialized) {
      return;
    }
    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    attachSource();
    if (trigger) {
      trigger.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (trigger) {
          trigger.classList.remove("is-hidden");
        }
      });
    }
  }

  if (trigger) {
    trigger.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (trigger) {
      trigger.classList.add("is-hidden");
    }
  });
}
