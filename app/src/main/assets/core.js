// ============================================================
// 核心数据与存储（修复引擎加载覆盖问题）
// ============================================================
(function() {
    'use strict';

    // 全局 Toast
    window.showToast = function(msg) {
        var el = document.getElementById('toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(window.toastTimer);
        window.toastTimer = setTimeout(function() { el.classList.remove('show'); }, 1800);
    };

    // 默认引擎列表
    window.DEFAULT_ENGINES = [
        { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' },
        { name: '百度', url: 'https://www.baidu.com/s?wd={q}' },
        { name: '谷歌', url: 'https://www.google.com/search?q={q}' }
    ];

    // 初始化数据（先给默认值，loadData 会覆盖）
    window.currentEngine = { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' };
    window.customEngines = [];
    window.windows = [];
    window.bgImages = [];
    window.currentBgIndex = 0;
    window.carouselTimer = null;
    window.carouselInterval = 3;
    window.isCarouselMode = false;
    window.favorites = [];
    window.history = [];

    // 存储函数
    window.saveBgImages = function() { localStorage.setItem('mybrowser_bg_images', JSON.stringify(window.bgImages)); };
    window.saveBgIndex = function() { localStorage.setItem('mybrowser_bg_index', String(window.currentBgIndex)); };
    window.saveCarouselInterval = function() { localStorage.setItem('mybrowser_carousel_interval', String(window.carouselInterval)); };
    window.saveCarouselMode = function() { localStorage.setItem('mybrowser_carousel_mode', String(window.isCarouselMode)); };
    window.saveCustomEngines = function() { localStorage.setItem('mybrowser_custom_engines', JSON.stringify(window.customEngines)); };
    window.saveCurrentEngine = function() { localStorage.setItem('mybrowser_current_engine', JSON.stringify(window.currentEngine)); };
    window.saveWindows = function() { localStorage.setItem('mybrowser_windows', JSON.stringify(window.windows)); };
    window.saveFavorites = function() { localStorage.setItem('mybrowser_favorites', JSON.stringify(window.favorites)); };
    window.saveHistory = function() { localStorage.setItem('mybrowser_history', JSON.stringify(window.history)); };

    // 加载数据（优先使用保存的引擎，如果没有则用默认）
    window.loadData = function() {
        try {
            // 加载自定义引擎
            var ce = localStorage.getItem('mybrowser_custom_engines');
            if (ce) window.customEngines = JSON.parse(ce);
            // 加载当前引擎（如果保存过则使用，否则保留默认）
            var eng = localStorage.getItem('mybrowser_current_engine');
            if (eng) {
                window.currentEngine = JSON.parse(eng);
            } else {
                // 保留默认的必应
                window.currentEngine = { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' };
            }
            var ws = localStorage.getItem('mybrowser_windows');
            if (ws) window.windows = JSON.parse(ws);
            var bg = localStorage.getItem('mybrowser_bg_images');
            if (bg) window.bgImages = JSON.parse(bg);
            var idx = localStorage.getItem('mybrowser_bg_index');
            if (idx) window.currentBgIndex = parseInt(idx) || 0;
            var interval = localStorage.getItem('mybrowser_carousel_interval');
            if (interval) window.carouselInterval = parseInt(interval) || 3;
            var mode = localStorage.getItem('mybrowser_carousel_mode');
            window.isCarouselMode = (mode === 'true');
            var fav = localStorage.getItem('mybrowser_favorites');
            if (fav) window.favorites = JSON.parse(fav);
            var hist = localStorage.getItem('mybrowser_history');
            if (hist) window.history = JSON.parse(hist);

            // 恢复UI状态
            var toggle = document.getElementById('carouselToggle');
            if (toggle) {
                if (window.isCarouselMode) toggle.classList.add('active');
                else toggle.classList.remove('active');
            }
            var settings = document.getElementById('carouselSettings');
            if (settings) {
                settings.style.display = window.isCarouselMode ? 'block' : 'none';
            }
            var label = document.getElementById('pickerLabel');
            if (label) {
                label.textContent = window.isCarouselMode ? '选择背景图片（多选）' : '选择背景图片';
            }
            var el = document.getElementById('carouselInterval');
            if (el) el.value = window.carouselInterval;

            // 应用背景
            if (window.bgImages && window.bgImages.length > 0) {
                if (typeof window.applyBgImage === 'function') {
                    window.applyBgImage(window.currentBgIndex);
                }
            }

            // 更新引擎按钮文字
            if (typeof window.updateEngineBtn === 'function') {
                window.updateEngineBtn();
            }
        } catch(e) {
            console.warn('loadData 出错', e);
        }
    };
})();