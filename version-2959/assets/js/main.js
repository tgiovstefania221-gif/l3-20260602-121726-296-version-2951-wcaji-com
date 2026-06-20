(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-year-now]').forEach(function (node) {
        node.textContent = new Date().getFullYear();
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-field]'));
        var activeField = 'all';
        var activeValue = 'all';

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var matchedText = !query || text.indexOf(query) !== -1;
                var matchedFilter = true;

                if (activeField !== 'all') {
                    matchedFilter = String(card.getAttribute('data-' + activeField) || '') === activeValue;
                }

                card.classList.toggle('is-hidden', !(matchedText && matchedFilter));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeField = button.getAttribute('data-filter-field') || 'all';
                activeValue = button.getAttribute('data-filter-value') || 'all';
                buttons.forEach(function (other) {
                    other.classList.toggle('is-active', other === button);
                });
                applyFilter();
            });
        });
    });
})();
