// ============================================================
// 收藏/历史模块
// ============================================================
(function() {
    'use strict';

    window.addHistory = function(title, url) {
        window.history = window.history.filter(function(item) { return item.url !== url; });
        window.history.unshift({ title: title || url, url: url, time: Date.now() });
        if (window.history.length > 100) window.history = window.history.slice(0, 100);
        window.saveHistory();
    };

    window.addFavorite = function(title, url) {
        if (window.favorites.some(function(item) { return item.url === url; })) {
            window.showToast('已收藏');
            return;
        }
        window.favorites.unshift({ title: title || url, url: url, time: Date.now() });
        window.saveFavorites();
        window.showToast('已收藏');
    };

    window.renderHistory = function(mode) {
        var list = document.getElementById('historyList');
        if (!list) return;
        var data = mode === 'fav' ? window.favorites : window.history;
        if (data.length === 0) {
            list.innerHTML = '<div class="func-item">暂无记录</div>';
            return;
        }
        var html = '';
        data.forEach(function(item, idx) {
            html += '<div class="func-item">' +
                    '<div class="func-info">' +
                    '<div class="func-title">' + item.title + '</div>' +
                    '<div class="func-desc">' + item.url + '</div>' +
                    '</div>' +
                    '<div style="display:flex;gap:4px;">' +
                    '<button class="func-action" data-url="' + item.url + '">打开</button>' +
                    '<button class="func-del" data-idx="' + idx + '" data-mode="' + mode + '">✕</button>' +
                    '</div>' +
                    '</div>';
        });
        list.innerHTML = html;

        list.querySelectorAll('.func-action').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var url = this.dataset.url;
                if (url) window.location.href = url;
            });
        });
        list.querySelectorAll('.func-del').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var idx = parseInt(this.dataset.idx);
                var mode = this.dataset.mode;
                if (mode === 'fav') {
                    window.favorites.splice(idx, 1);
                    window.saveFavorites();
                } else {
                    window.history.splice(idx, 1);
                    window.saveHistory();
                }
                window.renderHistory(mode);
                window.showToast('已删除');
            });
        });
    };
})();