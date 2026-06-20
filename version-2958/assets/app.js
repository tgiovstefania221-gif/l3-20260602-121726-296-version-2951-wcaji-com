(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var cards = qsa('[data-movie-card]');
    if (!cards.length) {
      return;
    }
    var input = qs('[data-filter-input]');
    var year = qs('[data-year-filter]');
    var type = qs('[data-type-filter]');
    var region = qs('[data-region-filter]');

    function apply() {
      var text = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      var selectedRegion = normalize(region && region.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var okText = !text || haystack.indexOf(text) !== -1;
        var okYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
        var okType = !selectedType || normalize(card.getAttribute('data-type')) === selectedType;
        var okRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
        card.classList.toggle('is-hidden', !(okText && okYear && okType && okRegion));
      });
    }

    [input, year, type, region].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
  }

  window.setupPlayback = function (source, videoId) {
    var video = document.getElementById(videoId);
    if (!video || !source) {
      return;
    }
    var shell = video.closest('[data-player]');
    var cover = shell ? shell.querySelector('.player-cover') : null;
    var hls = null;

    function attach() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function start() {
      if (cover) {
        cover.classList.add('is-playing');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          if (cover) {
            cover.classList.remove('is-playing');
          }
        });
      }
    }

    attach();

    if (cover) {
      cover.addEventListener('click', start);
    }
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-playing');
      }
    });
    video.addEventListener('pause', function () {
      if (cover && video.currentTime === 0) {
        cover.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
