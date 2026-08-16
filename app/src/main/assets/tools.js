// ============================================================
// 独立工具箱模块（修复版：API + 毛玻璃 + 返回主面板）
// ============================================================
(function() {
    'use strict';

    // ---------- 工具函数：创建通用浮层（毛玻璃效果） ----------
    function createToolOverlay(title, contentHTML) {
        var overlay = document.createElement('div');
        overlay.className = 'tool-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.3);z-index:9999;display:flex;align-items:center;justify-content:center;';

        var sheet = document.createElement('div');
        sheet.style.cssText = 'background:rgba(255,255,255,0.65);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-radius:16px;max-width:92%;max-height:90%;width:540px;overflow-y:auto;padding:20px;box-shadow:0 8px 40px rgba(0,0,0,0.15);position:relative;border:1px solid rgba(255,255,255,0.3);';
        sheet.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="margin:0;color:#1a1a2e;">${title}</h3>
                <button class="close-tool" style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;padding:4px 8px;">✕</button>
            </div>
            ${contentHTML}
        `;
        overlay.appendChild(sheet);
        document.body.appendChild(overlay);

        // 关闭按钮：关闭当前工具浮层，并重新打开工具箱主面板
        overlay.querySelector('.close-tool').addEventListener('click', function() {
            overlay.remove();
            // 延迟一点点打开主面板，避免冲突
            setTimeout(function() {
                if (typeof window.openToolsPanel === 'function') {
                    window.openToolsPanel();
                }
            }, 100);
        });
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.remove();
                setTimeout(function() {
                    if (typeof window.openToolsPanel === 'function') {
                        window.openToolsPanel();
                    }
                }, 100);
            }
        });
        return overlay;
    }

    // ---------- HTTP 请求测试（保持不变） ----------
    function openHttpTool() {
        var html = `
            <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">
                <select id="nt-method" style="flex:1;padding:8px;border-radius:6px;border:1px solid rgba(0,0,0,0.1);background:rgba(255,255,255,0.6);font-size:14px;">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                    <option value="HEAD">HEAD</option>
                    <option value="OPTIONS">OPTIONS</option>
                </select>
                <input id="nt-url" type="text" placeholder="请求URL" style="flex:3;padding:8px;border-radius:6px;border:1px solid rgba(0,0,0,0.1);background:rgba(255,255,255,0.6);font-size:14px;">
                <button id="nt-send" style="padding:8px 20px;background:#2979ff;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">发送</button>
            </div>
            <div style="margin-bottom:8px;">
                <div style="display:flex;gap:4px;margin-bottom:4px;">
                    <span style="font-weight:500;font-size:14px;">请求头</span>
                    <button id="nt-add-header" style="background:none;border:1px solid rgba(0,0,0,0.1);border-radius:4px;padding:2px 8px;font-size:12px;cursor:pointer;">+</button>
                </div>
                <div id="nt-headers-container" style="display:flex;flex-direction:column;gap:4px;max-height:120px;overflow-y:auto;padding:4px 0;">
                    <div style="display:flex;gap:4px;">
                        <input class="nt-header-key" placeholder="Key" style="flex:1;padding:4px;border:1px solid rgba(0,0,0,0.1);border-radius:4px;font-size:13px;background:rgba(255,255,255,0.6);">
                        <input class="nt-header-value" placeholder="Value" style="flex:1;padding:4px;border:1px solid rgba(0,0,0,0.1);border-radius:4px;font-size:13px;background:rgba(255,255,255,0.6);">
                        <button class="nt-header-remove" style="background:none;border:none;color:#e74c3c;cursor:pointer;">✕</button>
                    </div>
                </div>
            </div>
            <div style="margin-bottom:8px;">
                <textarea id="nt-body" rows="4" placeholder="请求体（JSON/文本）" style="width:100%;padding:8px;border:1px solid rgba(0,0,0,0.1);border-radius:6px;font-size:13px;font-family:monospace;resize:vertical;background:rgba(255,255,255,0.6);"></textarea>
            </div>
            <div style="margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;font-size:14px;">
                    <span id="nt-status" style="font-weight:500;">状态码：</span>
                    <span id="nt-time" style="color:#888;">耗时：</span>
                </div>
                <div style="margin-top:4px;">
                    <div style="font-weight:500;font-size:14px;">响应头</div>
                    <div id="nt-response-headers" style="background:rgba(255,255,255,0.4);border-radius:6px;padding:8px;font-size:12px;font-family:monospace;max-height:80px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;border:1px solid rgba(255,255,255,0.3);"></div>
                </div>
                <div style="margin-top:8px;">
                    <div style="font-weight:500;font-size:14px;">响应体</div>
                    <div id="nt-response-body" style="background:rgba(255,255,255,0.4);border-radius:6px;padding:8px;font-size:13px;font-family:monospace;max-height:200px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;border:1px solid rgba(255,255,255,0.3);"></div>
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
                <input class="nt-header-key" placeholder="Key" style="flex:1;padding:4px;border:1px solid rgba(0,0,0,0.1);border-radius:4px;font-size:13px;background:rgba(255,255,255,0.6);">
                <input class="nt-header-value" placeholder="Value" style="flex:1;padding:4px;border:1px solid rgba(0,0,0,0.1);border-radius:4px;font-size:13px;background:rgba(255,255,255,0.6);">
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

    // ---------- WHOIS 查询（修复API） ----------
    function openWhoisTool() {
        var html = `
            <div style="display:flex;gap:6px;margin-bottom:10px;">
                <input id="whois-domain" type="text" placeholder="输入域名（如 example.com）" style="flex:3;padding:8px;border-radius:6px;border:1px solid rgba(0,0,0,0.1);background:rgba(255,255,255,0.6);font-size:14px;">
                <button id="whois-query" style="padding:8px 20px;background:#2979ff;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">查询</button>
            </div>
            <div id="whois-result" style="background:rgba(255,255,255,0.4);border-radius:6px;padding:12px;font-size:13px;font-family:monospace;max-height:400px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;border:1px solid rgba(255,255,255,0.3);"></div>
        `;
        var overlay = createToolOverlay('📋 WHOIS 查询', html);
        overlay.querySelector('#whois-query').addEventListener('click', function() {
            var domain = overlay.querySelector('#whois-domain').value.trim();
            if (!domain) { window.showToast('请输入域名'); return; }
            var resultDiv = overlay.querySelector('#whois-result');
            resultDiv.textContent = '查询中...';
            // 使用 hackertarget 公开 API（无需密钥）
            var apiUrl = 'https://api.hackertarget.com/whois/?q=' + encodeURIComponent(domain);
            fetch(apiUrl)
                .then(function(res) { return res.text(); })
                .then(function(data) {
                    if (data && data.indexOf('error') === -1) {
                        resultDiv.textContent = data;
                    } else {
                        resultDiv.textContent = '查询失败，请检查域名是否正确，或稍后重试';
                    }
                })
                .catch(function(err) {
                    resultDiv.textContent = '查询失败：' + err.message;
                });
        });
    }

    // ---------- Ping 检测（不变） ----------
    function openPingTool() {
        var html = `
            <div style="display:flex;gap:6px;margin-bottom:10px;">
                <input id="ping-host" type="text" placeholder="输入域名或IP（如 google.com）" style="flex:3;padding:8px;border-radius:6px;border:1px solid rgba(0,0,0,0.1);background:rgba(255,255,255,0.6);font-size:14px;">
                <button id="ping-start" style="padding:8px 20px;background:#2979ff;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">Ping</button>
            </div>
            <div id="ping-result" style="background:rgba(255,255,255,0.4);border-radius:6px;padding:12px;font-size:13px;font-family:monospace;max-height:400px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;border:1px solid rgba(255,255,255,0.3);"></div>
        `;
        var overlay = createToolOverlay('📡 Ping 检测', html);
        overlay.querySelector('#ping-start').addEventListener('click', function() {
            var host = overlay.querySelector('#ping-host').value.trim();
            if (!host) { window.showToast('请输入域名或IP'); return; }
            var resultDiv = overlay.querySelector('#ping-result');
            resultDiv.textContent = '正在检测...\n';
            var url = host;
            if (!host.startsWith('http://') && !host.startsWith('https://')) {
                url = 'https://' + host;
            }
            var startTime = Date.now();
            fetch(url, { method: 'HEAD', mode: 'no-cors' })
                .then(function() {
                    var elapsed = Date.now() - startTime;
                    resultDiv.textContent = '✅ 响应正常，延迟：' + elapsed + 'ms';
                })
                .catch(function(err) {
                    fetch(url, { method: 'GET', mode: 'no-cors' })
                        .then(function() {
                            var elapsed = Date.now() - startTime;
                            resultDiv.textContent = '✅ 响应正常（no-cors），延迟：' + elapsed + 'ms';
                        })
                        .catch(function(e) {
                            resultDiv.textContent = '❌ 请求失败：' + e.message + '\n注意：某些网站可能禁止跨域请求，可尝试使用 HTTP 测试工具。';
                        });
                });
        });
    }

    // ---------- DNS 查询（不变） ----------
    function openDnsTool() {
        var html = `
            <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">
                <input id="dns-domain" type="text" placeholder="输入域名" style="flex:2;padding:8px;border-radius:6px;border:1px solid rgba(0,0,0,0.1);background:rgba(255,255,255,0.6);font-size:14px;">
                <select id="dns-type" style="flex:1;padding:8px;border-radius:6px;border:1px solid rgba(0,0,0,0.1);background:rgba(255,255,255,0.6);font-size:14px;">
                    <option value="A">A</option>
                    <option value="AAAA">AAAA</option>
                    <option value="CNAME">CNAME</option>
                    <option value="MX">MX</option>
                    <option value="TXT">TXT</option>
                    <option value="NS">NS</option>
                </select>
                <button id="dns-query" style="padding:8px 20px;background:#2979ff;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">查询</button>
            </div>
            <div id="dns-result" style="background:rgba(255,255,255,0.4);border-radius:6px;padding:12px;font-size:13px;font-family:monospace;max-height:400px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;border:1px solid rgba(255,255,255,0.3);"></div>
        `;
        var overlay = createToolOverlay('🔍 DNS 查询', html);
        overlay.querySelector('#dns-query').addEventListener('click', function() {
            var domain = overlay.querySelector('#dns-domain').value.trim();
            var type = overlay.querySelector('#dns-type').value;
            if (!domain) { window.showToast('请输入域名'); return; }
            var resultDiv = overlay.querySelector('#dns-result');
            resultDiv.textContent = '查询中...';
            var url = 'https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(domain) + '&type=' + type;
            fetch(url, { headers: { 'Accept': 'application/dns-json' } })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.Status === 0 && data.Answer) {
                        var lines = [];
                        data.Answer.forEach(function(ans) {
                            lines.push(ans.name + '  ' + ans.type + '  ' + ans.data);
                        });
                        resultDiv.textContent = lines.join('\n') || '无记录';
                    } else {
                        resultDiv.textContent = '未找到记录或查询失败';
                    }
                })
                .catch(function(err) {
                    resultDiv.textContent = '查询失败：' + err.message;
                });
        });
    }

    // ---------- IP 信息查询（修复API，改用 ipinfo.io） ----------
    function openIpTool() {
        var html = `
            <div style="display:flex;gap:6px;margin-bottom:10px;">
                <input id="ip-address" type="text" placeholder="输入IP地址（留空查本机）" style="flex:3;padding:8px;border-radius:6px;border:1px solid rgba(0,0,0,0.1);background:rgba(255,255,255,0.6);font-size:14px;">
                <button id="ip-query" style="padding:8px 20px;background:#2979ff;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">查询</button>
            </div>
            <div id="ip-result" style="background:rgba(255,255,255,0.4);border-radius:6px;padding:12px;font-size:13px;font-family:monospace;max-height:400px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;border:1px solid rgba(255,255,255,0.3);"></div>
        `;
        var overlay = createToolOverlay('🌍 IP 信息查询', html);
        overlay.querySelector('#ip-query').addEventListener('click', function() {
            var ip = overlay.querySelector('#ip-address').value.trim();
            var resultDiv = overlay.querySelector('#ip-result');
            resultDiv.textContent = '查询中...';
            var url = ip ? 'https://ipinfo.io/' + ip + '/json' : 'https://ipinfo.io/json';
            fetch(url)
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data && data.ip) {
                        resultDiv.textContent = 'IP: ' + data.ip + '\n' +
                            '国家: ' + (data.country || '未知') + '\n' +
                            '地区: ' + (data.region || '未知') + '\n' +
                            '城市: ' + (data.city || '未知') + '\n' +
                            'ISP: ' + (data.org || '未知') + '\n' +
                            '时区: ' + (data.timezone || '未知') + '\n' +
                            '经纬度: ' + (data.loc || '未知');
                    } else {
                        resultDiv.textContent = '查询失败：' + (data.error || '未知错误');
                    }
                })
                .catch(function(err) {
                    resultDiv.textContent = '查询失败：' + err.message;
                });
        });
    }

    // ---------- Base64 编解码（不变） ----------
    function openBase64Tool() {
        var html = `
            <div style="margin-bottom:8px;">
                <textarea id="b64-input" rows="4" placeholder="输入要编码/解码的文本" style="width:100%;padding:8px;border:1px solid rgba(0,0,0,0.1);border-radius:6px;font-size:13px;font-family:monospace;resize:vertical;background:rgba(255,255,255,0.6);"></textarea>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:8px;">
                <button id="b64-encode" style="padding:8px 20px;background:#2979ff;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">编码</button>
                <button id="b64-decode" style="padding:8px 20px;background:#f5a623;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">解码</button>
                <button id="b64-clear" style="padding:8px 20px;background:#e74c3c;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">清空</button>
            </div>
            <div>
                <div style="font-weight:500;font-size:14px;">结果</div>
                <div id="b64-result" style="background:rgba(255,255,255,0.4);border-radius:6px;padding:12px;font-size:13px;font-family:monospace;min-height:80px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;border:1px solid rgba(255,255,255,0.3);"></div>
            </div>
        `;
        var overlay = createToolOverlay('🔐 Base64 编解码', html);
        overlay.querySelector('#b64-encode').addEventListener('click', function() {
            var input = overlay.querySelector('#b64-input').value;
            try {
                var encoded = btoa(unescape(encodeURIComponent(input)));
                overlay.querySelector('#b64-result').textContent = encoded;
            } catch(e) {
                overlay.querySelector('#b64-result').textContent = '编码失败：' + e.message;
            }
        });
        overlay.querySelector('#b64-decode').addEventListener('click', function() {
            var input = overlay.querySelector('#b64-input').value;
            try {
                var decoded = decodeURIComponent(escape(atob(input)));
                overlay.querySelector('#b64-result').textContent = decoded;
            } catch(e) {
                overlay.querySelector('#b64-result').textContent = '解码失败：' + e.message;
            }
        });
        overlay.querySelector('#b64-clear').addEventListener('click', function() {
            overlay.querySelector('#b64-input').value = '';
            overlay.querySelector('#b64-result').textContent = '';
        });
    }

    // ---------- URL 编解码（不变） ----------
    function openUrlTool() {
        var html = `
            <div style="margin-bottom:8px;">
                <textarea id="url-input" rows="4" placeholder="输入要编码/解码的URL" style="width:100%;padding:8px;border:1px solid rgba(0,0,0,0.1);border-radius:6px;font-size:13px;font-family:monospace;resize:vertical;background:rgba(255,255,255,0.6);"></textarea>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:8px;">
                <button id="url-encode" style="padding:8px 20px;background:#2979ff;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">编码</button>
                <button id="url-decode" style="padding:8px 20px;background:#f5a623;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">解码</button>
                <button id="url-clear" style="padding:8px 20px;background:#e74c3c;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">清空</button>
            </div>
            <div>
                <div style="font-weight:500;font-size:14px;">结果</div>
                <div id="url-result" style="background:rgba(255,255,255,0.4);border-radius:6px;padding:12px;font-size:13px;font-family:monospace;min-height:80px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;border:1px solid rgba(255,255,255,0.3);"></div>
            </div>
        `;
        var overlay = createToolOverlay('🔗 URL 编解码', html);
        overlay.querySelector('#url-encode').addEventListener('click', function() {
            var input = overlay.querySelector('#url-input').value;
            try {
                overlay.querySelector('#url-result').textContent = encodeURIComponent(input);
            } catch(e) {
                overlay.querySelector('#url-result').textContent = '编码失败：' + e.message;
            }
        });
        overlay.querySelector('#url-decode').addEventListener('click', function() {
            var input = overlay.querySelector('#url-input').value;
            try {
                overlay.querySelector('#url-result').textContent = decodeURIComponent(input);
            } catch(e) {
                overlay.querySelector('#url-result').textContent = '解码失败：' + e.message;
            }
        });
        overlay.querySelector('#url-clear').addEventListener('click', function() {
            overlay.querySelector('#url-input').value = '';
            overlay.querySelector('#url-result').textContent = '';
        });
    }

    // ---------- 工具箱主面板（毛玻璃） ----------
    function openToolsPanel() {
        var overlay = document.createElement('div');
        overlay.id = 'toolsPanelOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.3);z-index:9999;display:flex;align-items:center;justify-content:center;';

        var sheet = document.createElement('div');
        sheet.style.cssText = 'background:rgba(255,255,255,0.65);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-radius:16px;max-width:92%;max-height:90%;width:480px;overflow-y:auto;padding:20px;box-shadow:0 8px 40px rgba(0,0,0,0.15);position:relative;border:1px solid rgba(255,255,255,0.3);';
        sheet.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="margin:0;color:#1a1a2e;">🧰 工具箱</h3>
                <button id="closeToolsPanel" style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;padding:4px 8px;">✕</button>
            </div>
            <div id="toolsList" style="display:flex;flex-direction:column;gap:10px;"></div>
        `;
        overlay.appendChild(sheet);
        document.body.appendChild(overlay);

        overlay.querySelector('#closeToolsPanel').addEventListener('click', function() {
            overlay.remove();
        });
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });

        var tools = [
            { id: 'http', label: '🌐 HTTP 请求测试', desc: 'GET/POST/PUT/DELETE，自定义请求头' },
            { id: 'whois', label: '📋 WHOIS 查询', desc: '查询域名 WHOIS 信息' },
            { id: 'ping', label: '📡 Ping 检测', desc: 'HTTP 延迟测速' },
            { id: 'dns', label: '🔍 DNS 查询', desc: 'A/AAAA/CNAME/MX/TXT/NS 记录' },
            { id: 'ip', label: '🌍 IP 信息查询', desc: '地理位置和 ISP' },
            { id: 'b64', label: '🔐 Base64 编解码', desc: '文本与 Base64 互转' },
            { id: 'url', label: '🔗 URL 编解码', desc: 'URL 编码与解码' }
        ];

        var container = document.getElementById('toolsList');
        container.innerHTML = '';
        tools.forEach(function(tool) {
            var div = document.createElement('div');
            div.style.cssText = 'background:rgba(255,255,255,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:10px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;border:1px solid rgba(255,255,255,0.3);transition:background 0.15s;';
            div.innerHTML = '<div><div style="font-weight:500;font-size:15px;color:#1a1a2e;">' + tool.label + '</div><div style="font-size:13px;color:#888;">' + tool.desc + '</div></div><span style="color:#ccc;font-size:20px;">›</span>';
            container.appendChild(div);
            div.addEventListener('click', function() {
                if (overlay) overlay.remove();
                switch (tool.id) {
                    case 'http': openHttpTool(); break;
                    case 'whois': openWhoisTool(); break;
                    case 'ping': openPingTool(); break;
                    case 'dns': openDnsTool(); break;
                    case 'ip': openIpTool(); break;
                    case 'b64': openBase64Tool(); break;
                    case 'url': openUrlTool(); break;
                }
            });
        });
    }

    // ---------- 暴露全局接口 ----------
    window.openToolsPanel = openToolsPanel;
})();