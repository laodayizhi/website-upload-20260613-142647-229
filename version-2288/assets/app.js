document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
      });
    });

    show(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var input = panel.querySelector('.movie-search');
    var yearSelect = panel.querySelector('.movie-year-filter');
    var typeSelect = panel.querySelector('.movie-type-filter');
    var years = [];
    var types = [];

    cards.forEach(function (card) {
      var year = card.getAttribute('data-year') || '';
      var type = card.getAttribute('data-type') || '';

      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }

      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
    });

    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });
    types.sort();

    if (yearSelect) {
      years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    if (typeSelect) {
      types.forEach(function (type) {
        var option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var ok = true;

        if (query && text.indexOf(query) === -1) {
          ok = false;
        }

        if (year && cardYear !== year) {
          ok = false;
        }

        if (type && cardType !== type) {
          ok = false;
        }

        card.hidden = !ok;
      });
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
});
