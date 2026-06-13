(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("form[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });

    document.querySelectorAll("img[data-cover]").forEach(function (img) {
      img.addEventListener("error", function () {
        img.style.opacity = "0";
      }, { once: true });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      show(0);
      restart();
    }

    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var section = panel.closest("section");
      var grid = section ? section.querySelector("[data-card-grid]") : document.querySelector("[data-card-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".js-movie-card"));
      var input = panel.querySelector("[data-filter-input]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var empty = section ? section.querySelector("[data-empty-state]") : null;
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      function fill(select, attr) {
        if (!select) {
          return;
        }
        var values = cards.map(function (card) {
          return card.getAttribute(attr) || "";
        }).filter(Boolean);
        values = Array.from(new Set(values)).sort(function (a, b) {
          if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
            return Number(b) - Number(a);
          }
          return a.localeCompare(b, "zh-Hans-CN");
        });
        values.forEach(function (value) {
          var option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      }

      fill(yearSelect, "data-year");
      fill(typeSelect, "data-type");
      fill(regionSelect, "data-region");

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var shown = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var match = true;
          if (query && text.indexOf(query) === -1) {
            match = false;
          }
          if (year && card.getAttribute("data-year") !== year) {
            match = false;
          }
          if (type && card.getAttribute("data-type") !== type) {
            match = false;
          }
          if (region && card.getAttribute("data-region") !== region) {
            match = false;
          }
          card.hidden = !match;
          if (match) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [input, yearSelect, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  });
})();
