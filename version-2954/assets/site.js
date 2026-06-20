(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero(slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;
        if (!slides.length) {
            return;
        }
        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function start() {
            stop();
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
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupRail(button, direction) {
        var target = document.querySelector(button.getAttribute(direction > 0 ? 'data-scroll-next' : 'data-scroll-prev'));
        if (!target) {
            return;
        }
        button.addEventListener('click', function () {
            target.scrollBy({
                left: direction * 460,
                behavior: 'smooth'
            });
        });
    }

    function setupFilters(form) {
        var target = document.querySelector(form.getAttribute('data-target'));
        if (!target) {
            return;
        }
        var cards = Array.prototype.slice.call(target.querySelectorAll('[data-card]'));
        var input = form.querySelector('[name="q"]');
        var genre = form.querySelector('[name="genre"]');
        var year = form.querySelector('[name="year"]');
        var empty = document.querySelector('[data-no-results]');
        var params = new URLSearchParams(window.location.search);
        if (input && params.get('q')) {
            input.value = params.get('q');
        }
        function apply() {
            var query = normalize(input ? input.value : '');
            var genreValue = normalize(genre ? genre.value : '');
            var yearValue = normalize(year ? year.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search') || card.textContent);
                var cardGenre = normalize(card.getAttribute('data-genre'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchGenre = !genreValue || cardGenre.indexOf(genreValue) !== -1 || text.indexOf(genreValue) !== -1;
                var matchYear = !yearValue || cardYear === yearValue;
                var show = matchQuery && matchGenre && matchYear;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        ['input', 'change'].forEach(function (eventName) {
            form.addEventListener(eventName, apply);
        });
        apply();
    }

    function prepareVideo(video, source) {
        if (!video || !source) {
            return;
        }
        if (video.getAttribute('data-ready') === '1') {
            return;
        }
        video.setAttribute('data-ready', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsPlayer = hls;
            return;
        }
        video.src = source;
    }

    window.setupMoviePlayer = function (options) {
        ready(function () {
            var video = document.querySelector(options.videoSelector);
            var button = document.querySelector(options.buttonSelector);
            if (!video || !button) {
                return;
            }
            function play() {
                prepareVideo(video, options.source);
                video.setAttribute('controls', 'controls');
                button.classList.add('is-hidden');
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            }
            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    button.classList.remove('is-hidden');
                }
            });
        });
    };

    ready(function () {
        setupMenu();
        document.querySelectorAll('[data-hero-slider]').forEach(setupHero);
        document.querySelectorAll('[data-filter-form]').forEach(setupFilters);
        document.querySelectorAll('[data-scroll-prev]').forEach(function (button) {
            setupRail(button, -1);
        });
        document.querySelectorAll('[data-scroll-next]').forEach(function (button) {
            setupRail(button, 1);
        });
    });
}());
