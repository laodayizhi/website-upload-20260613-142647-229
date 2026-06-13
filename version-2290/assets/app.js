(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    }

    function setupFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
        grids.forEach(function (grid) {
            var section = grid.closest('section') || document;
            var input = section.querySelector('.js-search-input');
            var selects = Array.prototype.slice.call(section.querySelectorAll('.js-filter-select'));
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            function valueOf(card, key) {
                return (card.getAttribute('data-' + key) || '').toLowerCase();
            }
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var activeFilters = selects.map(function (select) {
                    return {
                        key: select.getAttribute('data-filter'),
                        value: select.value.trim().toLowerCase()
                    };
                });
                cards.forEach(function (card) {
                    var haystack = [
                        valueOf(card, 'title'),
                        valueOf(card, 'year'),
                        valueOf(card, 'region'),
                        valueOf(card, 'type'),
                        valueOf(card, 'genre'),
                        card.textContent.toLowerCase()
                    ].join(' ');
                    var queryMatch = !query || haystack.indexOf(query) !== -1;
                    var filtersMatch = activeFilters.every(function (filter) {
                        return !filter.value || valueOf(card, filter.key).indexOf(filter.value) !== -1;
                    });
                    card.classList.toggle('is-hidden', !(queryMatch && filtersMatch));
                });
            }
            if (input) {
                input.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                }
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();

function initPlayer(source, playerId) {
    var shell = document.getElementById(playerId);
    if (!shell) {
        return;
    }
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var started = false;
    if (!video) {
        return;
    }
    function attach() {
        if (started) {
            return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }
    function play() {
        attach();
        shell.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }
    if (cover) {
        cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        shell.classList.add('is-playing');
    });
}
