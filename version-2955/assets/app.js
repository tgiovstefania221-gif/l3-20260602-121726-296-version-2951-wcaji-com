(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function textOf(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (button && menu) {
      button.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var searchBox = document.querySelector("[data-search-box]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");

    function filterCards() {
      if (!cards.length) return;
      var q = textOf(searchBox && searchBox.value);
      var typeValue = textOf(typeFilter && typeFilter.value);
      var yearValue = textOf(yearFilter && yearFilter.value);
      cards.forEach(function (card) {
        var text = textOf([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.type,
          card.dataset.year,
          card.dataset.region
        ].join(" "));
        var typeOk = !typeValue || textOf(card.dataset.type).indexOf(typeValue) > -1;
        var yearOk = !yearValue || textOf(card.dataset.year) === yearValue;
        var searchOk = !q || text.indexOf(q) > -1;
        card.style.display = typeOk && yearOk && searchOk ? "" : "none";
      });
    }

    [searchBox, typeFilter, yearFilter].forEach(function (item) {
      if (item) {
        item.addEventListener("input", filterCards);
        item.addEventListener("change", filterCards);
      }
    });

    var slider = document.querySelector("[data-hero]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
      var prev = document.querySelector("[data-hero-prev]");
      var next = document.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) return;
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function start() {
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      show(0);
      start();
    }
  });

  window.initVideoPlayer = function (url) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    if (!video || !url) return;
    var hls = null;
    var loaded = false;

    function setSource() {
      if (loaded) return;
      loaded = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      setSource();
      if (overlay) overlay.classList.add("hidden");
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    if (overlay) overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) start();
    });
    video.addEventListener("play", function () {
      if (overlay) overlay.classList.add("hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) hls.destroy();
    });
  };
})();
