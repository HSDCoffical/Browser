// ============================================================
// 下载管理模块
// ============================================================
(function() {
    'use strict';
    try {
        window.renderDownloadList = function() {
            var list = document.getElementById('downloadList');
            if (!list) {
                list = document.getElementById('downloadListContainer');
            }
            if (!list) return;
            var downloads = [];
            try {
                var data = localStorage.getItem('mybrowser_downloads');
                if (data) downloads = JSON.parse(data);
            } catch(e) {}
            if (downloads.length === 0) {
                list.innerHTML = '<div class="func-item" style="text-align:center;color:#999;">暂无下载记录</div>';
                return;
            }
            var html = '';
            downloads.forEach(function(item, idx) {
                html += '<div class="func-item">' +
                        '<div class="func-info">' +
                        '<div class="func-title">' + (item.name || '未知文件') + '</div>' +
                        '<div class="func-desc">' + (item.url || '') + '</div>' +
                        '</div>' +
                        '<div style="display:flex;gap:4px;">' +
                        '<button class="func-action" data-url="' + item.url + '">打开</button>' +
                        '<button class="func-del" data-idx="' + idx + '">✕</button>' +
                        '</div>' +
                        '</div>';
            });
            list.innerHTML = html;

            list.querySelectorAll('.func-action').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var url = this.dataset.url;
                    if (url) {
                        var a = document.createElement('a');
                        a.href = url;
                        a.target = '_blank';
                        a.download = '';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }
                });
            });
            list.querySelectorAll('.func-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    downloads.splice(idx, 1);
                    localStorage.setItem('mybrowser_downloads', JSON.stringify(downloads));
                    window.renderDownloadList();
                    window.showToast('已删除');
                });
            });
        };

        window.addDownloadItem = function(name, url) {
            var downloads = [];
            try {
                var data = localStorage.getItem('mybrowser_downloads');
                if (data) downloads = JSON.parse(data);
            } catch(e) {}
            downloads.push({ name: name || '下载文件', url: url, time: Date.now() });
            localStorage.setItem('mybrowser_downloads', JSON.stringify(downloads));
            if (typeof window.renderDownloadList === 'function') {
                window.renderDownloadList();
            }
            window.showToast('下载已添加到列表');
        };

        console.log('✅ 下载模块加载成功');
    } catch(e) {
        console.error('❌ 下载模块加载失败:', e);
        window.renderDownloadList = function() {};
        window.addDownloadItem = function() {};
    }
})();