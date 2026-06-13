(function () {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
            slide.classList.toggle("is-active", idx === current);
        });
        dots.forEach(function (dot, idx) {
            dot.classList.toggle("is-active", idx === current);
        });
    }

    dots.forEach(function (dot, idx) {
        dot.addEventListener("click", function () {
            showSlide(idx);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var input = document.querySelector("[data-search-input]");
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".no-results");

    function matchValue(card, key, value) {
        if (!value) {
            return true;
        }

        var data = (card.getAttribute("data-" + key) || "").toLowerCase();
        return data.indexOf(value.toLowerCase()) !== -1;
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = input ? input.value.trim().toLowerCase() : "";
        var selected = {};

        selects.forEach(function (select) {
            selected[select.getAttribute("data-filter-select")] = select.value;
        });

        var visible = 0;

        cards.forEach(function (card) {
            var blob = (card.getAttribute("data-keywords") || "").toLowerCase();
            var ok = !query || blob.indexOf(query) !== -1;

            Object.keys(selected).forEach(function (key) {
                ok = ok && matchValue(card, key, selected[key]);
            });

            card.hidden = !ok;

            if (ok) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    if (input) {
        input.addEventListener("input", applyFilters);
    }

    selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
    });
})();
