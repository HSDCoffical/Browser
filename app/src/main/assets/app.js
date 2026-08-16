// ============================================================
// 统一入口 - 包含全部功能
// ============================================================
(function() {
    'use strict';

    // ---------- 1. Toast ----------
    window.showToast = function(msg) {
        var el = document.getElementById('toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(window.toastTimer);
        window.toastTimer = setTimeout(function() { el.classList.remove('show'); }, 1800);
    };

    // ---------- 2. 核心数据（直接读取 localStorage） ----------
    function loadEngine() {
        var saved = localStorage.getItem('mybrowser_current_engine');
        if (saved) {
            try { return JSON.parse(saved); } catch(e) {}
        }
        return { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' };
    }

    window.currentEngine = loadEngine();
    window.customEngines = JSON.parse(localStorage.getItem('mybrowser_custom_engines') || '[]');
    window.windows = JSON.parse(localStorage.getItem('mybrowser_windows') || '[]');
    window.bgImages = JSON.parse(localStorage.getItem('mybrowser_bg_images') || '[]');
    window.currentBgIndex = parseInt(localStorage.getItem('mybrowser_bg_index') || '0');
    window.carouselInterval = parseInt(localStorage.getItem('mybrowser_carousel_interval') || '3');
    window.isCarouselMode = localStorage.getItem('mybrowser_carousel_mode') === 'true';
    window.favorites = JSON.parse(localStorage.getItem('mybrowser_favorites') || '[]');
    window.history = JSON.parse(localStorage.getItem('mybrowser_history') || '[]');

    // ---------- 3. 保存所有数据 ----------
    function saveAll() {
        localStorage.setItem('mybrowser_current_engine', JSON.stringify(window.currentEngine));
        localStorage.setItem('mybrowser_custom_engines', JSON.stringify(window.customEngines));
        localStorage.setItem('mybrowser_windows', JSON.stringify(window.windows));
        localStorage.setItem('mybrowser_bg_images', JSON.stringify(window.bgImages));
        localStorage.setItem('mybrowser_bg_index', String(window.currentBgIndex));
        localStorage.setItem('mybrowser_carousel_interval', String(window.carouselInterval));
        localStorage.setItem('mybrowser_carousel_mode', String(window.isCarouselMode));
        localStorage.setItem('mybrowser_favorites', JSON.stringify(window.favorites));
        localStorage.setItem('mybrowser_history', JSON.stringify(window.history));
    }

    // 兼容旧调用
    window.saveCurrentEngine = saveAll;
    window.saveCustomEngines = saveAll;
    window.saveWindows = saveAll;
    window.saveBgImages = saveAll;
    window.saveBgIndex = saveAll;
    window.saveCarouselInterval = saveAll;
    window.saveCarouselMode = saveAll;
    window.saveFavorites = saveAll;
    window.saveHistory = saveAll;

    // ---------- 4. 问候语 ----------
    window.setGreeting = function() {
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
    };

    // ---------- 5. 引擎管理 ----------
    window.getAllEngines = function() {
        return [
            { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' },
            { name: '百度', url: 'https://www.baidu.com/s?wd={q}' },
            { name: '谷歌', url: 'https://www.google.com/search?q={q}' }
        ].concat(window.customEngines);
    };

    window.renderEngineDropdown = function() {
        var container = document.getElementById('engineDropdown');
        if (!container) return;
        var all = window.getAllEngines();
        var currentName = window.currentEngine.name;
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
                window.currentEngine = eng;
                saveAll();
                window.updateEngineBtn();
                window.renderEngineDropdown();
                window.closeEngineDropdown();
                window.showToast('已切换到：' + eng.name);
            });
        });

        var addBtn = document.getElementById('addCustomEngineBtn');
        if (addBtn) {
            addBtn.addEventListener('click', function(e) {
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
                if (window.getAllEngines().some(function(e) { return e.name === name; })) {
                    window.showToast('引擎已存在');
                    return;
                }
                window.customEngines.push({ name: name, url: url });
                saveAll();
                document.getElementById('customEngineName').value = '';
                document.getElementById('customEngineUrl').value = '';
                window.renderEngineDropdown();
                window.showToast('已添加');
            });
        }
    };

    window.toggleEngineDropdown = function() {
        var dd = document.getElementById('engineDropdown');
        if (!dd) return;
        if (dd.classList.contains('open')) {
            dd.classList.remove('open');
        } else {
            dd.classList.add('open');
            window.renderEngineDropdown();
        }
    };

    window.closeEngineDropdown = function() {
        var dd = document.getElementById('engineDropdown');
        if (dd) dd.classList.remove('open');
    };

    window.updateEngineBtn = function() {
        var btn = document.getElementById('engineBtn');
        if (btn) {
            btn.textContent = window.currentEngine.name + ' ›';
        }
    };

    // ---------- 6. 搜索 ----------
    window.doSearch = function(query) {
        if (!query || !query.trim()) return;
        var q = query.trim();
        var url = '';
        if (q.indexOf('http://') === 0 || q.indexOf('https://') === 0) {
            url = q;
        } else if (q.indexOf('.') !== -1 && q.indexOf(' ') === -1) {
            url = 'https://' + q;
        } else {
            url = window.currentEngine.url.replace(/\{q\}/g, encodeURIComponent(q));
        }
        if (typeof window.addHistory === 'function') window.addHistory(q, url);
        if (typeof window.addWindow === 'function') window.addWindow(q, url);
        window.location.href = url;
    };

    // ---------- 7. 窗口管理 ----------
    window.addWindow = function(title, url) {
        var id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        window.windows.unshift({ id: id, title: title || url, url: url || 'about:blank', time: Date.now() });
        if (window.windows.length > 50) window.windows = window.windows.slice(0, 50);
        saveAll();
        window.renderWindows();
    };

    window.deleteWindow = function(id) {
        window.windows = window.windows.filter(function(w) { return w.id !== id; });
        saveAll();
        window.renderWindows();
    };

    window.renderWindows = function() {
        var container = document.getElementById('windowList');
        if (!container) return;
        if (window.windows.length === 0) {
            container.innerHTML = '<div class="window-empty">暂无窗口</div>';
            return;
        }
        var html = '';
        window.windows.forEach(function(w) {
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
                var w = window.windows.find(function(win) { return win.id === id; });
                if (w && w.url) {
                    if (typeof window.addHistory === 'function') window.addHistory(w.title, w.url);
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
                window.deleteWindow(id);
                window.showToast('已删除窗口');
            });
        });
    };

    // ---------- 8. 面板控制 ----------
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

    // ---------- 9. 菜单功能 ----------
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
                if (typeof window.renderHistory === 'function') window.renderHistory('fav');
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

    // ---------- 10. 背景管理 ----------
    window.applyBgImage = function(index) {
        if (!window.bgImages || window.bgImages.length === 0) {
            document.body.style.backgroundImage = '';
            return;
        }
        var img = window.bgImages[index % window.bgImages.length];
        document.body.style.backgroundImage = 'url(' + img + ')';
        window.currentBgIndex = index;
        saveAll();
        if (typeof window.updateCarouselPreview === 'function') window.updateCarouselPreview();
    };

    window.startCarousel = function() {
        window.stopCarousel();
        if (!window.isCarouselMode || !window.bgImages || window.bgImages.length < 2) return;
        var interval = parseInt(document.getElementById('carouselInterval').value) || 3;
        window.carouselInterval = interval;
        saveAll();
        window.carouselTimer = setInterval(function() {
            var next = (window.currentBgIndex + 1) % window.bgImages.length;
            window.applyBgImage(next);
        }, window.carouselInterval * 1000);
    };

    window.stopCarousel = function() {
        if (window.carouselTimer) {
            clearInterval(window.carouselTimer);
            window.carouselTimer = null;
        }
    };

    window.updateCarouselPreview = function() {
        var container = document.getElementById('carouselPreview');
        if (!container) return;
        var html = '';
        window.bgImages.forEach(function(img, i) {
            var active = (i === window.currentBgIndex) ? 'active' : '';
            html += '<div class="cs-thumb-wrap">' +
                    '<img src="' + img + '" class="cs-thumb ' + active + '" data-index="' + i + '">' +
                    '<button class="cs-del" data-index="' + i + '">✕</button>' +
                    '</div>';
        });
        container.innerHTML = html;

        container.querySelectorAll('.cs-thumb').forEach(function(el) {
            el.addEventListener('click', function() {
                var idx = parseInt(this.dataset.index);
                window.applyBgImage(idx);
                if (window.isCarouselMode && window.bgImages.length > 1) window.startCarousel();
            });
        });
        container.querySelectorAll('.cs-del').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                var idx = parseInt(this.dataset.index);
                window.bgImages.splice(idx, 1);
                saveAll();
                if (window.bgImages.length === 0) {
                    document.body.style.backgroundImage = '';
                    window.stopCarousel();
                } else {
                    if (window.currentBgIndex >= window.bgImages.length) window.currentBgIndex = 0;
                    window.applyBgImage(window.currentBgIndex);
                    if (window.isCarouselMode && window.bgImages.length > 1) window.startCarousel();
                }
                window.updateCarouselPreview();
                window.showToast('已删除');
            });
        });
    };

    window.setupBackgroundPicker = function() {
        var fileInput = document.getElementById('bgFileInput');
        var trigger = document.getElementById('bgPickerTrigger');
        var reset = document.getElementById('resetBg');
        var toggle = document.getElementById('carouselToggle');

        if (toggle) {
            toggle.addEventListener('click', function() {
                window.isCarouselMode = !window.isCarouselMode;
                this.classList.toggle('active');
                saveAll();
                var settings = document.getElementById('carouselSettings');
                var label = document.getElementById('pickerLabel');
                if (window.isCarouselMode) {
                    settings.style.display = 'block';
                    if (label) label.textContent = '选择背景图片（多选）';
                    if (fileInput) {
                        fileInput.setAttribute('multiple', 'multiple');
                        fileInput.value = '';
                    }
                    if (window.bgImages.length > 1) window.startCarousel();
                } else {
                    settings.style.display = 'none';
                    if (label) label.textContent = '选择背景图片';
                    if (fileInput) {
                        fileInput.removeAttribute('multiple');
                        fileInput.value = '';
                    }
                    window.stopCarousel();
                    if (window.bgImages.length > 1) {
                        var first = window.bgImages[0];
                        window.bgImages = [first];
                        saveAll();
                        window.currentBgIndex = 0;
                        window.applyBgImage(0);
                        window.updateCarouselPreview();
                        window.showToast('已切换为单图模式');
                    }
                }
            });
        }

        if (trigger) {
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                if (fileInput) fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                var files = e.target.files;
                if (!files || files.length === 0) return;

                if (window.isCarouselMode) {
                    var total = window.bgImages.length + files.length;
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
                                window.bgImages.push(ev.target.result);
                                loaded++;
                                if (loaded === files.length) {
                                    saveAll();
                                    if (window.bgImages.length === 1) {
                                        window.applyBgImage(0);
                                    } else {
                                        window.startCarousel();
                                    }
                                    window.updateCarouselPreview();
                                    window.showToast('已添加 ' + files.length + ' 张图片');
                                    window.closePanel('settings');
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
                        window.bgImages = [dataUrl];
                        saveAll();
                        window.currentBgIndex = 0;
                        window.applyBgImage(0);
                        window.updateCarouselPreview();
                        window.showToast('背景已更新');
                        window.closePanel('settings');
                    };
                    reader.readAsDataURL(file);
                }
                this.value = '';
            });
        }

        if (reset) {
            reset.addEventListener('click', function() {
                window.bgImages = [];
                saveAll();
                window.stopCarousel();
                document.body.style.backgroundImage = '';
                window.updateCarouselPreview();
                window.showToast('已恢复默认背景');
                window.closePanel('settings');
            });
        }

        var intervalInput = document.getElementById('carouselInterval');
        if (intervalInput) {
            intervalInput.addEventListener('change', function() {
                var val = parseInt(this.value) || 3;
                window.carouselInterval = val;
                saveAll();
                if (window.isCarouselMode && window.bgImages.length > 1) {
                    window.startCarousel();
                }
            });
        }
    };

    // ---------- 11. 顶部栏 ----------
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

    // ---------- 12. 收藏/历史 ----------
    window.addHistory = function(title, url) {
        window.history = window.history.filter(function(item) { return item.url !== url; });
        window.history.unshift({ title: title || url, url: url, time: Date.now() });
        if (window.history.length > 100) window.history = window.history.slice(0, 100);
        saveAll();
    };

    window.addFavorite = function(title, url) {
        if (window.favorites.some(function(item) { return item.url === url; })) {
            window.showToast('已收藏');
            return;
        }
        window.favorites.unshift({ title: title || url, url: url, time: Date.now() });
        saveAll();
        window.showToast('已收藏');
    };

    window.renderHistory = function(mode) {
        var list = document.getElementById('historyList');
        if (!list) return;
        var data = mode === 'fav' ? window.favorites : window.history;
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
                    window.favorites.splice(idx, 1);
                    saveAll();
                } else {
                    window.history.splice(idx, 1);
                    saveAll();
                }
                window.renderHistory(mode);
                window.showToast('已删除');
            });
        });
    };

    // ---------- 13. 下载管理（模拟） ----------
    window.DownloadManager = {
        tasks: {},
        addTask: function(id, name, totalSize) {
            this.tasks[id] = {
                id: id,
                name: name,
                totalSize: totalSize || 0,
                downloadedSize: 0,
                speed: 0,
                status: 'downloading',
                progress: 0,
                filePath: null
            };
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