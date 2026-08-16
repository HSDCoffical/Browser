// ============================================================
// Toast
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
// 问候语
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
var bgImages = [];
var currentBgIndex = 0;
var carouselTimer = null;
var carouselInterval = 3;
var isCarouselMode = false;
var favorites = [];
var history = [];

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
        var bg = localStorage.getItem('mybrowser_bg_images');
        if (bg) bgImages = JSON.parse(bg);
        var idx = localStorage.getItem('mybrowser_bg_index');
        if (idx) currentBgIndex = parseInt(idx) || 0;
        var interval = localStorage.getItem('mybrowser_carousel_interval');
        if (interval) carouselInterval = parseInt(interval) || 3;
        var mode = localStorage.getItem('mybrowser_carousel_mode');
        isCarouselMode = (mode === 'true');
        var fav = localStorage.getItem('mybrowser_favorites');
        if (fav) favorites = JSON.parse(fav);
        var hist = localStorage.getItem('mybrowser_history');
        if (hist) history = JSON.parse(hist);

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
    } catch(e) {}
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
function saveFavorites() {
    localStorage.setItem('mybrowser_favorites', JSON.stringify(favorites));
}
function saveHistory() {
    localStorage.setItem('mybrowser_history', JSON.stringify(history));
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
            window.showToast('URL中请包含 {q}');
            return;
        }
        if (getAllEngines().some(function(e) { return e.name === name; })) {
            window.showToast('引擎已存在');
            return;
        }
        customEngines.push({ name: name, url: url });
        saveCustomEngines();
        document.getElementById('customEngineName').value = '';
        document.getElementById('customEngineUrl').value = '';
        renderEngineDropdown();
        window.showToast('已添加');
    });
}

function toggleEngineDropdown() {
    var dd = document.getElementById('engineDropdown');
    dd.classList.toggle('open');
    if (dd.classList.contains('open')) {
        renderEngineDropdown();
    }
}
function closeEngineDropdown() {
    document.getElementById('engineDropdown').classList.remove('open');
}
function updateEngineBtn() {
    document.getElementById('engineBtn').textContent = currentEngine.name + ' ›';
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
    addHistory(q, url);
    addWindow(q, url);
    window.location.href = url;
}

// ============================================================
// 历史/收藏
// ============================================================
function addHistory(title, url) {
    history = history.filter(function(item) { return item.url !== url; });
    history.unshift({ title: title || url, url: url, time: Date.now() });
    if (history.length > 100) history = history.slice(0, 100);
    saveHistory();
}
function addFavorite(title, url) {
    if (favorites.some(function(item) { return item.url === url; })) {
        window.showToast('已收藏');
        return;
    }
    favorites.unshift({ title: title || url, url: url, time: Date.now() });
    saveFavorites();
    window.showToast('已收藏');
}
function renderHistory(mode) {
    var list = document.getElementById('historyList');
    var data = mode === 'fav' ? favorites : history;
    if (data.length === 0) {
        list.innerHTML = '<div class="func-item">暂无记录</div>';
        return;
    }
    var html = '';
    data.forEach(function(item, idx) {
        html += '<div class="func-item">' +
                '<div class="func-info">' +
                '<div class="func-title">' + item.title + '</div>' +
                '<div class="func-desc">' + item.url + '</div>' +
                '</div>' +
                '<div style="display:flex;gap:4px;">' +
                '<button class="func-action" data-url="' + item.url + '">打开</button>' +
                '<button class="func-del" data-idx="' + idx + '" data-mode="' + mode + '">✕</button>' +
                '</div>' +
                '</div>';
    });
    list.innerHTML = html;

    list.querySelectorAll('.func-action').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var url = this.dataset.url;
            if (url) window.location.href = url;
        });
    });
    list.querySelectorAll('.func-del').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(this.dataset.idx);
            var mode = this.dataset.mode;
            if (mode === 'fav') {
                favorites.splice(idx, 1);
                saveFavorites();
            } else {
                history.splice(idx, 1);
                saveHistory();
            }
            renderHistory(mode);
            window.showToast('已删除');
        });
    });
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
                addHistory(w.title, w.url);
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
}
function closePanel(name) {
    var overlay = document.getElementById(name + 'Overlay');
    var sheet = document.getElementById(name + 'Sheet');
    if (overlay) overlay.classList.remove('show');
    if (sheet) sheet.classList.remove('show');
    if (activePanel === name) activePanel = null;
}
function closeAllPanels() {
    ['menu', 'window', 'settings', 'download', 'history', 'tools'].forEach(function(name) {
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
            window.DownloadManager.render();
            break;
        case 'history':
            closePanel('menu');
            renderHistory('fav');
            openPanel('history');
            break;
        case 'tools':
            closePanel('menu');
            openPanel('tools');
            break;
        case 'fav':
            if (window.location.href && window.location.href !== 'about:blank') {
                addFavorite(document.title || window.location.href, window.location.href);
            } else {
                window.showToast('无法收藏空白页');
            }
            closePanel('menu');
            break;
        case 'night':
            document.body.classList.toggle('night-mode');
            closePanel('menu');
            window.showToast(document.body.classList.contains('night-mode') ? '夜间模式已开启' : '夜间模式已关闭');
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
// 背景设置
// ============================================================
function setupBackgroundPicker() {
    var fileInput = document.getElementById('bgFileInput');
    var trigger = document.getElementById('bgPickerTrigger');
    var reset = document.getElementById('resetBg');
    var toggle = document.getElementById('carouselToggle');

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
                window.showToast('背景已更新');
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
// 顶部栏
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
    }
};

// ============================================================
// 下载管理（模拟实现，不依赖Java接口）
// ============================================================
window.DownloadManager = {
    tasks: {},
    addTask: function(id, name, totalSize) {
        this.tasks[id] = { id: id, name: name, totalSize: totalSize || 0, downloadedSize: 0, speed: 0, status: 'downloading', progress: 0, filePath: null };
        this.render();
    },
    updateProgress: function(id, downloaded, total, speed) {
        var task = this.tasks[id];
        if (!task) return;
        task.downloadedSize = downloaded;
        if (total) task.totalSize = total;
        task.speed = speed || 0;
        task.progress = task.totalSize > 0 ? (downloaded / task.totalSize) * 100 : 0;
        if (task.progress >= 100) task.status = 'done';
        this.render();
    },
    complete: function(id, filePath) {
        var task = this.tasks[id];
        if (!task) return;
        task.status = 'done';
        task.progress = 100;
        task.downloadedSize = task.totalSize;
        task.filePath = filePath;
        this.render();
    },
    togglePause: function(id) {
        var task = this.tasks[id];
        if (!task || task.status === 'done') return;
        task.status = (task.status === 'paused') ? 'downloading' : 'paused';
        // 模拟暂停/继续效果，实际需Java配合
        this.render();
    },
    cancel: function(id) {
        delete this.tasks[id];
        this.render();
    },
    install: function(id) {
        var task = this.tasks[id];
        if (!task || task.status !== 'done' || !task.filePath) {
            window.showToast('文件不存在');
            return;
        }
        window.showToast('安装功能需Java端实现');
    },
    render: function() {
        var container = document.getElementById('downloadListContainer');
        if (!container) return;
        var ids = Object.keys(this.tasks);
        if (ids.length === 0) {
            container.innerHTML = '<div class="func-item" style="text-align:center;color:#999;">暂无下载记录</div>';
            return;
        }
        var html = '';
        var self = this;
        ids.forEach(function(id) {
            var task = self.tasks[id];
            var statusText = { downloading: '下载中', paused: '已暂停', done: '已完成', error: '错误' }[task.status] || '';
            var progress = Math.round(task.progress);
            var sizeText = self._formatSize(task.downloadedSize) + ' / ' + self._formatSize(task.totalSize);
            var speedText = task.speed ? self._formatSize(task.speed) + '/s' : '0B/s';
            var isDone = task.status === 'done';
            var isPaused = task.status === 'paused';
            var statusClass = isDone ? 'done' : (isPaused ? 'paused' : '');
            html += '<div class="download-item ' + statusClass + '" data-id="' + id + '">';
            html += '  <div class="di-header"><span class="di-name">' + task.name + '</span><span class="di-status">' + statusText + '</span></div>';
            html += '  <div class="di-progress-track"><div class="di-progress-fill" style="width:' + progress + '%;"></div></div>';
            html += '  <div class="di-info"><span>' + sizeText + '</span><span>' + speedText + '</span></div>';
            html += '  <div class="di-actions">';
            if (!isDone) {
                html += '    <button class="di-pause" data-id="' + id + '">' + (isPaused ? '继续' : '暂停') + '</button>';
                html += '    <button class="di-cancel" data-id="' + id + '">取消</button>';
            } else {
                html += '    <button class="di-install" data-id="' + id + '">安装</button>';
                html += '    <button class="di-cancel" data-id="' + id + '">删除</button>';
            }
            html += '  </div></div>';
        });
        container.innerHTML = html;

        container.querySelectorAll('.di-pause').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = this.dataset.id;
                window.DownloadManager.togglePause(id);
            });
        });
        container.querySelectorAll('.di-cancel').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = this.dataset.id;
                var task = window.DownloadManager.tasks[id];
                if (task && task.status === 'done') {
                    if (confirm('确定删除此下载记录吗？')) {
                        window.DownloadManager.cancel(id);
                    }
                } else {
                    if (confirm('确定取消下载吗？')) {
                        window.DownloadManager.cancel(id);
                    }
                }
            });
        });
        container.querySelectorAll('.di-install').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = this.dataset.id;
                window.DownloadManager.install(id);
            });
        });

        // 长按删除（触屏）
        var longPressTimer = null;
        container.querySelectorAll('.download-item').forEach(function(item) {
            item.addEventListener('touchstart', function(e) {
                var id = this.dataset.id;
                longPressTimer = setTimeout(function() {
                    if (confirm('确定删除此下载记录吗？')) {
                        window.DownloadManager.cancel(id);
                    }
                }, 600);
            });
            item.addEventListener('touchend', function() {
                clearTimeout(longPressTimer);
            });
            item.addEventListener('touchmove', function() {
                clearTimeout(longPressTimer);
            });
        });
    },
    _formatSize: function(bytes) {
        if (!bytes) return '0B';
        var units = ['B', 'KB', 'MB', 'GB'];
        var i = 0;
        while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
        return (i === 0 ? bytes : bytes.toFixed(1)) + units[i];
    }
};

// 暴露给 Java 调用（如有实现）
window._addDownloadTask = function(id, name, totalSize) {
    window.DownloadManager.addTask(id, name, totalSize);
};
window._updateDownloadProgress = function(id, downloaded, total, speed) {
    window.DownloadManager.updateProgress(id, downloaded, total, speed);
};
window._downloadComplete = function(id, filePath) {
    window.DownloadManager.complete(id, filePath);
};

// ============================================================
// 初始化
// ============================================================
function initApp() {
    setGreeting();

    document.getElementById('refreshBtn').addEventListener('click', function() {
        window.location.reload();
    });
    document.getElementById('translateBtn').addEventListener('click', function() {
        var currentUrl = window.location.href;
        if (currentUrl && currentUrl !== 'about:blank' && !currentUrl.startsWith('file://')) {
            window.open('https://translate.google.com/translate?sl=auto&tl=zh-CN&u=' + encodeURIComponent(currentUrl), '_blank');
        } else {
            window.showToast('无法翻译');
        }
    });

    var downloadSheet = document.getElementById('downloadSheet');
    if (downloadSheet) {
        var observer = new MutationObserver(function() {
            if (downloadSheet.classList.contains('show')) {
                window.DownloadManager.render();
     