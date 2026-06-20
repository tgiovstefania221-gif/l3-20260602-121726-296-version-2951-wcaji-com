(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

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

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

  filterInputs.forEach(function (input) {
    var scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }

    var items = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = [
          item.getAttribute('data-title'),
          item.getAttribute('data-year'),
          item.getAttribute('data-region'),
          item.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        item.classList.toggle('hidden-by-filter', keyword && text.indexOf(keyword) === -1);
      });
    });
  });

  var videoShells = Array.prototype.slice.call(document.querySelectorAll('[data-video-shell]'));

  videoShells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var source = shell.getAttribute('data-src');
    var started = false;

    function bindSource() {
      if (started || !video || !source) {
        return;
      }

      started = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      bindSource();
      shell.classList.add('playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        bindSource();
      });
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          shell.classList.remove('playing');
        }
      });
    }
  });
}());
