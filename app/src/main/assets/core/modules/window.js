// ============================================================
// 窗口管理模块
// ============================================================
(function() {
    'use strict';
    try {
        window.addWindow = function(title, url) {
            var id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
            window.windows.unshift({ id: id, title: title || url, url: url || 'about:blank', time: Date.now() });
            if (window.windows.length > 50) window.windows = window.windows.slice(0, 50);
            window.saveWindows();
            if (typeof window.renderWindows === 'function') {
                window.renderWindows();
            }
        };

        window.deleteWindow = function(id) {
            window.windows = window.windows.filter(function(w) { return w.id !== id; });
            window.saveWindows();
            if (typeof window.renderWindows === 'function') {
                window.renderWindows();
            }
        };

        window.renderWindows = function() {
            var container = document.getElementById('windowList');
            if (!container) return;
            if (window.windows.length === 0) {
                container.innerHTML = '<div class="window-empty">暂无窗口</div>';
                return;
            }
            var html = '';
            window.windows.forEach(function(w) {
                var initial = (w.title || '网')[0].toUpperCase();
                html += '<div class="window-item" data-id="' + w.id + '">' +
                        '<div class="w-icon">' + initial + '</div>' +
                        '<div class="w-info">' +
                        '<div class="w-title">' + (w.title || '未命名') + '</div>' +
                        '<div class="w-url">' + (w.url || '') + '</div>' +
                        '</div>' +
                        '<button class="w-del" data-id="' + w.id + '">✕</button>' +
                        '</div>';
            });
            container.innerHTML = html;

            container.querySelectorAll('.window-item').forEach(function(el) {
                el.addEventListener('click', function(e) {
                    if (e.target.closest('.w-del')) return;
                    var id = this.dataset.id;
                    var w = window.windows.find(function(win) { return win.id === id; });
                    if (w && w.url) {
                        window.location.href = w.url;
                    } else {
                        window.showToast('该窗口没有有效地址');
                    }
                });
            });

            container.querySelectorAll('.w-del').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var id = this.dataset.id;
                    window.deleteWindow(id);
                    window.showToast('已删除窗口');
                });
            });
        };

        console.log('✅ 窗口模块加载成功');
    } catch(e) {
        console.error('❌ 窗口模块加载失败:', e);
    }
})();