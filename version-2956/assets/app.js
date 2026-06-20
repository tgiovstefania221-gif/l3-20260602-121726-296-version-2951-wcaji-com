(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  function fillOptions(select, values) {
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (bar) {
      var parent = bar.parentElement;
      var list = qs('.filter-list', parent) || parent;
      var items = qsa('[data-search]', list);
      var input = qs('[data-filter-input]', bar);
      var year = qs('[data-filter-year]', bar);
      var region = qs('[data-filter-region]', bar);
      var type = qs('[data-filter-type]', bar);
      var years = [];
      var regions = [];
      var types = [];

      items.forEach(function (item) {
        var y = item.getAttribute('data-year') || '';
        var r = item.getAttribute('data-region') || '';
        var t = item.getAttribute('data-type') || '';
        if (y && years.indexOf(y) === -1) {
          years.push(y);
        }
        if (r && regions.indexOf(r) === -1) {
          regions.push(r);
        }
        if (t && types.indexOf(t) === -1) {
          types.push(t);
        }
      });

      years.sort(function (a, b) {
        return Number(b) - Number(a);
      });
      regions.sort();
      types.sort();

      if (year) {
        fillOptions(year, years);
      }
      if (region) {
        fillOptions(region, regions);
      }
      if (type) {
        fillOptions(type, types);
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var r = region ? region.value : '';
        var t = type ? type.value : '';
        items.forEach(function (item) {
          var text = (item.getAttribute('data-search') || '').toLowerCase();
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (y && item.getAttribute('data-year') !== y) {
            matched = false;
          }
          if (r && item.getAttribute('data-region') !== r) {
            matched = false;
          }
          if (t && item.getAttribute('data-type') !== t) {
            matched = false;
          }
          item.classList.toggle('is-hidden', !matched);
        });
      }

      [input, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function initPlayerBox(box) {
    var source = box.getAttribute('data-src');
    var video = qs('video', box);
    if (!source || !video) {
      return;
    }
    if (box.getAttribute('data-ready') === '1') {
      video.play();
      box.classList.add('is-playing');
      return;
    }
    box.setAttribute('data-ready', '1');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play();
      }, { once: true });
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
    } else {
      video.src = source;
      video.play();
    }
    box.classList.add('is-playing');
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (box) {
      var button = qs('[data-play-button]', box);
      if (button) {
        button.addEventListener('click', function () {
          initPlayerBox(box);
        });
      }
      box.addEventListener('dblclick', function () {
        initPlayerBox(box);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
