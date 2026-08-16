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
// 引擎数据
// ============================================================
var DEFAULT_ENGINES = [
    { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' },
    { name: '百度', url: 'https://www.baidu.com/s?wd={q}' },
    { name: '谷歌', url: 'https://www.google.com/search?q={q}' }
];
var currentEngine = { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' };
var customEngines = [];
var windows = [];
var bgImageData = null;

// ============================================================
// 存储
// ============================================================
function loadData() {
    try {
        var eng = localStorage.getItem('mybrowser_current_engine');
        if (eng) currentEngine = JSON.parse(eng);
        var ws = localStorage.getItem('mybrowser_windows');
        if (ws) windows = JSON.parse(ws);
        var bg = localStorage.getItem('mybrowser_bg_image');
        if (bg) {
            bgImageData = bg;
            document.body.style.backgroundImage = 'url(' + bg + ')';
        }
    } catch(e) {}
}
function saveCurrentEngine() {
    localStorage.setItem('mybrowser_current_engine', JSON.stringify(currentEngine));
}
function saveWindows() {
    localStorage.setItem('mybrowser_windows', JSON.stringify(windows));
}
function saveBgImage(data) {
    bgImageData = data;
    localStorage.setItem('mybrowser_bg_image', data);
    document.body.style.backgroundImage = 'url(' + data + ')';
}
function resetBgImage() {
    bgImageData = null;
    localStorage.removeItem('mybrowser_bg_image');
    document.body.style.backgroundImage = '';
}

// ============================================================
// 引擎下拉菜单
// ============================================================
function renderEngineDropdown() {
    var container = document.getElementById('engineDropdown');
    var all = DEFAULT_ENGINES.concat(customEngines);
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
        if (DEFAULT_ENGINES.concat(customEngines).some(function(e) { return e.name === name; })) {
            window.showToast('引擎已存在');
            return;
        }
        customEngines.push({ name: name, url: url });
        localStorage.setItem('mybrowser_custom_engines', JSON.stringify(customEngines));
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
    ['menu', 'window', 'settings', 'download'].forEach(function(name) {
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

    trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            saveBgImage(ev.target.result);
            window.showToast('背景已更新');
            closePanel('settings');
        };
        reader.readAsDataURL(file);
        this.value = '';
    });

    reset.addEventListener('click', function() {
        resetBgImage();
        window.showToast('已恢复默认');
        closePanel('settings');
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
// 下载管理（占位）
// ============================================================
window.DownloadManager = {
    tasks: {},
    addTask: function(id, name, totalSize) {
        this.tasks[id] = { id: id, name: name, totalSize: totalSize || 0, downloadedSize: 0, speed: 0, status: 'downloading', progress: 0 };
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
    complete: function(id) {
        var task = this.tasks[id];
        if (!task) return;
        task.status = 'done';
        task.progress = 100;
        task.downloadedSize = task.totalSize;
        this.render();
    },
    togglePause: function(id) {
        var task = this.tasks[id];
        if (!task || task.status === 'done') return;
        task.status = (task.status === 'paused') ? 'downloading' : 'paused';
        if (window._nativeDownload) {
            window._nativeDownload.togglePause(id, task.status === 'downloading');
        }
        this.render();
    },
    cancel: function(id) {
        if (window._nativeDownload) {
            window._nativeDownload.cancel(id);
        }
        delete this.tasks[id];
        this.render();
    },
    install: function(id) {
        window.showToast('安装功能开发中');
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
            var statusText = { downloading: '下载中', paused: '已暂停', done: '已完成' }[task.status] || '';
            var progress = Math.round(task.progress);
            var sizeText = self._formatSize(task.downloadedSize) + ' / ' + self._formatSize(task.totalSize);
            var speedText = task.speed ? self._formatSize(task.speed) + '/s' : '0B/s';
            var isDone = task.status === 'done';
            html += '<div class="download-item" data-id="' + id + '">';
            html += '  <div class="di-header"><span class="di-name">' + task.name + '</span><span class="di-status">' + statusText + '</span></div>';
            html += '  <div class="di-progress-track"><div class="di-progress-fill" style="width:' + progress + '%;"></div></div>';
            html += '  <div class="di-info"><span>' + sizeText + '</span><span>' + speedText + '</span></div>';
            html += '  <div class="di-actions">';
            if (!isDone) {
                html += '    <button class="di-pause" data-id="' + id + '">' + (task.status === 'paused' ? '继续' : '暂停') + '</button>';
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
                if (confirm('确定取消/删除此下载吗？')) {
                    window.DownloadManager.cancel(id);
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
    },
    _formatSize: function(bytes) {
        if (!bytes) return '0B';
        var units = ['B', 'KB', 'MB', 'GB'];
        var i = 0;
        while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
        return (i === 0 ? bytes : bytes.toFixed(1)) + units[i];
    }
};

window._addDownloadTask = function(id, name, totalSize) {
    window.DownloadManager.addTask(id, name, totalSize);
};
window._updateDownloadProgress = function(id, downloaded, total, speed) {
    window.DownloadManager.updateProgress(id, downloaded, total, speed);
};
window._downloadComplete = function(id) {
    window.DownloadManager.complete(id);
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
            }
        });
        observer.observe(downloadSheet, { attributes: true, attributeFilter: ['class'] });
    }
}

function startApp() {
    loadData();
    updateEngineBtn();
    renderWindows();
    setupBackgroundPicker();
    initApp();

    document.getElementById('searchBtn').addEventListener('click', function() {
        doSearch(document.getElementById('searchInput').value);
    });
    document.getElementById('searchInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            doSearch(this.value);
        }
    });

    document.getElementById('engineBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        toggleEngineDropdown();
    });

    document.addEventListener('click', function(e) {
        var dd = document.getElementById('engineDropdown');
        var btn = document.getElementById('engineBtn');
        if (!dd.contains(e.target) && !btn.contains(e.target)) {
            closeEngineDropdown();
        }
    });

    document.getElementById('navMenu').addEventListener('click', function() {
        if (activePanel === 'menu') { closePanel('menu'); return; }
        openPanel('menu');
    });
    document.getElementById('navWindow').addEventListener('click', function() {
        if (activePanel === 'window') { closePanel('window'); return; }
        renderWindows();
        openPanel('window');
    });

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

    document.getElementById('addWindowBtn').addEventListener('click', function() {
        var id = 'win_' + Date.now();
        windows.unshift({ id: id, title: '新窗口', url: 'about:blank', time: Date.now() });
        saveWindows();
        renderWindows();
        window.showToast('已创建新窗口');
        window.location.href = 'about:blank';
    });

    setTimeout(function() {
        document.getElementById('searchInput').focus();
    }, 300);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}