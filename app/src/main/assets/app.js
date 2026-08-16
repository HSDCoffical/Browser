// ============================================================
// 全局工具
// ============================================================
window.showToast = function(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(function() { el.classList.remove('show'); }, 1800);
};

// ============================================================
// 模块1：问候语
// ============================================================
(function() {
    try {
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
        window.setGreeting = setGreeting;
    } catch(e) { console.warn('问候语模块初始化失败', e); }
})();

// ============================================================
// 模块2：数据与存储（核心）
// ============================================================
(function() {
    try {
        // 默认引擎
        window.DEFAULT_ENGINES = [
            { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' },
            { name: '百度', url: 'https://www.baidu.com/s?wd={q}' },
            { name: '谷歌', url: 'https://www.google.com/search?q={q}' }
        ];
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

        // 加载数据
        window.loadData = function() {
            try {
                var ce = localStorage.getItem('mybrowser_custom_engines');
                if (ce) window.customEngines = JSON.parse(ce);
                var eng = localStorage.getItem('mybrowser_current_engine');
                if (eng) window.currentEngine = JSON.parse(eng);
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
                    window.applyBgImage(window.currentBgIndex);
                }
            } catch(e) { console.warn('loadData 出错', e); }
        };
    } catch(e) { console.warn('数据模块初始化失败', e); }
})();

// ============================================================
// 模块3：背景管理
// ============================================================
(function() {
    try {
        window.applyBgImage = function(index) {
            if (!window.bgImages || window.bgImages.length === 0) {
                document.body.style.backgroundImage = '';
                return;
            }
            var img = window.bgImages[index % window.bgImages.length];
            document.body.style.backgroundImage = 'url(' + img + ')';
            window.currentBgIndex = index;
            window.saveBgIndex();
            window.updateCarouselPreview();
        };

        window.startCarousel = function() {
            window.stopCarousel();
            if (!window.isCarouselMode || !window.bgImages || window.bgImages.length < 2) return;
            var interval = parseInt(document.getElementById('carouselInterval').value) || 3;
            window.carouselInterval = interval;
            window.saveCarouselInterval();
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
                    window.saveBgImages();
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
    } catch(e) { console.warn('背景模块初始化失败', e); }
})();

// ============================================================
// 模块4：引擎管理
// ============================================================
(function() {
    try {
        window.getAllEngines = function() {
            return window.DEFAULT_ENGINES.concat(window.customEngines);
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
                    window.saveCurrentEngine();
                    window.updateEngineBtn();
                    window.closeEngineDropdown();
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
                if (window.getAllEngines().some(function(e) { return e.name === name; })) {
                    window.showToast('引擎已存在');
                    return;
                }
                window.customEngines.push({ name: name, url: url });
                window.saveCustomEngines();
                document.getElementById('customEngineName').value = '';
                document.getElementById('customEngineUrl').value = '';
                window.renderEngineDropdown();
                window.showToast('已添加');
            });
        };

        window.toggleEngineDropdown = function() {
            var dd = document.getElementById('engineDropdown');
            dd.classList.toggle('open');
            if (dd.classList.contains('open')) {
                window.renderEngineDropdown();
            }
        };

        window.closeEngineDropdown = function() {
            document.getElementById('engineDropdown').classList.remove('open');
        };

        window.updateEngineBtn = function() {
            document.getElementById('engineBtn').textContent = window.currentEngine.name + ' ›';
        };
    } catch(e) { console.warn('引擎模块初始化失败', e); }
})();

// ============================================================
// 模块5：搜索
// ============================================================
(function() {
    try {
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
            window.addHistory(q, url);
            window.addWindow(q, url);
            window.location.href = url;
        };
    } catch(e) { console.warn('搜索模块初始化失败', e); }
})();

// ============================================================
// 模块6：窗口管理
// ============================================================
(function() {
    try {
        window.addWindow = function(title, url) {
            var id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
            window.windows.unshift({ id: id, title: title || url, url: url || 'about:blank', time: Date.now() });
            if (window.windows.length > 50) window.windows = window.windows.slice(0, 50);
            window.saveWindows();
            window.renderWindows();
        };

        window.deleteWindow = function(id) {
            window.windows = window.windows.filter(function(w) { return w.id !== id; });
            window.saveWindows();
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
                        window.addHistory(w.title, w.url);
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
    } catch(e) { console.warn('窗口模块初始化失败', e); }
})();

// ============================================================
// 模块7：面板控制
// ============================================================
(function() {
    try {
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
    } catch(e) { console.warn('面板模块初始化失败', e); }
})();

// ============================================================
// 模块8：菜单功能
// ============================================================
(function() {
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
                    if (window.DownloadManager) window.DownloadManager.render();
                    break;
                case 'history':
                    window.closePanel('menu');
                    window.renderHistory('fav');
                    window.openPanel('history');
                    break;
                case 'tools':
                    window.closePanel('menu');
                    window.openPanel('tools');
                    break;
                case 'fav':
                    if (window.location.href && window.location.href !== 'about:blank') {
                        window.addFavorite(document.title || window.location.href, window.location.href);
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
    } catch(e) { console.warn('菜单模块初始化失败', e); }
})();

// ============================================================
// 模块9：背景设置（文件选择、模式切换）
// ============================================================
(function() {
    try {
        window.setupBackgroundPicker = function() {
            var fileInput = document.getElementById('bgFileInput');
            var trigger = document.getElementById('bgPickerTrigger');
            var reset = document.getElementById('resetBg');
            var toggle = document.getElementById('carouselToggle');

            if (toggle) {
                toggle.addEventListener('click', function() {
                    window.isCarouselMode = !window.isCarouselMode;
                    this.classList.toggle('active');
                    window.saveCarouselMode();
                    var settings = document.getElementById('carouselSettings');
                    if (window.isCarouselMode) {
                        settings.style.display = 'block';
                        document.getElementById('pickerLabel').textContent = '选择背景图片（多选）';
                        fileInput.setAttribute('multiple', 'multiple');
                        if (window.bgImages.length > 1) window.startCarousel();
                    } else {
                        settings.style.display = 'none';
                        document.getElementById('pickerLabel').textContent = '选择背景图片';
                        fileInput.removeAttribute('multiple');
                        window.stopCarousel();
                        if (window.bgImages.length > 1) {
                            var first = window.bgImages[0];
                            window.bgImages = [first];
                            window.saveBgImages();
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
                    fileInput.click();
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
                                        window.saveBgImages();
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
                            window.saveBgImages();
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
                    window.saveBgImages();
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
                    window.saveCarouselInterval();
                    if (window.isCarouselMode && window.bgImages.length > 1) {
                        window.startCarousel();
                    }
                });
            }
        };
    } catch(e) { console.warn('背景设置模块初始化失败', e); }
})();

// ============================================================
// 模块10：顶部栏
// ============================================================
(function() {
    try {
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
    } catch(e) { console.warn('顶部栏模块初始化失败', e); }
})();

// ============================================================
// 模块11：历史/收藏
// ============================================================
(function() {
    try {
        window.addHistory = function(title, url) {
            window.history = window.history.filter(function(item) { return item.url !== url; });
            window.history.unshift({ title: title || url, url: url, time: Date.now() });
            if (window.history.length > 100) window.history = window.history.slice(0, 100);
            window.saveHistory();
        };

        window.addFavorite = function(title, url) {
            if (window.favorites.some(function(item) { return item.url === url; })) {
                window.showToast('已收藏');
                return;
            }
            window.favorites.unshift({ title: title || url, url: url, time: Date.now() });
            window.saveFavorites();
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
                        window.saveFavorites();
                    } else {
                        window.history.splice(idx, 1);
                        window.saveHistory();
                    }
                    window.renderHistory(mode);
                    window.showToast('已删除');
                });
            });
        };
    } catch(e) { console.warn('历史/收藏模块初始化失败', e); }
})();

// ===============================================