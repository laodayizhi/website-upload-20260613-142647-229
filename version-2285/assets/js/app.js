(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function startCarousel() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      window.clearInterval(timer);
      showSlide(Number(dot.getAttribute('data-target')) || 0);
      startCarousel();
    });
  });

  startCarousel();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.list-search, #site-search'));
  var genreFilters = Array.prototype.slice.call(document.querySelectorAll('.genre-filter'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(' '));
    var genre = normalize(genreFilters.map(function (select) {
      return select.value;
    }).join(' '));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year')
      ].join(' '));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesGenre = !genre || haystack.indexOf(genre) !== -1;

      card.classList.toggle('is-filtered-out', !(matchesQuery && matchesGenre));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  genreFilters.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });
})();
