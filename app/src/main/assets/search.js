// ============================================================
// 搜索模块（使用当前引擎）
// ============================================================
(function() {
    'use strict';

    window.doSearch = function(query) {
        if (!query || !query.trim()) return;
        var q = query.trim();
        var url = '';
        if (q.indexOf('http://') === 0 || q.indexOf('https://') === 0) {
            url = q;
        } else if (q.indexOf('.') !== -1 && q.indexOf(' ') === -1) {
            url = 'https://' + q;
        } else {
            // 使用当前引擎
            if (window.currentEngine && window.currentEngine.url) {
                url = window.currentEngine.url.replace(/\{q\}/g, encodeURIComponent(q));
            } else {
                // 安全后备
                url = 'https://cn.bing.com/search?q=' + encodeURIComponent(q) + '&from=vivosearch2025';
            }
        }
        if (typeof window.addHistory === 'function') window.addHistory(q, url);
        if (typeof window.addWindow === 'function') window.addWindow(q, url);
        window.location.href = url;
    };
})();