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
        // 恢复开关状态
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
        btn.textContent = currentEngine.name;  // 不显示箭头
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
            if (typeof window.renderDownloadList === 'function') {
                window.renderDownloadList();
            }
            break;
        case 'history':
            window.showToast('收藏/历史功能开发中');
            closePanel('menu');
            break;
        case 'tools':
            closePanel('menu');
            openToolsPanel();  // 打开工具箱浮层
            break;
        case 'fav':
            if (window.location.href && window.location.href !== 'about:blank') {
                window.showToast('已收藏当前页面（演示）');
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
// 工具箱（独立浮层，不依赖外部文件）
// ============================================================
var toolsPanelActive = false;

function openToolsPanel() {
    if (toolsPanelActive) {
        // 如果已打开，聚焦到已有浮层
        var exist = document.getElementById('toolsPanelOverlay');
        if (exist) {
            exist.style.display = 'flex';
            return;
        }
    }

    // 创建浮层
    var overlay = document.createElement('div');
    overlay.id = 'toolsPanelOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';

    var sheet = document.createElement('div');
    sheet.style.cssText = 'background:#fff;border-radius:16px;max-width:92%;max-height:90%;width:480px;overflow-y:auto;padding:20px;box-shadow:0 8px 40px rgba(0,0,0,0.3);position:relative;';
    sheet.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="margin:0;">🧰 工具箱</h3>
            <button id="closeToolsPanel" style="background:none;border:none;font-size:24px;cursor:pointer;">✕</button>
        </div>
        <div id="toolsList" style="display:flex;flex-direction:column;gap:10px;"></div>
    `;
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    toolsPanelActive = true;

    // 关闭事件
    overlay.querySelector('#closeToolsPanel').addEventListener('click', function() {
        overlay.remove();
        toolsPanelActive = false;
    });
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
            toolsPanelActive = false;
        }
    });

    // 渲染工具列表
    renderToolsList();
}

function renderToolsList() {
    var container = document.getElementById('toolsList');
    if (!container) return;
    var tools = [
        { id: 'http', label: '🌐 HTTP 请求测试', desc: 'GET/POST/PUT/DELETE，自定义请求头' },
        { id: 'whois', label: '📋 WHOIS 查询', desc: '查询域名 WHOIS 信息' },
        { id: 'ping', label: '📡 Ping 检测', desc: 'HTTP 延迟测速' },
        { id: 'dns', label: '🔍 DNS 查询', desc: 'A/AAAA/CNAME/MX/TXT/NS 记录' },
        { id: 'ip', label: '🌍 IP 信息查询', desc: '地理位置和 ISP' },
        { id: 'b64', label: '🔐 Base64 编解码', desc: '文本与 Base64 互转' },
        { id: 'url', label: '🔗 URL 编解码', desc: 'URL 编码与解码' }
    ];

    container.innerHTML = '';
    tools.forEach(function(tool) {
        var div = document.createElement('div');
        div.style.cssText = 'background:#f5f7fa;border-radius:10px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;border:1px solid rgba(0,0,0,0.04);transition:background 0.15s;';
        div.innerHTML = '<div><div style="font-weight:500;font-size:15px;">' + tool.label + '</div><div style="font-size:13px;color:#888;">' + tool.desc + '</div></div><span style="color:#ccc;font-size:20px;">›</span>';
        container.appendChild(div);
        div.addEventListener('click', function() {
            // 关闭工具箱浮层
            var overlay = document.getElementById('toolsPanelOverlay');
            if (overlay) overlay.remove();
            toolsPanelActive = false;
            // 打开具体工具
            openTool(tool.id);
        });
    });
}

// ============================================================
// 具体工具实现（独立浮层）
// ============================================================
function createToolOverlay(title, contentHTML) {
    var overlay = document.createElement('div');
    overlay.className = 'tool-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';

    var sheet = document.createElement('div');
    sheet.style.cssText = 'background:#fff;border-radius:16px;max-width:92%;max-height:90%;width:540px;overflow-y:auto;padding:20px;box-shadow:0 8px 40px rgba(0,0,0,0.3);position:relative;';
    sheet.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="margin:0;">${title}</h3>
            <button class="close-tool" style="background:none;border:none;font-size:24px;cursor:pointer;">✕</button>
        </div>
        ${contentHTML}
    `;
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);

    overlay.querySelector('.close-tool').addEventListener('click', function() {
        overlay.remove();
    });
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
    });
    return overlay;
}

function openTool(id) {
    switch (id) {
        case 'http': openHttpTool(); break;
        case 'whois': openWhoisTool(); break;
        case 'ping': openPingTool(); break;
        case 'dns': openDnsTool(); break;
        case 'ip': openIpTool(); break;
        case 'b64': openBase64Tool(); break;
        case 'url': openUrlTool(); break;
        default: window.showToast('工具未实现');
    }
}

// ---------- HTTP ----------
function openHttpTool() {
    var html = `
        <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">
            <select id="nt-method" style="flex:1;padding:8px;border-radius:6px;border:1px solid #ddd;background:#f9f9f9;font-size:14px;">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
                <option value="HEAD">HEAD</option>
                <option value="OPTIONS">OPTIONS</option>
            </select>
            <input id="nt-url" type="text" placeholder="请求URL" style="flex:3;padding:8px;border-radius:6px;border:1px solid #ddd;font-size:14px;">
            <button id="nt-send" style="padding:8px 20px;background:#2979ff;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">发送</button>
        </div>
        <div style="margin-bottom:8px;">
            <div style="display:flex;gap:4px;margin-bottom:4px;">
                <span style="font-weight:500;font-size:14px;">请求头</span>
                <button id="nt-add-header" style="background:none;border:1px solid #ddd;border-radius:4px;padding:2px 8px;font-size:12px;cursor:pointer;">+</button>
            </div>
            <div id="nt-headers-container" style="display:flex;flex-direction:column;gap:4px;max-height:120px;overflow-y:auto;padding:4px 0;">
                <div style="display:flex;gap:4px;">
                    <input class="nt-header-key" placeholder="Key" style="flex:1;padding:4px;border:1px solid #ddd;border-radius:4px;font-size:13px;">
                    <input class="nt-header-value" placeholder="Value" style="flex:1;padding:4px;border:1px solid #ddd;border-radius:4px;font-size:13px;">
                    <button class="nt-header-remove" style="background:none;border:none;color:#e74c3c;cursor:pointer;">✕</button>
                </div>
            </div>
        </div>
        <div style="margin-bottom:8px;">
            <textarea id="nt-body" rows="4" placeholder="请求体（JSON/文本）" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;font-family:monospace;resize:vertical;"></textarea>
        </div>
        <div style="margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;font-size:14px;">
                <span id="nt-status" style="font-weight:500;">状态码：</span>
                <span id="nt-time" style="color:#888;">耗时：</span>
            </div>
            <div style="margin-top:4px;">
                <div style="font-weight:500;font-size:14px;">响应头</div>
                <div id="nt-response-headers" style="background:#f5f5f5;border-radius:6px;padding:8px;font-size:12px;font-family:monospace;max-height:80px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;border:1px solid #eee;"></div>
            </div>
            <div style="margin-top:8px;">
                <div style="font-weight:500;font-size:14px;">响应体</div>
                <div id="nt-response-body" style="background:#f5f5f5;border-radius:6px;padding:8px;font-size:13px;font-family:monospace;max-height:200px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;border:1px solid #eee;"></div>
            </div>
        </div>
    `;
    var overlay = createToolOverlay('🌐 HTTP 请求测试', html);

    overlay.querySelector('#nt-add-header').addEventListener('click', function() {
        var container = overlay.querySelector('#nt-headers-container');
        var div = document.createElement('div');
        div.style.display = 'flex';
        div.style.gap = '4px';
        div.innerHTML = `
            <input class="nt-header-key" placeholder="Key" style="flex:1;padding:4px;border:1px solid #ddd;border-radius:4px;font-size:13px;">
            <input class="nt-header-value" placeholder="Value" style="flex:1;padding:4px;border:1px solid #ddd;border-radius:4px;font-size:13px;">
            <button class="nt-header-remove" style="background:none;border:none;color:#e74c3c;cursor:pointer;">✕</button>
        `;
        container.appendChild(div);
        div.querySelector('.nt-header-remove').addEventListener('click', function() {
            if (container.children.length > 1) div.remove();
            else window.showToast('至少保留一个请求头');
        });
    });
    overlay.querySelectorAll('.nt-header-remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var parent = this.parentElement;
            if (parent.parentElement.children.length > 1) {
                parent.remove();
            } else {
                window.showToast('至少保留一个请求头');
            }
        });
    });

    overlay.querySelector('#nt-send').addEventListener('click', function() {
        var method = overlay.querySelector('#nt-method').value;
        var url = overlay.querySelector('#nt-url').value.trim();
        if (!url) {
            window.showToast('请输入请求URL');
            return;
        }

        var headers = {};
        var headerKeys = overlay.querySelectorAll('.nt-header-key');
        var headerValues = overlay.querySelectorAll('.nt-header-value');
        for (var i = 0; i < headerKeys.length; i++) {
            var key = headerKeys[i].value.trim();
            var val = headerValues[i].value.trim();
            if (key && val) headers[key] = val;
        }

        var body = overlay.querySelector('#nt-body').value;
        var statusEl = overlay.querySelector('#nt-status');
        var timeEl = overlay.querySelector('#nt-time');
        var respBody = overlay.querySelector('#nt-response-body');
        var respHeaders = overlay.querySelector('#nt-response-headers');

        statusEl.textContent = '状态码：发送中...';
        timeEl.textContent = '耗时：';
        respBody.textContent = '等待响应...';
        respHeaders.textContent = '';

        var startTime = Date.now();
        var fetchOptions = {
            method: method,
            headers: headers,
            body: (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') ? body : undefined
        };

        fetch(url, fetchOptions)
            .then(function(response) {
                var elapsed = Date.now() - startTime;
                statusEl.textContent = '状态码：' + response.status + ' ' + response.statusText;
                timeEl.textContent = '耗时：' + elapsed + 'ms';
                var headerText = '';
                response.headers.forEach(function(value, key) {
                    headerText += key + ': ' + value + '\n';
                });
                respHeaders.textContent = headerText;
                return response.text();
            })
            .then(function(data) {
                try {
                    var json = JSON.parse(data);
                    respBody.textContent = JSON.stringify(json, null, 2);
                } catch(e) {
                    respBody.textContent = data;
                }
            })
            .catch(function(err) {
                statusEl.textContent = '状态码：请求失败';
                timeEl.textContent = '耗时：-';
                respBody.textContent = '错误：' + err.message;
            });
    });
}

// ---------- WHOIS ----------
function openWhoisTool() {
    var html = `
        <div style="display:flex;gap:6px;margin-bottom:10px;">
            <input id="whois-domain" type="text" placeholder="输入域名（如 example.com）" style="flex:3;padding:8px;border-radius:6px;border:1px solid #ddd;font-size:14px;">
            <button id="whois-query" style="padding:8px 20px;background:#2979ff;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">查询</button>
        </div>
        <div id="whois-result" style="background:#f5f5f5;border-radius:6px;padding:12px;font-size:13px;font-family:monospace;max-height:400px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;border:1px solid #eee;"></div>
    `;
    var overlay = createToolOverlay('📋 WHOIS 查询', html);
    overlay.querySelector('#whois-query').addEventListener('click', function() {
        var domain = overlay.querySelector('#whois-domain').value.trim();
        if (!domain) { window.showToast('请输入域名'); return; }
        var resultDiv = overlay.querySelector('#whois-result');
        resultDiv.textContent = '查询中...';
        fetch('https://api.hackertarget.com/whois/?q=' + encodeURIComponent(domain))
            .then(function(res) { return res.text(); })
            .then(function(data) {
                resultDiv.textContent = data || '未获取到信息';
            })
            .catch(function(err) {
                resultDiv.textContent = '查询失败：' + err.message;
            });
    });
}

// ---------- Ping ----------
function openPingTool() {
    var html = `
        <div style="display:flex;gap:6px;margin-bottom:10px;">
            <input id="ping-host" type="text" placeholder="输入域名或IP（如 google.com）" style="flex:3;padding:8px;border-radius:6px;border:1px solid #ddd;font-size:14px;">
            <button id="ping-start" style="padding:8px 20px;background:#2979ff;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">Ping</button>
        </div>
        <div id="ping-result" style="background:#f5f5f5;border-radius:6px;padding:12px;font-size:13px;font-family:monospace;max-height:400px;overflow-y:auto;white