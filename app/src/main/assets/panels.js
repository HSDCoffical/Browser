// ============================================================
// 面板控制模块
// ============================================================
(function() {
    'use strict';

    window.activePanel = null;

    window.openPanel = function(name) {
        window.closeAllPanels();
        window.activePanel = name;
        var overlay = document.getElementById(name + 'Overlay');
        var sheet = document.getElementById(name + 'Sheet');
        if (overlay) overlay.classList.add('show');
        if (sheet) sheet.classList.add('show');
    };

    window.closePanel = function(name) {
        var overlay = document.getElementById(name + 'Overlay');
        var sheet = document.getElementById(name + 'Sheet');
        if (overlay) overlay.classList.remove('show');
        if (sheet) sheet.classList.remove('show');
        if (window.activePanel === name) window.activePanel = null;
    };

    window.closeAllPanels = function() {
        ['menu', 'window', 'settings', 'download', 'history', 'tools'].forEach(function(name) {
            var overlay = document.getElementById(name + 'Overlay');
            var sheet = document.getElementById(name + 'Sheet');
            if (overlay) overlay.classList.remove('show');
            if (sheet) sheet.classList.remove('show');
        });
        window.activePanel = null;
    };
})();