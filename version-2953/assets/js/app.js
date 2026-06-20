(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        reset();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        reset();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll(".js-movie-list"));
    lists.forEach(function (list) {
      var scope = list.closest("section") || document;
      var search = scope.querySelector(".js-movie-search");
      var year = scope.querySelector(".js-year-filter");
      var category = scope.querySelector(".js-category-filter");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function read(card, name) {
        return (card.getAttribute("data-" + name) || "").toLowerCase();
      }

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var categoryValue = category ? category.value : "";
        cards.forEach(function (card) {
          var text = ["title", "genre", "region", "category", "tags", "year"].map(function (key) {
            return read(card, key);
          }).join(" ");
          var cardYear = read(card, "year");
          var cardCategory = read(card, "category") + " " + read(card, "genre") + " " + read(card, "tags") + " " + read(card, "region");
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = true;
          var matchCategory = !categoryValue || cardCategory.indexOf(categoryValue.toLowerCase()) !== -1 || text.indexOf(categoryValue.toLowerCase()) !== -1;
          if (yearValue === "older") {
            matchYear = Number(cardYear) > 0 && Number(cardYear) < 2015;
          } else if (yearValue) {
            matchYear = cardYear.indexOf(yearValue) !== -1;
          }
          card.classList.toggle("is-hidden", !(matchQuery && matchYear && matchCategory));
        });
      }

      [search, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var existing = document.querySelector("script[data-hls-loader]");
      if (existing) {
        existing.addEventListener("load", function () {
          resolve(window.Hls);
        });
        existing.addEventListener("error", reject);
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
      script.async = true;
      script.setAttribute("data-hls-loader", "true");
      script.addEventListener("load", function () {
        resolve(window.Hls);
      });
      script.addEventListener("error", reject);
      document.head.appendChild(script);
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("[data-player]");
      var button = shell.querySelector("[data-player-button]");
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute("data-src") || "";
      var loaded = false;

      function play() {
        if (!source) {
          return;
        }
        shell.classList.add("is-playing");
        if (loaded) {
          video.play().catch(function () {});
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }
        loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = source;
            video.play().catch(function () {});
          }
        }).catch(function () {
          video.src = source;
          video.play().catch(function () {});
        });
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
