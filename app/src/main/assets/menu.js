// ============================================================
// 菜单功能模块
// ============================================================
(function() {
    'use strict';

    window.handleMenuAction = function(action) {
        switch (action) {
            case 'settings':
                window.closePanel('menu');
                window.openPanel('settings');
                break;
            case 'download':
                window.closePanel('menu');
                window.openPanel('download');
                if (window.DownloadManager) window.DownloadManager.render();
                break;
            case 'history':
                window.closePanel('menu');
                if (typeof window.renderHistory === 'function') {
                    window.renderHistory('fav');
                }
                window.openPanel('history');
                break;
            case 'tools':
                window.closePanel('menu');
                window.openPanel('tools');
                break;
            case 'fav':
                if (window.location.href && window.location.href !== 'about:blank') {
                    if (typeof window.addFavorite === 'function') {
                        window.addFavorite(document.title || window.location.href, window.location.href);
                    }
                } else {
                    window.showToast('无法收藏空白页');
                }
                window.closePanel('menu');
                break;
            case 'night':
                document.body.classList.toggle('night-mode');
                window.closePanel('menu');
                window.showToast(document.body.classList.contains('night-mode') ? '夜间模式已开启' : '夜间模式已关闭');
                break;
            case 'exit':
                if (confirm('确定退出应用吗？')) {
                    window.showToast('正在退出...');
                    setTimeout(function() { window.location.href = 'about:blank'; }, 500);
                }
                window.closePanel('menu');
                break;
            default:
                window.showToast('功能开发中');
                window.closePanel('menu');
        }
    };
})();