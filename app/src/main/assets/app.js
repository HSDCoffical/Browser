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
var favoritesData = [];

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
        var fav = localStorage.getItem('mybrowser_favorites');
        if (fav) favoritesData = JSON.parse(fav);

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
    localStorage.setItem('mybrowser_carousel_interval', String(carouselInterval));
}
function saveCarouselMode() {
    localStorage.setItem('mybrowser_carousel_mode', String(isCarouselMode));
}
function saveCustomEngines() {
    localStorage.setItem('mybrowser_custom_engines', JSON.stringify(customEngines));
}
function saveCurrentEngine() {
    localStorage.setItem('mybrowser_current_engine', JSON.stringify(currentEngine));
}
function saveWindows() {
    localStorage.setItem('mybrowser_windows', JSON.stringify(windows));
}
function saveIncognito() {
    localStorage.setItem('mybrowser_incognito', JSON.stringify(isIncognito));
}
function saveNightMode() {
    localStorage.setItem('mybrowser_night_mode', String(document.body.classList.contains('night-mode')));
}
function saveFavorites() {
    localStorage.setItem('mybrowser_favorites', JSON.stringify(favoritesData));
}

// ============================================================
// 背景管理
// ============================================================
function applyBgImage(index) {
    if (!bgImages || bgImages.length === 0) {
        document.body.style.backgroundImage = '';
        return;
    }
    var img = bgImages[index % bgImages.length];
    document.body.style.backgroundImage = 'url(' + img + ')';
    currentBgIndex = index;
    saveBgIndex();
    updateCarouselPreview();
}

function startCarousel() {
    stopCarousel();
    if (!isCarouselMode || !bgImages || bgImages.length < 2) return;
    var interval = parseInt(document.getElementById('carouselInterval').value) || 3;
    carouselInterval = interval;
    saveCarouselInterval();
    carouselTimer = setInterval(function() {
        var next = (currentBgIndex + 1) % bgImages.length;
        applyBgImage(next);
    }, carouselInterval * 1000);
}

function stopCarousel() {
    if (carouselTimer) {
        clearInterval(carouselTimer);
        carouselTimer = null;
    }
}

function updateCarouselPreview() {
    var container = document.getElementById('carouselPreview');
    if (!container) return;
    var html = '';
    bgImages.forEach(function(img, i) {
        var active = (i === currentBgIndex) ? 'active' : '';
        html += '<div class="cs-thumb-wrap">' +
                '<img src="' + img + '" class="cs-thumb ' + active + '" data-index="' + i + '">' +
                '<button class="cs-del" data-index="' + i + '">✕</button>' +
                '</div>';
    });
    container.innerHTML = html;

    container.querySelectorAll('.cs-thumb').forEach(function(el) {
        el.addEventListener('click', function() {
            var idx = parseInt(this.dataset.index);
            applyBgImage(idx);
            if (isCarouselMode && bgImages.length > 1) startCarousel();
        });
    });
    container.querySelectorAll('.cs-del').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            var idx = parseInt(this.dataset.index);
            bgImages.splice(idx, 1);
            saveBgImages();
            if (bgImages.length === 0) {
                document.body.style.backgroundImage = '';
                stopCarousel();
            } else {
                if (currentBgIndex >= bgImages.length) currentBgIndex = 0;
                applyBgImage(currentBgIndex);
                if (isCarouselMode && bgImages.length > 1) startCarousel();
            }
            updateCarouselPreview();
            window.showToast('已删除');
        });
    });
}

// ============================================================
// 引擎管理
// ============================================================
function getAllEngines() {
    return DEFAULT_ENGINES.concat(customEngines);
}
function renderEngineDropdown() {
    var container = document.getElementById('engineDropdown');
    if (!container) return;
    var all = getAllEngines();
    var currentName = currentEngine.name;
    var html = '';
    all.forEach(function(eng) {
        var checked = eng.name === currentName ? '✓' : '';
        html += '<div class="ed-item" data-engine=\'' + JSON.stringify(eng).replace(/'/g, "&#39;") + '\'>' +
                '<span>' + eng.name + '</span>' +
                (checked ? '<span class="ed-check">✓</span>' : '') +
                '</div>';
    });
    html += '<div class="ed-custom">' +
            '<input type="text" id="customEngineName" placeholder="引擎名称">' +
            '<input type="text" id="customEngineUrl" placeholder="URL（{q}）">' +
            '<button id="addCustomEngineBtn">添加</button>' +
            '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.ed-item[data-engine]').forEach(function(el) {
        el.addEventListener('click', function() {
            var eng = JSON.parse(this.dataset.engine);
            currentEngine = eng;
            saveCurrentEngine();
            updateEngineBtn();
            closeEngineDropdown();
            window.showToast('已切换到：' + eng.name);
        });
    });

    document.getElementById('addCustomEngineBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        var name = document.getElementById('customEngineName').value.trim();
        var url = document.getElementById('customEngineUrl').value.trim();
        if (!name || !url) {
            window.showToast('请填写名称和URL');
            return;
        }
        if (url.indexOf('{q}') === -1) {
            window.showToast('URL中请包含 {q} 作为关键词占位');
            return;
        }
        if (getAllEngines().some(function(e) { return e.name === name; })) {
            window.showToast('引擎名称已存在');
            return;
        }
        customEngines.push({ name: name, url: url });
        saveCustomEngines();
        document.getElementById('customEngineName').value = '';
        document.getElementById('customEngineUrl').value = '';
        renderEngineDropdown();
        window.showToast('已添加：' + name);
    });
}

function toggleEngineDropdown() {
    var dd = document.getElementById('engineDropdown');
    if (!dd) return;
    dd.classList.toggle('open');
    if (dd.classList.contains('open')) {
        renderEngineDropdown();
    }
}
function closeEngineDropdown() {
    var dd = document.getElementById('engineDropdown');
    if (dd) dd.classList.remove('open');
}
function updateEngineBtn() {
    var btn = document.getElementById('engineBtn');
    if (btn) {
        btn.textContent = currentEngine.name;
    }
}

// ============================================================
// 搜索
// ============================================================
function doSearch(query) {
    if (!query || !query.trim()) return;
    var q = query.trim();
    var url = '';
    if (q.indexOf('http://') === 0 || q.indexOf('https://') === 0) {
        url = q;
    } else if (q.indexOf('.') !== -1 && q.indexOf(' ') === -1) {
        url = 'https://' + q;
    } else {
        url = currentEngine.url.replace(/\{q\}/g, encodeURIComponent(q));
    }
    addWindow(q, url);
    window.location.href = url;
}

// ============================================================
// 窗口管理
// ============================================================
function addWindow(title, url) {
    var id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    windows.unshift({ id: id, title: title || url, url: url || 'about:blank', time: Date.now() });
    if (windows.length > 50) windows = windows.slice(0, 50);
    saveWindows();
    renderWindows();
}
function deleteWindow(id) {
    windows = windows.filter(function(w) { return w.id !== id; });
    saveWindows();
    renderWindows();
}
function renderWindows() {
    var container = document.getElementById('windowList');
    if (!container) return;
    if (windows.length === 0) {
        container.innerHTML = '<div class="window-empty">暂无窗口</div>';
        return;
    }
    var html = '';
    windows.forEach(function(w) {
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
            var w = windows.find(function(win) { return win.id === id; });
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
            deleteWindow(id);
            window.showToast('已删除窗口');
        });
    });
}

// ============================================================
// 收藏管理
// ============================================================
function renderFavorites() {
    var container = document.getElementById('favoritesList');
    if (!container) return;
    if (favoritesData.length === 0) {
        container.innerHTML = '<div class="window-empty">暂无收藏</div>';
        return;
    }
    var html = '';
    favoritesData.forEach(function(item, idx) {
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
            favoritesData.splice(idx, 1);
            saveFavorites();
            renderFavorites();
            window.showToast('已删除');
        });
    });
}

function addFavorite(title, url) {
    if (favoritesData.some(function(item) { return item.url === url; })) {
        window.showToast('已收藏');
        return;
    }
    favoritesData.unshift({ title: title || url, url: url, time: Date.now() });
    saveFavorites();
    renderFavorites();
    window.showToast('已收藏');
}
// ============================================================
// 面板控制
// ============================================================
var activePanel = null;
function openPanel(name) {
    closeAllPanels();
    activePanel = name;
    var overlay = document.getElementById(name + 'Overlay');
    var sheet = document.getElementById(name + 'Sheet');
    if (overlay) overlay.classList.add('show');
    if (sheet) sheet.classList.add('show');
    if (name === 'favorites') {
        renderFavorites();
    }
}
function closePanel(name) {
    var overlay = document.getElementById(name + 'Overlay');
    var sheet = document.getElementById(name + 'Sheet');
    if (overlay) overlay.classList.remove('show');
    if (sheet) sheet.classList.remove('show');
    if (activePanel === name) activePanel = null;
}
function closeAllPanels() {
    ['menu', 'window', 'settings', 'download', 'favorites'].forEach(function(name) {
        var overlay = document.getElementById(name + 'Overlay');
        var sheet = document.getElementById(name + 'Sheet');
        if (overlay) overlay.classList.remove('show');
        if (sheet) sheet.classList.remove('show');
    });
    activePanel = null;
}

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
        case 'favorites':
            closePanel('menu');
            openPanel('favorites');
            break;
        case 'tools':
            closePanel('menu');
            loadToolsModule();
            break;
        case 'fav':
            if (window.location.href && window.location.href !== 'about:blank') {
                addFavorite(document.title || window.location.href, window.location.href);
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