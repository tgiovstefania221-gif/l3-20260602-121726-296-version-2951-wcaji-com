
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

  function setupNavigation() {
    var toggle = qs('[data-nav-toggle]');
    var links = qs('[data-nav-links]');

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;

    function activate(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5200);
    }
  }

  function setupFilters() {
    var filterBlocks = qsa('[data-filter-block]');

    filterBlocks.forEach(function (block) {
      var input = qs('[data-filter-input]', block);
      var genre = qs('[data-filter-genre]', block);
      var year = qs('[data-filter-year]', block);
      var cards = qsa('[data-filter-grid] .movie-card', block);
      var count = qs('[data-filter-count]', block);

      function applyFilter() {
        var keyword = normalize(input ? input.value : '');
        var genreValue = normalize(genre ? genre.value : '');
        var yearValue = normalize(year ? year.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.year
          ].join(' '));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesGenre = !genreValue || normalize(card.dataset.genre).indexOf(genreValue) !== -1;
          var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
          var show = matchesKeyword && matchesGenre && matchesYear;

          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部影片';
        }
      }

      [input, genre, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    });
  }

  function setupPlayer() {
    var shell = qs('[data-player-shell]');

    if (!shell) {
      return;
    }

    var video = qs('video', shell);
    var cover = qs('[data-player-cover]', shell);
    var source = shell.getAttribute('data-source');
    var hlsInstance = null;

    function play() {
      if (!video || !source) {
        return;
      }

      if (cover) {
        cover.classList.add('hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        }
        video.play().catch(function () {});
      } else {
        video.src = source;
        video.play().catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayer();
  });
}());
