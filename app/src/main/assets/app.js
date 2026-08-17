// ============================================================
// 全局 Toast
// ============================================================
window.showToast = function(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(function() {
        el.classList.remove('show');
    }, 1800);
};

// ============================================================
// 问候语设置
// ============================================================
function setGreeting() {
    var el = document.getElementById('greeting');
    if (!el) return;
    var hour = new Date().getHours();
    var msg = '';
    if (hour >= 5 && hour < 9) msg = '早上好 ☀️';
    else if (hour >= 9 && hour < 12) msg = '上午好 🌤️';
    else if (hour >= 12 && hour < 14) msg = '中午好 ☀️';
    else if (hour >= 14 && hour < 18) msg = '下午好 🌤️';
    else if (hour >= 18 && hour < 21) msg = '傍晚好 🌅';
    else msg = '晚上好 🌙';
    el.textContent = msg;
}

// ============================================================
// 数据层
// ============================================================
var DEFAULT_ENGINES = [
    { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' },
    { name: '百度', url: 'https://www.baidu.com/s?wd={q}' },
    { name: '谷歌', url: 'https://www.google.com/search?q={q}' }
];
var currentEngine = { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' };
var customEngines = [];
var windows = [];
var isIncognito = false;
var bgImages = [];
var currentBgIndex = 0;
var carouselTimer = null;
var carouselInterval = 3;
var isCarouselMode = false;

// ============================================================
// 存储
// ============================================================
function loadData() {
    try {
        var ce = localStorage.getItem('mybrowser_custom_engines');
        if (ce) customEngines = JSON.parse(ce);
        var eng = localStorage.getItem('mybrowser_current_engine');
        if (eng) currentEngine = JSON.parse(eng);
        var ws = localStorage.getItem('mybrowser_windows');
        if (ws) windows = JSON.parse(ws);
        var incog = localStorage.getItem('mybrowser_incognito');
        if (incog) isIncognito = JSON.parse(incog);
        var bg = localStorage.getItem('mybrowser_bg_images');
        if (bg) bgImages = JSON.parse(bg);
        var idx = localStorage.getItem('mybrowser_bg_index');
        if (idx) currentBgIndex = parseInt(idx) || 0;
        var interval = localStorage.getItem('mybrowser_carousel_interval');
        if (interval) carouselInterval = parseInt(interval) || 3;
        var mode = localStorage.getItem('mybrowser_carousel_mode');
        isCarouselMode = (mode === 'true');

        if (bgImages && bgImages.length > 0) {
            applyBgImage(currentBgIndex);
        }
        var toggle = document.getElementById('carouselToggle');
        if (toggle) {
            if (isCarouselMode) toggle.classList.add('active');
            else toggle.classList.remove('active');
        }
        var settings = document.getElementById('carouselSettings');
        if (settings) {
            settings.style.display = isCarouselMode ? 'block' : 'none';
        }
        var label = document.getElementById('pickerLabel');
        if (label) {
            label.textContent = isCarouselMode ? '选择背景图片（多选）' : '选择背景图片';
        }
        var el = document.getElementById('carouselInterval');
        if (el) el.value = carouselInterval;
        
        var nightMode = localStorage.getItem('mybrowser_night_mode');
        if (nightMode === 'true') {
            document.body.classList.add('night-mode');
            var nightToggle = document.getElementById('nightModeToggleMenu');
            if (nightToggle) nightToggle.classList.add('active');
        }
    } catch (e) { /* ignore */ }
}

function saveBgImages() {
    localStorage.setItem('mybrowser_bg_images', JSON.stringify(bgImages));
}
function saveBgIndex() {
    localStorage.setItem('mybrowser_bg_index', String(currentBgIndex));
}
function saveCarouselInterval() {
// ============================================================
// 菜单功能
// ============================================================
function handleMenuAction(action) {
    switch (action) {
        case 'settings':
            closePanel('menu');
            openPanel('settings');
            break;
        case 'download':
            closePanel('menu');
            openPanel('download');
            if (typeof window.renderDownloadList === 'function') {
                window.renderDownloadList();
            }
            break;
        case 'history':
            closePanel('menu');
            if (typeof window.openHistoryPanel === 'function') {
                window.openHistoryPanel();
            } else {
                window.showToast('历史功能加载中，请稍后...');
            }
            break;
        case 'tools':
            closePanel('menu');
            loadToolsModule();
            break;
        case 'fav':
            if (window.location.href && window.location.href !== 'about:blank') {
                if (typeof window.addFavorite === 'function') {
                    window.addFavorite(document.title || window.location.href, window.location.href);
                } else {
                    window.showToast('已收藏当前页面（演示）');
                }
            } else {
                window.showToast('无法收藏空白页');
            }
            closePanel('menu');
            break;
        case 'exit':
            if (confirm('确定退出应用吗？')) {
                window.showToast('正在退出...');
                setTimeout(function() {
                    window.location.href = 'about:blank';
                }, 500);
            }
            closePanel('menu');
            break;
        default:
            window.showToast('功能开发中');
            closePanel('menu');
    }
}

// ============================================================
// 动态加载工具箱模块
// ============================================================
var toolsLoaded = false;
function loadToolsModule() {
    if (toolsLoaded) {
        if (typeof window.openToolsPanel === 'function') {
            window.openToolsPanel();
        } else {
            window.showToast('工具箱已加载，但初始化失败，请重试');
        }
        return;
    }
    var script = document.createElement('script');
    script.src = 'tools.js';
    script.onload = function() {
        toolsLoaded = true;
        if (typeof window.openToolsPanel === 'function') {
            window.openToolsPanel();
        } else {
            window.showToast('工具箱加载成功，但初始化函数缺失');
        }
    };
    script.onerror = function() {
        window.showToast('工具箱加载失败，请检查 tools.js 文件是否存在');
    };
    document.head.appendChild(script);
}

// ============================================================
// 夜间模式切换（菜单开关调用）
// ============================================================
function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    var toggle = document.getElementById('nightModeToggleMenu');
    if (toggle) {
        toggle.classList.toggle('active');
    }
    saveNightMode();
    window.showToast(document.body.classList.contains('night-mode') ? '夜间模式已开启' : '夜间模式已关闭');
}

// ============================================================
// 背景设置
// ============================================================
function setupBackgroundPicker() {
    var fileInput = document.getElementById('bgFileInput');
    var trigger = document.getElementById('bgPickerTrigger');
    var reset = document.getElementById('resetBg');
    var toggle = document.getElementById('carouselToggle');

    if (!toggle) return;
    toggle.addEventListener('click', function() {
        isCarouselMode = !isCarouselMode;
        this.classList.toggle('active');
        saveCarouselMode();
        var settings = document.getElementById('carouselSettings');
        if (isCarouselMode) {
            settings.style.display = 'block';
            document.getElementById('pickerLabel').textContent = '选择背景图片（多选）';
            fileInput.setAttribute('multiple', 'multiple');
            if (bgImages.length > 1) {
                startCarousel();
            }
        } else {
            settings.style.display = 'none';
            document.getElementById('pickerLabel').textContent = '选择背景图片';
            fileInput.removeAttribute('multiple');
            stopCarousel();
            if (bgImages.length > 1) {
                var first = bgImages[0];
                bgImages = [first];
                saveBgImages();
                currentBgIndex = 0;
                applyBgImage(0);
                updateCarouselPreview();
                window.showToast('已切换为单图模式');
            }
        }
    });

    trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        var files = e.target.files;
        if (!files || files.length === 0) return;

        if (isCarouselMode) {
            var total = bgImages.length + files.length;
            if (total > 9) {
                window.showToast('最多选择9张图片');
                this.value = '';
                return;
            }
            var loaded = 0;
            for (var i = 0; i < files.length; i++) {
                (function(file) {
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        bgImages.push(ev.target.result);
                        loaded++;
                        if (loaded === files.length) {
                            saveBgImages();
                            if (bgImages.length === 1) {
                                applyBgImage(0);
                            } else {
                                startCarousel();
                            }
                            updateCarouselPreview();
                            window.showToast('已添加 ' + files.length + ' 张图片');
                            closePanel('settings');
                        }
                    };
                    reader.readAsDataURL(file);
                })(files[i]);
            }
        } else {
            var file = files[0];
            var reader = new FileReader();
            reader.onload = function(ev) {
                var dataUrl = ev.target.result;
                bgImages = [dataUrl];
                saveBgImages();
                currentBgIndex = 0;
                applyBgImage(0);
                updateCarouselPreview();
                window.showToast('背景图片已更新');
                closePanel('settings');
            };
            reader.readAsDataURL(file);
        }
        this.value = '';
    });

    reset.addEventListener('click', function() {
        bgImages = [];
        saveBgImages();
        stopCarousel();
        document.body.style.backgroundImage = '';
        updateCarouselPreview();
        window.showToast('已恢复默认背景');
        closePanel('settings');
    });

    document.getElementById('carouselInterval').addEventListener('change', function() {
        var val = parseInt(this.value) || 3;
        carouselInterval = val;
        saveCarouselInterval();
        if (isCarouselMode && bgImages.length > 1) {
            startCarousel();
        }
    });
}

// ============================================================
// 顶部栏控制（由 Java 调用）
// ============================================================
window.updateTopBar = function(title, url) {
    var topBar = document.getElementById('topBar');
    var titleEl = document.getElementById('topTitle');
    if (!topBar || !titleEl) return;

    var isLocal = (url && (url.indexOf('file://') === 0 || url === 'about:blank'));
    if (isLocal || !url || url === '') {
        topBar.style.display = 'none';
    } else {
        topBar.style.display = 'flex';
        titleEl.textContent = title || url;
        titleEl.title = url;
    }
};

// ============================================================
// 下载管理
// ============================================================
window.renderDownloadList = function() {
    var list = document.getElementById('downloadList');
    if (!list) {
        list = document.getElementById('downloadListContainer');
    }
    if (!list) return;
    var downloads = [];
    try {
        var data = localStorage.getItem('mybrowser_downloads');
        if (data) downloads = JSON.parse(data);
    } catch(e) {}
    if (downloads.length === 0) {
        list.innerHTML = '<div class="func-item" style="text-align:center;color:#999;">暂无下载记录</div>';
        return;
    }
    var html = '';
    downloads.forEach(function(item, idx) {
        html += '<div class="func-item">' +
                '<div class="func-info">' +
                '<div class="func-title">' + (item.name || '未知文件') + '</div>' +
                '<div class="func-desc">' + (item.url || '') + '</div>' +
                '</div>' +
                '<div style="display:flex;gap:4px;">' +
                '<button class="func-action" data-url="' + item.url + '">打开</button>' +
                '<button class="func-del" data-idx="' + idx + '">✕</button>' +
                '</div>' +
                '</div>';
    });
    list.innerHTML = html;

    list.querySelectorAll('.func-action').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var url = this.dataset.url;
            if (url) {
                var a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.download = '';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    });
    list.querySelectorAll('.func-del').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(this.dataset.idx);
            downloads.splice(idx, 1);
            localStorage.setItem('mybrowser_downloads', JSON.stringify(downloads));
            window.renderDownloadList();
            window.showToast('已删除');
        });
    });
};

window.addDownloadItem = function(name, url) {
    var downloads = [];
    try {
        var data = localStorage.getItem('mybrowser_downloads');
        if (data) downloads = JSON.parse(data);
    } catch(e) {}
    downloads.push({ name: name || '下载文件', url: url, time: Date.now() });
    localStorage.setItem('mybrowser_downloads', JSON.stringify(downloads));
    if (typeof window.renderDownloadList === 'function') {
        window.renderDownloadList();
    }
    window.showToast('下载已添加到列表');
};

// ============================================================
// 初始化事件
// ============================================================
function initApp() {
    setGreeting();

    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            window.location.reload();
        });
    }

    var translateBtn = document.getElementById('translateBtn');
    if (translateBtn) {
        translateBtn.addEventListener('click', function() {
            var currentUrl = window.location.href;
            if (currentUrl && currentUrl !== 'about:blank' && !currentUrl.startsWith('file://')) {
                var transUrl = 'https://translate.google.com/translate?sl=auto&tl=zh-CN&u=' + encodeURIComponent(currentUrl);
                window.open(transUrl, '_blank');
            } else {
                window.showToast('无法翻译当前页面');
            }
        });
    }

    var downloadSheet = document.getElementById('downloadSheet');
    if (downloadSheet) {
        var observer = new MutationObserver(function() {
            if (downloadSheet.classList.contains('show')) {
                if (typeof window.renderDownloadList === 'function') {
                    window.renderDownloadList();
                }
            }
        });
        observer.observe(downloadSheet, { attributes: true, attributeFilter: ['class'] });
    }
    
    var nightToggle = document.getElementById('nightModeToggleMenu');
    if (nightToggle) {
        nightToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleNightMode();
        });
    }
}

// ============================================================
// 启动
// ============================================================
function startApp() {
    loadData();
    updateEngineBtn();
    renderWindows();
    setupBackgroundPicker();
    updateCarouselPreview();
    if (bgImages && bgImages.length > 0) {
        if (isCarouselMode && bgImages.length > 1) {
            startCarousel();
        }
    }
    initApp();

    var searchBtn = document.getElementById('searchBtn');
    var searchInput = document.getElementById('searchInput');
    var engineBtn = document.getElementById('engineBtn');
    var navMenu = document.getElementById('navMenu');
    var navWindow = document.getElementById('navWindow');
    var addWindowBtn = document.getElementById('addWindowBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            doSearch(searchInput.value);
        });
    }
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                doSearch(this.value);
            }
        });
    }

    if (engineBtn) {
        engineBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleEngineDropdown();
        });
    }

    document.addEventListener('click', function(e) {
        var dd = document.getElementById('engineDropdown');
        var btn = document.getElementById('engineBtn');
        if (dd && btn && !dd.contains(e.target) && !btn.contains(e.target)) {
            closeEngineDropdown();
        }
    });

    if (navMenu) {
        navMenu.addEventListener('click', function() {
            if (activePanel === 'menu') { closePanel('menu'); return; }
            openPanel('menu');
        });
    }
    if (navWindow) {
        navWindow.addEventListener('click', function() {
            if (activePanel === 'window') { closePanel('window'); return; }
            renderWindows();
            openPanel('window');
        });
    }

    document.querySelectorAll('.panel-close').forEach(function(btn) {
        btn.addEventListener('click', function() {
            closePanel(this.dataset.close);
        });
    });
    document.querySelectorAll('.panel-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function() {
            var name = this.id.replace('Overlay', '');
            closePanel(name);
        });
    });

    document.querySelectorAll('.menu-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var action = this.dataset.action;
            handleMenuAction(action);
        });
    });

    if (addWindowBtn) {
        addWindowBtn.addEventListener('click', function() {
            var id = 'win_' + Date.now();
            windows.unshift({ id: id, title: '新窗口', url: 'about:blank', time: Date.now() });
            saveWindows();
            renderWindows();
            window.showToast('已创建新窗口');
            window.location.href = 'about:blank';
        });
    }

    setTimeout(function() {
        if (searchInput) searchInput.focus();
    }, 300);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}