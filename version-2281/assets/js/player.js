var StarPlayer = (function() {
    function mount(video, cover, streamUrl) {
        if (!video || !cover || !streamUrl) {
            return;
        }

        var hlsInstance = null;
        var prepared = false;

        function prepare() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            }
        }

        function start() {
            prepare();
            cover.classList.add('is-hidden');
            var playRequest = video.play();

            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(function() {
                    cover.classList.remove('is-hidden');
                });
            }
        }

        cover.addEventListener('click', start);
        video.addEventListener('click', function() {
            if (!prepared || video.paused) {
                start();
            }
        });
        video.addEventListener('play', function() {
            cover.classList.add('is-hidden');
        });
        video.addEventListener('ended', function() {
            cover.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    return {
        mount: mount
    };
}());
