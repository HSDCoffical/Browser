// ============================================================
// 菜单功能模块
// ============================================================
(function() {
    'use strict';
    try {
        window.handleMenuAction = function(action) {
            switch (action) {
                case 'settings':
                    window.closePanel('menu');
                    window.openPanel('settings');
                    break;
                case 'download':
                    window.closePanel('menu');
                    window.openPanel('download');
                    if (typeof window.renderDownloadList === 'function') {
                        window.renderDownloadList();
                    }
                    break;
                case 'favorites':
                    window.closePanel('menu');
                    window.openPanel('favorites');
                    break;
                case 'tools':
                    window.closePanel('menu');
                    if (typeof window.loadToolsModule === 'function') {
                        window.loadToolsModule();
                    } else {
                        window.showToast('工具箱功能加载中...');
                    }
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
                case 'exit':
                    if (confirm('确定退出应用吗？')) {
                        window.showToast('正在退出...');
                        setTimeout(function() {
                            window.location.href = 'about:blank';
                        }, 500);
                    }
                    window.closePanel('menu');
                    break;
                default:
                    window.showToast('功能开发中');
                    window.closePanel('menu');
            }
        };

        console.log('✅ 菜单模块加载成功');
    } catch(e) {
        console.error('❌ 菜单模块加载失败:', e);
        window.handleMenuAction = function() {};
    }
})();