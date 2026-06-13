import { H as Hls } from "./hls-vendor-dru42stk.js";

const ready = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
};

ready(() => {
  initMenu();
  initHeroSlider();
  initFilters();
  initPlayers();
});

function initMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener("click", () => {
    panel.classList.toggle("is-open");
    toggle.classList.toggle("is-open");
  });
}

function initHeroSlider() {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) {
    return;
  }
  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  if (slides.length <= 1) {
    return;
  }
  let current = 0;
  let timer = null;

  const setActive = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, itemIndex) => {
      slide.classList.toggle("is-active", itemIndex === current);
    });
    dots.forEach((dot, itemIndex) => {
      dot.classList.toggle("is-active", itemIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => setActive(current + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      setActive(index);
      start();
    });
  });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  start();
}

function initFilters() {
  const bars = document.querySelectorAll("[data-filter-bar]");
  bars.forEach((bar) => {
    const section = bar.closest("section");
    const container = section
      ? section.querySelector("[data-card-container]")
      : document.querySelector("[data-card-container]");
    if (!container) {
      return;
    }
    const cards = Array.from(container.querySelectorAll("[data-movie-card]"));
    const input = bar.querySelector("[data-filter-input]");
    const region = bar.querySelector("[data-region-filter]");
    const genre = bar.querySelector("[data-genre-filter]");
    const sort = bar.querySelector("[data-sort-select]");

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && input) {
      input.value = query;
    }

    const apply = () => {
      const keyword = normalize(input ? input.value : "");
      const regionValue = region ? region.value : "";
      const genreValue = genre ? genre.value : "";

      cards.forEach((card) => {
        const haystack = normalize(
          card.dataset.search || card.textContent || "",
        );
        const regionOk = !regionValue || card.dataset.region === regionValue;
        const genreOk =
          !genreValue || (card.dataset.genre || "").includes(genreValue);
        const keywordOk = !keyword || haystack.includes(keyword);
        card.classList.toggle("is-hidden", !(regionOk && genreOk && keywordOk));
      });

      if (sort && sort.value !== "default") {
        const sorted = [...cards].sort((a, b) => {
          if (sort.value === "year-desc") {
            return numberValue(b.dataset.year) - numberValue(a.dataset.year);
          }
          if (sort.value === "title-asc") {
            return (a.dataset.title || "").localeCompare(
              b.dataset.title || "",
              "zh-CN",
            );
          }
          return 0;
        });
        sorted.forEach((card) => container.appendChild(card));
      }
    };

    [input, region, genre, sort].forEach((control) => {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
}

function initPlayers() {
  const boxes = document.querySelectorAll(".video-box");
  boxes.forEach((box) => {
    const video = box.querySelector("[data-player]");
    const trigger = box.querySelector("[data-play-trigger]");
    if (!video) {
      return;
    }
    const stream = video.dataset.stream;
    let hls = null;

    const attach = () => {
      if (!stream || video.dataset.attached === "true") {
        return;
      }
      video.dataset.attached = "true";
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    const play = async () => {
      attach();
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
      try {
        await video.play();
      } catch (error) {
        if (trigger) {
          trigger.classList.remove("is-hidden");
        }
      }
    };

    attach();

    if (trigger) {
      trigger.addEventListener("click", play);
    }
    video.addEventListener("click", () => {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", () => {
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", () => {
      if (trigger && video.currentTime === 0) {
        trigger.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function numberValue(value) {
  const match = String(value || "").match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}
