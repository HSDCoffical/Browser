// ============================================================
// 独立工具箱模块（由 app.js 动态加载）
// ============================================================
(function() {
    'use strict';

    // ---------- 工具函数：创建通用浮层 ----------
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

    // ---------- HTTP 请求测试 ----------
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
            var