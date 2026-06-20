(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  var timer = null;

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

  function startHero() {
    if (slides.length <= 1) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      window.clearInterval(timer);
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      startHero();
    });
  });

  startHero();

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.local-filter'));
  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var scope = input.closest('main') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-target .movie-card'));
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var year = (card.getAttribute('data-year') || '').toLowerCase();
        var matched = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1 || genre.indexOf(query) !== -1 || year.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
      });
    });
  });

  var searchInput = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');
  var searchSummary = document.getElementById('searchSummary');

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function renderSearch() {
    if (!searchInput || !searchResults || !searchSummary || !window.MovieSearchData) {
      return;
    }
    var query = getQuery();
    searchInput.value = query;
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var results = window.MovieSearchData.filter(function (item) {
      return item.title.toLowerCase().indexOf(lower) !== -1 ||
        item.category.toLowerCase().indexOf(lower) !== -1 ||
        item.genre.toLowerCase().indexOf(lower) !== -1 ||
        item.region.toLowerCase().indexOf(lower) !== -1 ||
        item.year.toLowerCase().indexOf(lower) !== -1 ||
        item.tags.toLowerCase().indexOf(lower) !== -1 ||
        item.description.toLowerCase().indexOf(lower) !== -1;
    });
    searchSummary.textContent = results.length ? '搜索结果：' + query : '没有找到与“' + query + '”相关的内容。';
    if (!results.length) {
      searchResults.innerHTML = '<div class="empty-state">换一个关键词试试。</div>';
      return;
    }
    searchResults.innerHTML = results.slice(0, 200).map(function (item) {
      return '<article class="movie-card">' +
        '<a class="poster-wrap" href="' + item.url + '">' +
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="score-badge">' + item.score + '</span>' +
        '</a>' +
        '<div class="card-content">' +
        '<div class="card-kicker">' + escapeHtml(item.category) + '</div>' +
        '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
        '<p>' + escapeHtml(item.description) + '</p>' +
        '<div class="card-meta"><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  renderSearch();
})();
