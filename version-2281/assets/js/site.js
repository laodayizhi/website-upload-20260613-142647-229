(function() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function() {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                showSlide(dotIndex);
            });
        });

        window.setInterval(function() {
            showSlide(current + 1);
        }, 5600);
    }

    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));

    scopes.forEach(function(scope) {
        var input = scope.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var emptyState = scope.querySelector('[data-empty-state]');

        if (!input || !cards.length) {
            return;
        }

        input.addEventListener('input', function() {
            var keyword = input.value.trim().toLowerCase();
            var visibleCount = 0;

            cards.forEach(function(card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
                var visible = !keyword || text.indexOf(keyword) !== -1;
                card.style.display = visible ? '' : 'none';

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visibleCount === 0);
            }
        });
    });
}());
