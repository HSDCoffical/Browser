// ============================================================
// 独立历史/收藏模块（UI/布局/动画与设置面板一致）
// ============================================================
(function() {
    'use strict';

    // ---------- 数据（从 localStorage 读取） ----------
    var favorites = [];
    var history = [];
    var currentMode = 'fav'; // 'fav' 或 'hist'

    function loadData() {
        try {
            var fav = localStorage.getItem('mybrowser_favorites');
            if (fav) favorites = JSON.parse(fav);
            var hist = localStorage.getItem('mybrowser_history');
            if (hist) history = JSON.parse(hist);
        } catch(e) { /* ignore */ }
    }

    function saveFavorites() {
        localStorage.setItem('mybrowser_favorites', JSON.stringify(favorites));
    }
    function saveHistory() {
        localStorage.setItem('mybrowser_history', JSON.stringify(history));
    }

    // ---------- 渲染列表 ----------
    function renderList(mode) {
        var container = document.getElementById('historyListContainer');
        if (!container) return;
        var data = mode === 'fav' ? favorites : history;
        if (data.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#999;padding:20px 0;">暂无记录</div>';
            return;
        }
        var html = '';
        data.forEach(function(item, idx) {
            html += '<div class="func-item" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(0,0,0,0.05);">' +
                    '<div style="flex:1;overflow:hidden;">' +
                    '<div style="font-size:15px;font-weight:500;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (item.title || '未命名') + '</div>' +
                    '<div style="font-size:12px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + item.url + '</div>' +
                    '</div>' +
                    '<div style="display:flex;gap:8px;flex-shrink:0;">' +
                    '<button class="func-action" data-url="' + item.url + '" style="padding:4px 12px;background:#2979ff;color:#fff;border:none;border-radius:16px;font-size:12px;cursor:pointer;">打开</button>' +
                    '<button class="func-del" data-idx="' + idx + '" data-mode="' + mode + '" style="background:none;border:none;color:#e74c3c;font-size:18px;cursor:pointer;">✕</button>' +
                    '</div>' +
                    '</div>';
        });
        container.innerHTML = html;

        // 绑定事件
        container.querySelectorAll('.func-action').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var url = this.dataset.url;
                if (url) window.location.href = url;
            });
        });
        container.querySelectorAll('.func-del').forEach(function(btn) {
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
                renderList(mode);
                window.showToast('已删除');
            });
        });
    }

    // ---------- 打开主面板（与设置面板风格一致） ----------
    function openHistoryPanel() {
        loadData();

        // 创建面板浮层（与设置面板相同的结构和样式）
        var overlay = document.createElement('div');
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

        // 关闭事件
        overlay.querySelector('.panel-close').addEventListener('click', function() {
            overlay.remove();
        });
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });

        // 标签切换
        var favTab = overlay.querySelector('#historyTabFav');
        var histTab = overlay.querySelector('#historyTabHist');
        favTab.addEventListener('click', function() {
            currentMode = 'fav';
            renderList('fav');
            this.style.background = '#2979ff';
            histTab.style.background = '#888';
        });
        histTab.addEventListener('click', function() {
            currentMode = 'hist';
            renderList('hist');
            this.style.background = '#2979ff';
            favTab.style.background = '#888';
        });

        // 默认显示收藏
        renderList('fav');
    }

    // ---------- 暴露全局接口 ----------
    window.openHistoryPanel = openHistoryPanel;

})();