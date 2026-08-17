// ============================================================
// 独立历史/收藏模块（自带异常保护）
// ============================================================
(function() {
    'use strict';

    try {
        var favoritesData = [];
        var historyData = [];
        var currentHistoryMode = 'fav';

        function loadHistoryData() {
            try {
                var fav = localStorage.getItem('mybrowser_favorites');
                if (fav) favoritesData = JSON.parse(fav);
                var hist = localStorage.getItem('mybrowser_history');
                if (hist) historyData = JSON.parse(hist);
            } catch(e) { /* ignore */ }
        }

        function saveFavoritesData() {
            try { localStorage.setItem('mybrowser_favorites', JSON.stringify(favoritesData)); } catch(e) {}
        }
        function saveHistoryData() {
            try { localStorage.setItem('mybrowser_history', JSON.stringify(historyData)); } catch(e) {}
        }

        function renderHistoryList(mode) {
            try {
                var container = document.getElementById('historyListContainer');
                if (!container) {
                    var panelBody = document.querySelector('#historySheet .panel-body');
                    if (panelBody) {
                        var div = document.createElement('div');
                        div.id = 'historyListContainer';
                        panelBody.appendChild(div);
                        container = div;
                    } else {
                        return;
                    }
                }
                var data = mode === 'fav' ? favoritesData : historyData;
                if (data.length === 0) {
                    container.innerHTML = '<div style="text-align:center;color:#999;padding:20px 0;">暂无记录</div>';
                    return;
                }
                var html = '';
                data.forEach(function(item, idx) {
                    var title = item.title || '未命名';
                    var url = item.url || '';
                    html += '<div class="func-item" data-url="' + url.replace(/'/g, "\\'") + '" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(0,0,0,0.05);cursor:pointer;">' +
                            '<div style="flex:1;overflow:hidden;">' +
                            '<div style="font-size:15px;font-weight:500;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + title.replace(/'/g, "\\'") + '</div>' +
                            '<div style="font-size:12px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + url.replace(/'/g, "\\'") + '</div>' +
                            '</div>' +
                            '<button class="func-del" data-idx="' + idx + '" data-mode="' + mode + '" style="background:none;border:none;color:#e74c3c;font-size:18px;cursor:pointer;flex-shrink:0;padding:4px 8px;">✕</button>' +
                            '</div>';
                });
                container.innerHTML = html;

                // 点击整行跳转（与窗口列表一致）
                container.querySelectorAll('.func-item').forEach(function(el) {
                    el.addEventListener('click', function(e) {
                        if (e.target.closest('.func-del')) return;
                        var url = this.dataset.url;
                        if (url) window.location.href = url;
                    });
                });
                container.querySelectorAll('.func-del').forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        var idx = parseInt(this.dataset.idx);
                        var mode = this.dataset.mode;
                        if (mode === 'fav') {
                            favoritesData.splice(idx, 1);
                            saveFavoritesData();
                        } else {
                            historyData.splice(idx, 1);
                            saveHistoryData();
                        }
                        renderHistoryList(mode);
                        window.showToast('已删除');
                    });
                });
            } catch(e) {
                console.error('renderHistoryList 错误:', e);
            }
        }

        window.openHistoryPanel = function() {
            try {
                loadHistoryData();

                var existing = document.getElementById('historyPanelOverlay');
                if (existing) existing.remove();

                var overlay = document.createElement('div');
                overlay.id = 'historyPanelOverlay';
                overlay.className = 'panel-overlay';
                overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.25);z-index:100;display:block;animation:fadeIn 0.25s ease;';

                var sheet = document.createElement('div');
                sheet.className = 'panel-sheet';
                sheet.style.cssText = 'position:fixed;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;background:rgba(255,255,255,0.92);border-radius:28px 28px 0 0;z-index:101;display:flex;flex-direction:column;max-height:100%;box-shadow:0 -8px 40px rgba(0,0,0,0.10);border-top:1px solid rgba(255,255,255,0.2);overflow:hidden;transform:translateY(0);opacity:1;pointer-events:auto;padding-bottom:64px;animation:slideUp 0.35s cubic-bezier(0.32,0.72,0,1);';
                sheet.innerHTML = `
                    <div class="panel-header" style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px 12px 20px;border-bottom:1px solid rgba(0,0,0,0.05);flex-shrink:0;">
                        <span class="panel-title" style="font-size:18px;font-weight:600;color:#1a1a2e;">收藏 &amp; 历史</span>
                        <button class="panel-close" style="font-size:26px;color:#999;background:none;border:none;cursor:pointer;padding:0 4px;line-height:1;">✕</button>
                    </div>
                    <div class="panel-body" style="flex:1;overflow-y:auto;padding:12px 18px 28px 18px;">
                        <div style="margin-bottom:10px;display:flex;gap:8px;">
                            <button id="historyTabFav" class="func-action" style="padding:6px 14px;background:#2979ff;color:#fff;border:none;border-radius:16px;font-size:12px;cursor:pointer;">收藏</button>
                            <button id="historyTabHist" class="func-action" style="padding:6px 14px;background:#888;color:#fff;border:none;border-radius:16px;font-size:12px;cursor:pointer;">历史</button>
                        </div>
                        <div id="historyListContainer"></div>
                    </div>
                `;
                overlay.appendChild(sheet);
                document.body.appendChild(overlay);

                overlay.querySelector('.panel-close').addEventListener('click', function() {
                    overlay.remove();
                });
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) overlay.remove();
                });

                var favTab = overlay.querySelector('#historyTabFav');
                var histTab = overlay.querySelector('#historyTabHist');
                favTab.addEventListener('click', function() {
                    currentHistoryMode = 'fav';
                    renderHistoryList('fav');
                    this.style.background = '#2979ff';
                    histTab.style.background = '#888';
                });
                histTab.addEventListener('click', function() {
                    currentHistoryMode = 'hist';
                    renderHistoryList('hist');
                    this.style.background = '#2979ff';
                    favTab.style.background = '#888';
                });

                renderHistoryList('fav');
            } catch(e) {
                console.error('openHistoryPanel 错误:', e);
                window.showToast('打开历史面板失败，请重试');
            }
        };

        window.addHistory = function(title, url) {
            try {
                if (window.isIncognito) return;
                historyData = historyData.filter(function(item) { return item.url !== url; });
                historyData.unshift({ title: title || url, url: url, time: Date.now() });
                if (historyData.length > 100) historyData = historyData.slice(0, 100);
                saveHistoryData();
            } catch(e) {
                console.error('addHistory 错误:', e);
            }
        };

        window.addFavorite = function(title, url) {
            try {
                if (favoritesData.some(function(item) { return item.url === url; })) {
                    window.showToast('已收藏');
                    return;
                }
                favoritesData.unshift({ title: title || url, url: url, time: Date.now() });
                saveFavoritesData();
                window.showToast('已收藏');
            } catch(e) {
                console.error('addFavorite 错误:', e);
            }
        };

        console.log('历史/收藏模块加载成功');

    } catch(e) {
        console.error('历史/收藏模块加载失败:', e);
        window.openHistoryPanel = function() {
            window.showToast('历史功能暂时不可用，请重试');
        };
        window.addHistory = function() {};
        window.addFavorite = function() {};
    }
})();