(function () {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var button = qs('.menu-toggle');
        var panel = qs('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero-carousel]');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(dotIndex);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    function initFilters() {
        var input = qs('[data-filter-input]');
        var region = qs('[data-filter-region]');
        var kind = qs('[data-filter-kind]');
        var list = qs('[data-filter-list]');
        if (!list) {
            return;
        }
        var cards = qsa('[data-card]', list);
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) {
            input.value = query;
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var kindValue = normalize(kind && kind.value);
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardKind = normalize(card.getAttribute('data-kind'));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchRegion = !regionValue || cardRegion === regionValue;
                var matchKind = !kindValue || cardKind === kindValue;
                card.classList.toggle('is-hidden', !(matchKeyword && matchRegion && matchKind));
            });
        }

        [input, region, kind].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    window.initMoviePlayer = function (source) {
        var player = qs('.movie-player');
        if (!player) {
            return;
        }
        var video = qs('.player-video', player);
        var cover = qs('.player-cover', player);
        var attached = false;
        var hls = null;

        function attach() {
            if (!video) {
                return;
            }
            if (!attached) {
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }
            player.classList.add('is-playing');
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', attach);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    attach();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
