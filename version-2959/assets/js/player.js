(function () {
    var shell = document.querySelector('[data-player]');

    if (!shell) {
        return;
    }

    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-m3u8');
    var cover = shell.querySelector('[data-player-cover]');
    var loader = shell.querySelector('[data-player-loader]');
    var message = shell.querySelector('[data-player-message]');
    var toggle = shell.querySelector('[data-player-toggle]');
    var muted = shell.querySelector('[data-player-muted]');
    var fullscreen = shell.querySelector('[data-player-fullscreen]');
    var hls = null;
    var attached = false;

    function showLoader(state) {
        if (loader) {
            loader.hidden = !state;
        }
    }

    function showMessage(state) {
        if (message) {
            message.hidden = !state;
        }
    }

    function attach() {
        if (attached || !video || !source) {
            return;
        }

        attached = true;
        showLoader(true);

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
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showLoader(false);
                    showMessage(true);
                }
            });
            return;
        }

        showLoader(false);
        showMessage(true);
    }

    function play() {
        attach();
        shell.classList.add('is-started');
        showMessage(false);
        var promise = video.play();

        if (promise && promise.catch) {
            promise.catch(function () {
                showLoader(false);
            });
        }
    }

    function togglePlay() {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    }

    function updateState() {
        if (toggle) {
            toggle.textContent = video.paused ? '▶' : 'Ⅱ';
        }
    }

    attach();

    if (cover) {
        cover.addEventListener('click', play);
    }

    if (toggle) {
        toggle.addEventListener('click', togglePlay);
    }

    video.addEventListener('click', togglePlay);
    video.addEventListener('playing', function () {
        shell.classList.add('is-started');
        showLoader(false);
        updateState();
    });
    video.addEventListener('pause', updateState);
    video.addEventListener('canplay', function () {
        showLoader(false);
    });
    video.addEventListener('waiting', function () {
        showLoader(true);
    });
    video.addEventListener('error', function () {
        showLoader(false);
        showMessage(true);
    });

    if (muted) {
        muted.addEventListener('click', function () {
            video.muted = !video.muted;
            muted.textContent = video.muted ? '🔇' : '🔊';
        });
    }

    if (fullscreen) {
        fullscreen.addEventListener('click', function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (shell.requestFullscreen) {
                shell.requestFullscreen();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
