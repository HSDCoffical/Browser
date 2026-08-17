// ============================================================
// 收藏管理模块
// ============================================================
(function() {
    'use strict';
    try {
        window.renderFavorites = function() {
            var container = document.getElementById('favoritesList');
            if (!container) return;
            if (window.favoritesData.length === 0) {
                container.innerHTML = '<div class="window-empty">暂无收藏</div>';
                return;
            }
            var html = '';
            window.favoritesData.forEach(function(item, idx) {
                var initial = (item.title || '网')[0].toUpperCase();
                html += '<div class="window-item" data-url="' + item.url.replace(/'/g, "\\'") + '" style="cursor:pointer;">' +
                        '<div class="w-icon">' + initial + '</div>' +
                        '<div class="w-info">' +
                        '<div class="w-title">' + (item.title || '未命名') + '</div>' +
                        '<div class="w-url">' + (item.url || '') + '</div>' +
                        '</div>' +
                        '<button class="w-del" data-idx="' + idx + '" style="background:none;border:none;color:#ccc;font-size:18px;cursor:pointer;padding:4px 6px;">✕</button>' +
                        '</div>';
            });
            container.innerHTML = html;

            container.querySelectorAll('.window-item').forEach(function(el) {
                el.addEventListener('click', function(e) {
                    if (e.target.closest('.w-del')) return;
                    var url = this.dataset.url;
                    if (url) window.location.href = url;
                });
            });
            container.querySelectorAll('.w-del').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var idx = parseInt(this.dataset.idx);
                    window.favoritesData.splice(idx, 1);
                    window.saveFavorites();
                    window.renderFavorites();
                    window.showToast('已删除');
                });
            });
        };

        window.addFavorite = function(title, url) {
            if (window.favoritesData.some(function(item) { return item.url === url; })) {
                window.showToast('已收藏');
                return;
            }
            window.favoritesData.unshift({ title: title || url, url: url, time: Date.now() });
            window.saveFavorites();
            window.renderFavorites();
            window.showToast('已收藏');
        };

        console.log('✅ 收藏模块加载成功');
    } catch(e) {
        console.error('❌ 收藏模块加载失败:', e);
        window.addFavorite = function() {};
        window.renderFavorites = function() {};
    }
})();