(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = panel.hasAttribute("hidden");
      if (isOpen) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }
    function start() {
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
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilterBlocks() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var list = document.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var items = Array.prototype.slice.call(list.children);
      function apply() {
        var keyword = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        items.forEach(function (item) {
          var text = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-tags"),
            item.textContent
          ].join(" "));
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesYear = !selectedYear || normalize(item.getAttribute("data-year")) === selectedYear;
          var matchesType = !selectedType || normalize(item.getAttribute("data-type")) === selectedType;
          item.classList.toggle("is-hidden-by-filter", !(matchesKeyword && matchesYear && matchesType));
        });
      }
      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function movieCardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<a class=\"movie-card\" href=\"" + escapeAttribute(movie.url) + "\">",
      "<span class=\"poster-wrap\"><img src=\"" + escapeAttribute(movie.image) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\"><span class=\"poster-shade\"></span><span class=\"poster-play\">▶</span><span class=\"card-category\">" + escapeHtml(movie.category) + "</span><span class=\"card-year\">" + escapeHtml(movie.year) + "</span></span>",
      "<span class=\"card-body\"><strong>" + escapeHtml(movie.title) + "</strong><em>" + escapeHtml(movie.oneLine || movie.summary) + "</em><span class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></span><span class=\"tag-row\">" + tags + "</span></span>",
      "</a>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function setupSearchPage() {
    var resultBox = document.querySelector("[data-search-results]");
    if (!resultBox || typeof SITE_SEARCH_DATA === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var form = document.querySelector(".search-page-form");
    var input = form ? form.querySelector("input[name='q']") : null;
    var title = document.querySelector("[data-search-title]");
    var subtitle = document.querySelector("[data-search-subtitle]");
    if (input) {
      input.value = query;
    }
    if (!query.trim()) {
      return;
    }
    var terms = normalize(query).split(/\s+/).filter(Boolean);
    var results = SITE_SEARCH_DATA.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        (movie.tags || []).join(" "),
        movie.summary,
        movie.oneLine
      ].join(" "));
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 120);
    if (title) {
      title.textContent = "搜索结果";
    }
    if (subtitle) {
      subtitle.textContent = "关键词：“" + query + "”";
    }
    if (!results.length) {
      resultBox.innerHTML = "<div class=\"search-empty\">暂未找到匹配内容，可尝试更换关键词。</div>";
      return;
    }
    resultBox.innerHTML = results.map(movieCardHtml).join("");
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupFilterBlocks();
    setupSearchPage();
  });
})();

function setupMoviePlayer(videoId, overlayId, buttonId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(buttonId);
  var loaded = false;
  var hls = null;
  if (!video || !source) {
    return;
  }
  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }
  function start() {
    loadSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }
  if (overlay) {
    overlay.addEventListener("click", start);
  }
  if (button) {
    button.addEventListener("click", start);
  }
  video.addEventListener("play", function () {
    loadSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  video.addEventListener("ended", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
      hls = null;
    }
    loaded = false;
  });
}
