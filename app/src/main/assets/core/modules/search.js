// ============================================================
// 搜索模块
// ============================================================
(function() {
    'use strict';
    try {
        window.doSearch = function(query) {
            if (!query || !query.trim()) return;
            var q = query.trim();
            var url = '';
            if (q.indexOf('http://') === 0 || q.indexOf('https://') === 0) {
                url = q;
            } else if (q.indexOf('.') !== -1 && q.indexOf(' ') === -1) {
                url = 'https://' + q;
            } else {
                url = window.currentEngine.url.replace(/\{q\}/g, encodeURIComponent(q));
            }
            if (typeof window.addWindow === 'function') {
                window.addWindow(q, url);
            }
            window.location.href = url;
        };
        console.log('✅ 搜索模块加载成功');
    } catch(e) {
        console.error('❌ 搜索模块加载失败:', e);
        window.doSearch = function() {};
    }
})();