// ============================================================
// 面板控制模块
// ============================================================
(function() {
    'use strict';
    try {
        window.activePanel = null;

        window.openPanel = function(name) {
            window.closeAllPanels();
            window.activePanel = name;
            var overlay = document.getElementById(name + 'Overlay');
            var sheet = document.getElementById(name + 'Sheet');
            if (overlay) overlay.classList.add('show');
            if (sheet) sheet.classList.add('show');
            if (name === 'favorites' && typeof window.renderFavorites === 'function') {
                window.renderFavorites();
            }
        };

        window.closePanel = function(name) {
            var overlay = document.getElementById(name + 'Overlay');
            var sheet = document.getElementById(name + 'Sheet');
            if (overlay) overlay.classList.remove('show');
            if (sheet) sheet.classList.remove('show');
            if (window.activePanel === name) window.activePanel = null;
        };

        window.closeAllPanels = function() {
            ['menu', 'window', 'settings', 'download', 'favorites'].forEach(function(name) {
                var overlay = document.getElementById(name + 'Overlay');
                var sheet = document.getElementById(name + 'Sheet');
                if (overlay) overlay.classList.remove('show');
                if (sheet) sheet.classList.remove('show');
            });
            window.activePanel = null;
        };

        console.log('✅ 面板模块加载成功');
    } catch(e) {
        console.error('❌ 面板模块加载失败:', e);
        window.openPanel = function() {};
        window.closePanel = function() {};
        window.closeAllPanels = function() {};
    }
})();