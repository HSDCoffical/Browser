// ============================================================
// 顶部栏模块
// ============================================================
(function() {
    'use strict';

    window.updateTopBar = function(title, url) {
        var topBar = document.getElementById('topBar');
        var titleEl = document.getElementById('topTitle');
        if (!topBar || !titleEl) return;
        var isLocal = (url && (url.indexOf('file://') === 0 || url === 'about:blank'));
        if (isLocal || !url || url === '') {
            topBar.style.display = 'none';
        } else {
            topBar.style.display = 'flex';
            titleEl.textContent = title || url;
        }
    };
})();