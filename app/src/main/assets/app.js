// ============================================================
// 主容器 - 所有模块在此运行，互不干扰
// ============================================================
(function() {
    'use strict';

    // ---------- 全局错误捕获 ----------
    window.onerror = function(msg, url, line, col, error) {
        console.error('全局捕获:', msg, url, line, col, error);
        return true;
    };

    // ---------- 工具函数 ----------
    function safeGetElement(id) {
        try {
            var el = document.getElementById(id);
            return el || null;
        } catch(e) {
            return null;
        }
    }

    function safeToast(msg) {
        try {
            var el = safeGetElement('toast');
            if (!el) return;
            el.textContent = msg;
            el.classList.add('show');
            clearTimeout(window.toastTimer);
            window.toastTimer = setTimeout(function() {
                el.classList.remove('show');
            }, 1800);
        } catch(e) {
            console.error('Toast错误:', e);
        }
    }
    window.showToast = safeToast;

    // ---------- 模块1: 问候语 ----------
    (function() {
        try {
            var el = safeGetElement('greeting');
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
        } catch(e) {
            console.error('问候语模块错误:', e);
        }
    })();

    // ---------- 模块2: 数据与存储 ----------
    (function() {
        try {
            window.DEFAULT_ENGINES = [
                { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' },
                { name: '百度', url: 'https://www.baidu.com/s?wd={q}' },
                { name: '谷歌', url: 'https://www.google.com/search?q={q}' }
            ];
            window.currentEngine = { name: '必应', url: 'https://cn.bing.com/search?q={q}&from=vivosearch2025' };
            window.customEngines = [];
            window.windows = [];
            window.isIncognito = false;
            window.bgImages = [];
            window.currentBgIndex = 0;
            window.carouselTimer = null;
            window.carouselInterval = 3;
            window.isCarouselMode = false;
        } catch(e) {
            console.error('数据模块错误:', e);
        }
    })();

    // ---------- 模块3: 存储操作 ----------
    (function() {
        try {
            window.loadData = function() {
                try {
                    var ce = localStorage.getItem('mybrowser_custom_engines');
                    if (ce) window.customEngines = JSON.parse(ce);
                    var eng = localStorage.getItem('mybrowser_current_engine');
                    if (eng) window.currentEngine = JSON.parse(eng);
                    var ws = localStorage.getItem('mybrowser_windows');
                    if (ws) window.windows = JSON.parse(ws);
                    var incog = localStorage.getItem('mybrowser_incognito');
                    if (incog) window.isIncognito = JSON.parse(incog);
                    var bg = localStorage.getItem('mybrowser_bg_images');
                    if (bg) window.bgImages = JSON.parse(bg);
                    var idx = localStorage.getItem('mybrowser_bg_index');
                    if (idx) window.currentBgIndex = parseInt(idx) || 0;
                    var interval = localStorage.getItem('mybrowser_carousel_interval');
                    if (interval) window.carouselInterval = parseInt(interval) || 3;
                    var mode = localStorage.getItem('mybrowser_carousel_mode');
                    window.isCarouselMode = (mode === 'true');

                    if (window.bgImages && window.bgImages.length > 0) {
                        if (typeof window.applyBgImage === 'function') {
                            window.applyBgImage(window.currentBgIndex);
                        }
                    }
                    var toggle = safeGetElement('carouselToggle');
                    if (toggle) {
                        if (window.isCarouselMode) toggle.classList.add('active');
                        else toggle.classList.remove('active');
                    }
                    var settings = safeGetElement('carouselSettings');
                    if (settings) {
                        settings.style.display = window.isCarouselMode ? 'block' : 'none';
                    }
                    var label = safeGetElement('pickerLabel');
                    if (label) {
                        label.textContent = window.isCarouselMode ? '选择背景图片（多选）' : '选择背景图片';
                    }
                    var el = safeGetElement('carouselInterval');
                    if (el) el.value = window.carouselInterval;
                    
                    var nightMode = localStorage.getItem('mybrowser_night_mode');
                    if (nightMode === 'true') {
                        document.body.classList.add('night-mode');
                        var nightToggle = safeGetElement('nightModeToggleMenu');
                        if (nightToggle) nightToggle.classList.add('active');
                    }
                } catch(e) {
                    console.error('loadData 错误:', e);
                }
            };

            window.saveBgImages = function() {
                try { localStorage.setItem('mybrowser_bg_images', JSON.stringify(window.bgImages)); } catch(e) {}
            };
            window.saveBgIndex = function() {
                try { localStorage.setItem('mybrowser_bg_index', String(window.currentBgIndex)); } catch(e) {}
            };
            window.saveCarouselInterval = function() {
                try { localStorage.setItem('mybrowser_carousel_interval', String(window.carouselInterval)); } catch(e) {}
            };
            window.saveCarouselMode = function() {
                try { localStorage.setItem('mybrowser_carousel_mode', String(window.isCarouselMode)); } catch(e) {}
            };
            window.saveCustomEngines = function() {
                try { localStorage.setItem('mybrowser_custom_engines', JSON.stringify(window.customEngines)); } catch(e) {}
            };
            window.saveCurrentEngine = function() {
                try { localStorage.setItem('mybrowser_current_engine', JSON.stringify(window.currentEngine)); } catch(e) {}
            };
            window.saveWindows = function() {
                try { localStorage.setItem('mybrowser_windows', JSON.stringify(window.windows)); } catch(e) {}
            };
            window.saveIncognito = function() {
                try { localStorage.setItem('mybrowser_incognito', JSON.stringify(window.isIncognito)); } catch(e) {}
            };
            window.saveNightMode = function() {
                try { localStorage.setItem('mybrowser_night_mode', String(document.body.classList.contains('night-mode'))); } catch(e) {}
            };
        } catch(e) {
            console.error('存储模块错误:', e);
        }
    })();

    // ---------- 模块4: 背景管理 ----------
    (function() {
        try {
            window.applyBgImage = function(index) {
                try {
                    if (!window.bgImages || window.bgImages.length === 0) {
                        document.body.style.backgroundImage = '';
                        return;
                    }
                    var img = window.bgImages[index % window.bgImages.length];
                    document.body.style.backgroundImage = 'url(' + img + ')';
                    window.currentBgIndex = index;
                    window.saveBgIndex();
                    if (typeof window.updateCarouselPreview === 'function') {
                        window.updateCarouselPreview();
                    }
                } catch(e) {
                    console.error('applyBgImage 错误:', e);
                }
            };

            window.startCarousel = function() {
                try {
                    window.stopCarousel();
                    if (!window.isCarouselMode || !window.bgImages || window.bgImages.length < 2) return;
                    var interval = parseInt(safeGetElement('carouselInterval').value) || 3;
                    window.carouselInterval = interval;
                    window.saveCarouselInterval();
                    window.carouselTimer = setInterval(function() {
                        var next = (window.currentBgIndex + 1) % window.bgImages.length;
                        window.applyBgImage(next);
                    }, window.carouselInterval * 1000);
                } catch(e) {
                    console.error('startCarousel 错误:', e);
                }
            };

            window.stopCarousel = function() {
                try {
                    if (window.carouselTimer) {
                        clearInterval(window.carouselTimer);
                        window.carouselTimer = null;
                    }
                } catch(e) {
                    console.error('stopCarousel 错误:', e);
                }
            };

            window.updateCarouselPreview = function() {
                try {
                    var container = safeGetElement('carouselPreview');
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
                } catch(e) {
                    console.error('updateCarouselPreview 错误:', e);
                }
            };
        } catch(e) {
            console.error('背景模块错误:', e);
        }
    })();

    // ---------- 模块5: 引擎管理 ----------
    (function() {
        try {
            window.getAllEngines = function() {
                return window.DEFAULT_ENGINES.concat(window.customEngines);
            };

            window.renderEngineDropdown = function() {
                try {
                    var container = safeGetElement('engineDropdown');
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

                    var addBtn = safeGetElement('addCustomEngineBtn');
                    if (addBtn) {
                        addBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            var name = safeGetElement('customEngineName').value.trim();
                            var url = safeGetElement('customEngineUrl').value.trim();
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
                    }
                } catch(e) {
                    console.error('renderEngineDropdown 错误:', e);
                }
            };

            window.toggleEngineDropdown = function() {
                try {
                    var dd = safeGetElement('engineDropdown');
                    if (!dd) return;
                    dd.classList.toggle('open');
                    if (dd.classList.contains('open')) {
                        window.renderEngineDropdown();
                    }
                } catch(e) {
                    console.error('toggleEngineDropdown 错误:', e);
                }
            };

            window.closeEngineDropdown = function() {
                try {
                    var dd = safeGetElement('engineDropdown');
                    if (dd) dd.classList.remove('open');
                } catch(e) {
                    console.error('closeEngineDropdown 错误:', e);
                }
            };

            window.updateEngineBtn = function() {
                try {
                    var btn = safeGetElement('engineBtn');
                    if (btn) {
                        btn.textContent = window.currentEngine.name;
                    }
                } catch(e) {
                    console.error('updateEngineBtn 错误:', e);
                }
            };
        } catch(e) {
            console.error('引擎模块错误:', e);
        }
    })();

    // ---------- 模块6: 搜索 ----------
    (function() {
        try {
            window.doSearch = function(query) {
                try {
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
                    if (typeof window.addWindow === 'function') {
                        window.addWindow(q, url);
                    }
                    window.location.href = url;
                } catch(e) {
                    console.error('doSearch 错误:', e);
                    window.showToast('搜索失败，请重试');
                }
            };
        } catch(e) {
            console.error('搜索模块错误:', e);
        }
    })();

    // ---------- 模块7: 窗口管理 ----------
    (function() {
        try {
            window.addWindow = function(title, url) {
                try {
                    var id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
                    window.windows.unshift({ id: id, title: title || url, url: url || 'about:blank', time: Date.now() });
                    if (window.windows.length > 50) window.windows = window.windows.slice(0, 50);
                    window.saveWindows();
                    if (typeof window.renderWindows === 'function') {
                        window.renderWindows();
                    }
                } catch(e) {
                    console.error('addWindow 错误:', e);
                }
            };

            window.deleteWindow = function(id) {
                try {
                    window.windows = window.windows.filter(function(w) { return w.id !== id; });
                    window.saveWindows();
                    if (typeof window.renderWindows === 'function') {
                        window.renderWindows();
                    }
                } catch(e) {
                    console.error('deleteWindow 错误:', e);
                }
            };

            window.renderWindows = function() {
                try {
                    var container = safeGetElement('windowList');
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
                } catch(e) {
                    console.error('renderWindows 错误:', e);
                }
            };
        } catch(e) {
            console.error('窗口模块错误:', e);
        }
    })();

    // ---------- 模块8: 面板控制 ----------
    (function() {
        try {
            window.activePanel = null;

            window.openPanel = function(name) {
                try {
                    window.closeAllPanels();
                    window.activePanel = name;
                    var overlay = safeGetElement(name + 'Overlay');
                    var sheet = safeGetElement(name + 'Sheet');
                    if (overlay) overlay.classList.add('show');
                    if (sheet) sheet.classList.add('show');
                } catch(e) {
                    console.error('openPanel 错误:', e);
                }
            };

            window.closePanel = function(name) {
                try {
                    var overlay = safeGetElement(name + 'Overlay');
                    var sheet = safeGetElement(name + 'Sheet');
                    if (overlay) overlay.classList.remove('show');
                    if (sheet) sheet.classList.remove('show');
                    if (window.activePanel === name) window.activePanel = null;
                } catch(e) {
                    console.error('closePanel 错误:', e);
                }
            };

            window.closeAllPanels = function() {
                try {
                    ['menu', 'window', 'settings', 'download'].forEach(function(name) {
                        var overlay = safeGetElement(name + 'Overlay');
                        var sheet = safeGetElement(name + 'Sheet');
                        if (overlay) overlay.classList.remove('show');
                        if (sheet) sheet.classList.remove('show');
                    });
                    window.activePanel = null;
                } catch(e) {
                    console.error('closeAllPanels 错误:', e);
                }
            };
        } catch(e) {
            console.error('面板模块错误:', e);
        }
    })();

    // ---------- 模块9: 菜单功能 ----------
    (function() {
        try {
            window.handleMenuAction = function(action) {
                try {
                    switch (action) {
                        case 'settings':
                            window.closePanel('menu');
                            window.openPanel('settings');
                            break;
                        case 'download':
                            window.closePanel('menu');
                            window.openPanel('download');
                            if (typeof window.renderDownloadList === 'function') {
                                window.renderDownloadList();
                            }
                            break;
                        case 'history':
                            window.closePanel('menu');
                            if (typeof window.openHistoryPanel === 'function') {
                                window.openHistoryPanel();
                            } else {
                                window.showToast('历史功能加载中...');
                            }
                            break;
                        case 'tools':
                            window.closePanel('menu');
                            if (typeof window.loadToolsModule === 'function') {
                                window.loadToolsModule();
                            } else {
                                window.showToast('工具箱功能加载中...');
                            }
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
                            window.closePanel('menu');
                            break;
                        case 'exit':
                            if (confirm('确定退出应用吗？')) {
                                window.showToast('正在退出...');
                                setTimeout(function() {
                                    window.location.href = 'about:blank';
                                }, 500);
                            }
                            window.closePanel('menu');
                            break;
                        default:
                            window.showToast('功能开发中');
                            window.closePanel('menu');
                    }
                } catch(e) {
                    console.error('handleMenuAction 错误:', e);
                }
            };
        } catch(e) {
            console.error('菜单模块错误:', e);
        }
    })();

    // ---------- 模块10: 工具箱加载 ----------
    (function() {
        try {
            var toolsLoaded = false;
            window.loadToolsModule = function() {
                try {
                    if (toolsLoaded) {
                        if (typeof window.openToolsPanel === 'function') {
                            window.openToolsPanel();
                        } else {
                            window.showToast('工具箱已加载，但初始化失败');
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
                        window.showToast('工具箱加载失败，请检查 tools.js');
                    };
                    document.head.appendChild(script);
                } catch(e) {
                    console.error('loadToolsModule 错误:', e);
                    window.showToast('加载工具箱失败');
                }
            };
        } catch(e) {
            console.error('工具箱模块错误:', e);
        }
    })();

    // ---------- 模块11: 夜间模式 ----------
    (function() {
        try {
            window.toggleNightMode = function() {
                try {
                    document.body.classList.toggle('night-mode');
                    var toggle = safeGetElement('nightModeToggleMenu');
                    if (toggle) {
                        toggle.classList.toggle('active');
                    }
                    window.saveNightMode();
                    window.showToast(document.body.classList.contains('night-mode') ? '夜间模式已开启' : '夜间模式已关闭');
                } catch(e) {
                    console.error('toggleNightMode 错误:', e);
                }
            };
        } catch(e) {
            console.error('夜间模块错误:', e);
        }
    })();

    // ---------- 模块12: 背景设置 ----------
    (function() {
        try {
            window.setupBackgroundPicker = function() {
                try {
                    var fileInput = safeGetElement('bgFileInput');
                    var trigger = safeGetElement('bgPickerTrigger');
                    var reset = safeGetElement('resetBg');
                    var toggle = safeGetElement('carouselToggle');

                    if (!toggle) return;
                    toggle.addEventListener('click', function() {
                        window.isCarouselMode = !window.isCarouselMode;
                        this.classList.toggle('active');
                        window.saveCarouselMode();
                        var settings = safeGetElement('carouselSettings');
                        var label = safeGetElement('pickerLabel');
                        if (window.isCarouselMode) {
                            if (settings) settings.style.display = 'block';
                            if (label) label.textContent = '选择背景图片（多选）';
                            if (fileInput) {
                                fileInput.setAttribute('multiple', 'multiple');
                                fileInput.value = '';
                            }
                            if (window.bgImages.length > 1) window.startCarousel();