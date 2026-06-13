(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.mobile-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var missingImages = Array.prototype.slice.call(document.querySelectorAll('img'));

  missingImages.forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    });
  });

  var searchInput = document.querySelector('[data-search-input]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
  var noResults = document.querySelector('.no-results');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    var keyword = normalize(searchInput ? searchInput.value : '');
    var typeValue = normalize(typeSelect ? typeSelect.value : '');
    var visibleTotal = 0;

    grids.forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-search]'));

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesType = !typeValue || text.indexOf(typeValue) !== -1;
        var visible = matchesKeyword && matchesType;

        card.style.display = visible ? '' : 'none';

        if (visible) {
          visibleTotal += 1;
        }
      });
    });

    if (noResults) {
      noResults.style.display = visibleTotal ? 'none' : 'block';
    }
  }

  function applySort() {
    if (!sortSelect) {
      return;
    }

    var sortValue = sortSelect.value;

    grids.forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.children);

      cards.sort(function (a, b) {
        if (sortValue === 'title') {
          return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-CN');
        }

        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      });

      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });

    applyFilter();
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', applyFilter);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
    applySort();
  } else {
    applyFilter();
  }
})();
