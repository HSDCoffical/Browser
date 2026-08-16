// ============================================================
// 初始化入口
// ============================================================
(function() {
    'use strict';

    function initApp() {
        // 问候语
        if (typeof window.setGreeting === 'function') window.setGreeting();

        // 刷新按钮
        var refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                window.location.reload();
            });
        }

        // 翻译按钮
        var translateBtn = document.getElementById('translateBtn');
        if (translateBtn) {
            translateBtn.addEventListener('click', function() {
                var currentUrl = window.location.href;
                if (currentUrl && currentUrl !== 'about:blank' && !currentUrl.startsWith('file://')) {
                    window.open('https://translate.google.com/translate?sl=auto&tl=zh-CN&u=' + encodeURIComponent(currentUrl), '_blank');
                } else {
                    window.showToast('无法翻译');
                }
            });
        }

        // 下载面板打开时刷新列表
        var downloadSheet = document.getElementById('downloadSheet');
        if (downloadSheet && window.DownloadManager) {
            var observer = new MutationObserver(function() {
                if (downloadSheet.classList.contains('show')) {
                    window.DownloadManager.render();
                }
            });
            observer.observe(downloadSheet, { attributes: true, attributeFilter: ['class'] });
        }

        // 历史/收藏标签切换
        var favTab = document.getElementById('historyTabFav');
        var histTab = document.getElementById('historyTabHist');
        if (favTab && histTab) {
            favTab.addEventListener('click', function() {
                if (typeof window.renderHistory === 'function') window.renderHistory('fav');
                this.style.background = '#2979ff';
                histTab.style.background = '#888';
            });
            histTab.addEventListener('click', function() {
                if (typeof window.renderHistory === 'function') window.renderHistory('hist');
                this.style.background = '#2979ff';
                favTab.style.background = '#888';
            });
        }
    }

    function startApp() {
        try {
            if (typeof window.loadData === 'function') window.loadData();
            if (typeof window.updateEngineBtn === 'function') window.updateEngineBtn();
            if (typeof window.renderWindows === 'function') window.renderWindows();
            if (typeof window.setupBackgroundPicker === 'function') window.setupBackgroundPicker();
            if (typeof window.updateCarouselPreview === 'function') window.updateCarouselPreview();
            if (window.bgImages && window.bgImages.length > 0) {
                if (window.isCarouselMode && window.bgImages.length > 1) {
                    if (typeof window.startCarousel === 'function') window.startCarousel();
                }
            }
            initApp();

            // 事件绑定
            var searchBtn = document.getElementById('searchBtn');
            var searchInput = document.getElementById('searchInput');
            var engineBtn = document.getElementById('engineBtn');
            var navMenu = document.getElementById('navMenu');
            var navWindow = document.getElementById('navWindow');
            var addWindowBtn = document.getElementById('addWindowBtn');

            if (searchBtn) {
                searchBtn.addEventListener('click', function() {
                    if (typeof window.doSearch === 'function') {
                        window.doSearch(searchInput.value);
                    }
                });
            }
            if (searchInput) {
                searchInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (typeof window.doSearch === 'function') {
                            window.doSearch(this.value);
                        }
                    }
                });
            }

            if (engineBtn) {
                engineBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (typeof window.toggleEngineDropdown === 'function') {
                        window.toggleEngineDropdown();
                    }
                });
            }

            document.addEventListener('click', function(e) {
                var dd = document.getElementById('engineDropdown');
                var btn = document.getElementById('engineBtn');
                if (dd && btn && !dd.contains(e.target) && !btn.contains(e.target)) {
                    if (typeof window.closeEngineDropdown === 'function') {
                        window.closeEngineDropdown();
                    }
                }
            });

            if (navMenu) {
                navMenu.addEventListener('click', function() {
                    if (window.activePanel === 'menu') {
                        window.closePanel('menu');
                        return;
                    }
                    window.openPanel('menu');
                });
            }
            if (navWindow) {
                navWindow.addEventListener('click', function() {
                    if (window.activePanel === 'window') {
                        window.closePanel('window');
                        return;
                    }
                    if (typeof window.renderWindows === 'function') {
                        window.renderWindows();
                    }
                    window.openPanel('window');
                });
            }

            document.querySelectorAll('.panel-close').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    window.closePanel(this.dataset.close);
                });
            });
            document.querySelectorAll('.panel-overlay').forEach(function(overlay) {
                overlay.addEventListener('click', function() {
                    var name = this.id.replace('Overlay', '');
                    window.closePanel(name);
                });
            });

            document.querySelectorAll('.menu-item').forEach(function(item) {
                item.addEventListener('click', function() {
                    var action = this.dataset.action;
                    if (typeof window.handleMenuAction === 'function') {
                        window.handleMenuAction(action);
                    }
                });
            });

            if (addWindowBtn) {
                addWindowBtn.addEventListener('click', function() {
                    var id = 'win_' + Date.now();
                    window.windows.unshift({ id: id, title: '新窗口', url: 'about:blank', time: Date.now() });
                    window.saveWindows();
                    if (typeof window.renderWindows === 'function') {
                        window.renderWindows();
                    }
                    window.showToast('已创建新窗口');
                    window.location.href = 'about:blank';
                });
            }

            setTimeout(function() {
                if (searchInput) searchInput.focus();
            }, 300);
        } catch(e) {
            console.warn('startApp 执行出错', e);
        }
    }

    // 启动入口
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }
})();