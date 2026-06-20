(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var dotsWrap = slider.querySelector("[data-hero-dots]");
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    if (dotsWrap) {
      slides.forEach(function (_, dotIndex) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换到第 " + (dotIndex + 1) + " 张");
        dot.addEventListener("click", function () {
          setSlide(dotIndex);
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setSlide(index + 1);
        restart();
      });
    }

    setSlide(0);
    restart();
  }

  function uniqueSorted(cards, attr) {
    var values = cards
      .map(function (card) {
        return card.getAttribute(attr) || "";
      })
      .filter(Boolean);
    return Array.from(new Set(values)).sort(function (a, b) {
      return b.localeCompare(a, "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-card-grid]");
    if (!panel || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.children);
    var search = panel.querySelector("[data-filter-search]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var sort = panel.querySelector("[data-sort-cards]");
    var count = panel.querySelector("[data-filter-count]");
    var empty = document.querySelector("[data-empty-state]");

    fillSelect(year, uniqueSorted(cards, "data-year"));
    fillSelect(region, uniqueSorted(cards, "data-region"));
    fillSelect(type, uniqueSorted(cards, "data-type"));

    function apply() {
      var keyword = (search && search.value ? search.value : "").trim().toLowerCase();
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var match = true;
        if (keyword && text.indexOf(keyword) === -1) {
          match = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          match = false;
        }
        if (regionValue && card.getAttribute("data-region") !== regionValue) {
          match = false;
        }
        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          match = false;
        }
        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    function sortCards() {
      if (!sort) {
        return;
      }
      var mode = sort.value;
      var sorted = cards.slice();
      if (mode === "year-desc") {
        sorted.sort(function (a, b) {
          return (b.getAttribute("data-year") || "").localeCompare(a.getAttribute("data-year") || "");
        });
      }
      if (mode === "title-asc") {
        sorted.sort(function (a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    [search, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    if (sort) {
      sort.addEventListener("change", sortCards);
    }
    apply();
  }

  function initPlayer() {
    var video = document.getElementById("movie-player");
    var button = document.querySelector("[data-player-button]");
    var status = document.querySelector("[data-player-status]");
    if (!video || !button) {
      return;
    }

    var hlsInstance = null;
    var hasLoaded = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setStatus("浏览器阻止了自动播放，请再次点击视频播放。 ");
        });
      }
    }

    function loadSource() {
      var source = video.getAttribute("data-src");
      if (!source) {
        setStatus("当前影片暂未配置播放源。 ");
        return;
      }

      if (hasLoaded) {
        playVideo();
        return;
      }

      hasLoaded = true;
      button.classList.add("is-hidden");
      setStatus("正在加载播放源，请稍候。 ");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        setStatus("已启用浏览器原生 HLS 播放。 ");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源加载完成，正在播放。 ");
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus("播放源加载失败，可刷新页面后重试。 ");
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });
        return;
      }

      video.src = source;
      video.load();
      setStatus("当前浏览器未检测到 HLS 增强支持，已尝试直接播放。 ");
      playVideo();
    }

    button.addEventListener("click", loadSource);
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
  }

  function createSearchCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a class="card-cover" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '  <img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '  <span class="card-play">▶</span>',
      '  <span class="card-category">' + escapeHtml(movie.categoryName) + '</span>',
      '</a>',
      '<div class="card-body">',
      '  <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '  <p>' + escapeHtml(movie.oneLine) + '</p>',
      '  <div class="card-meta">',
      '    <span>' + escapeHtml(movie.year) + '</span>',
      '    <span>' + escapeHtml(movie.region) + '</span>',
      '    <span>' + escapeHtml(movie.type) + '</span>',
      '  </div>',
      '  <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
      }).join("") + '</div>',
      '</div>'
    ].join("");
    return article;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initGlobalSearch() {
    if (!window.MOVIE_SEARCH_DATA) {
      return;
    }

    var input = document.getElementById("global-search-input");
    var year = document.getElementById("global-year");
    var region = document.getElementById("global-region");
    var type = document.getElementById("global-type");
    var clear = document.getElementById("global-clear");
    var count = document.getElementById("global-count");
    var results = document.getElementById("global-results");
    if (!input || !results) {
      return;
    }

    var movies = window.MOVIE_SEARCH_DATA;

    function addOptions(select, values) {
      if (!select) {
        return;
      }
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    addOptions(year, Array.from(new Set(movies.map(function (movie) { return movie.year; }))).sort().reverse());
    addOptions(region, Array.from(new Set(movies.map(function (movie) { return movie.region; }))).sort());
    addOptions(type, Array.from(new Set(movies.map(function (movie) { return movie.type; }))).sort());

    function queryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      var keyword = params.get("q");
      if (keyword) {
        input.value = keyword;
      }
    }

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var matched = movies.filter(function (movie) {
        var text = movie.search.toLowerCase();
        if (keyword && text.indexOf(keyword) === -1) {
          return false;
        }
        if (yearValue && movie.year !== yearValue) {
          return false;
        }
        if (regionValue && movie.region !== regionValue) {
          return false;
        }
        if (typeValue && movie.type !== typeValue) {
          return false;
        }
        return true;
      });

      results.innerHTML = "";
      matched.slice(0, 240).forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });
      if (count) {
        count.textContent = matched.length;
      }
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });

    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        if (year) {
          year.value = "";
        }
        if (region) {
          region.value = "";
        }
        if (type) {
          type.value = "";
        }
        render();
      });
    }

    queryFromUrl();
    render();
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayer();
    initGlobalSearch();
  });
})();
