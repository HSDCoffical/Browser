// ============================================================
// 下载管理器（前端）
// ============================================================
window.DownloadManager = {
    tasks: {}, // 键为downloadId，值为任务对象

    // 添加任务（由Java调用）
    addTask: function(id, name, totalSize) {
        this.tasks[id] = {
            id: id,
            name: name,
            totalSize: totalSize || 0,
            downloadedSize: 0,
            speed: 0,
            status: 'downloading', // downloading, paused, done, error
            progress: 0,
            startTime: Date.now()
        };
        this.render();
    },

    // 更新进度（由Java调用）
    updateProgress: function(id, downloadedSize, totalSize, speed) {
        var task = this.tasks[id];
        if (!task) return;
        task.downloadedSize = downloadedSize;
        if (totalSize) task.totalSize = totalSize;
        task.speed = speed || 0;
        task.progress = task.totalSize > 0 ? (downloadedSize / task.totalSize) * 100 : 0;
        if (task.progress >= 100) {
            task.status = 'done';
        }
        this.render();
    },

    // 暂停/继续
    togglePause: function(id) {
        var task = this.tasks[id];
        if (!task) return;
        if (task.status === 'done') return;
        var newStatus = task.status === 'paused' ? 'downloading' : 'paused';
        task.status = newStatus;
        // 通知Java层暂停/继续
        if (window._nativeDownload) {
            window._nativeDownload.togglePause(id, newStatus === 'downloading');
        }
        this.render();
    },

    // 取消下载
    cancel: function(id) {
        var task = this.tasks[id];
        if (!task) return;
        if (window._nativeDownload) {
            window._nativeDownload.cancel(id);
        }
        delete this.tasks[id];
        this.render();
    },

    // 渲染所有任务
    render: function() {
        var container = document.getElementById('downloadListContainer');
        if (!container) return;
        var ids = Object.keys(this.tasks);
        if (ids.length === 0) {
            container.innerHTML = '<div class="func-item" style="text-align:center;color:#999;">暂无下载记录</div>';
            return;
        }
        var html = '';
        ids.forEach(function(id) {
            var task = this.tasks[id];
            var statusText = { downloading: '下载中', paused: '已暂停', done: '已完成', error: '错误' }[task.status] || '';
            var progress = Math.round(task.progress);
            var sizeText = window._formatSize(task.downloadedSize) + ' / ' + window._formatSize(task.totalSize);
            var speedText = task.speed ? window._formatSize(task.speed) + '/s' : '0B/s';
            var isDone = task.status === 'done';
            var isPaused = task.status === 'paused';
            var statusClass = isDone ? 'done' : (isPaused ? 'paused' : '');

            html += '<div class="download-item ' + statusClass + '" data-id="' + id + '">';
            html += '  <div class="di-header">';
            html += '    <span class="di-name">' + task.name + '</span>';
            html += '    <span class="di-status">' + statusText + '</span>';
            html += '  </div>';
            html += '  <div class="di-progress-track"><div class="di-progress-fill" style="width:' + progress + '%;"></div></div>';
            html += '  <div class="di-info">';
            html += '    <span>' + sizeText + '</span>';
            html += '    <span>' + speedText + '</span>';
            html += '  </div>';
            html += '  <div class="di-actions">';
            if (!isDone) {
                html += '    <button class="di-pause" data-id="' + id + '">' + (isPaused ? '继续' : '暂停') + '</button>';
                html += '    <button class="di-cancel" data-id="' + id + '">取消</button>';
            } else {
                html += '    <button class="di-open" data-id="' + id + '">打开</button>';
                html += '    <button class="di-cancel" data-id="' + id + '">删除</button>';
            }
            html += '  </div>';
            html += '</div>';
        }.bind(this));
        container.innerHTML = html;

        // 绑定事件
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
                    if (confirm('确定取消下载吗？')) {
                        window.DownloadManager.cancel(id);
                    }
                }
            });
        });
        container.querySelectorAll('.di-open').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = this.dataset.id;
                var task = window.DownloadManager.tasks[id];
                if (task && task.status === 'done') {
                    // 通知Java打开文件
                    if (window._nativeDownload) {
                        window._nativeDownload.openFile(id);
                    }
                }
            });
        });
    },

    // 工具：格式化大小
    _formatSize: function(bytes) {
        if (!bytes) return '0B';
        var units = ['B', 'KB', 'MB', 'GB'];
        var i = 0;
        while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
        return (i === 0 ? bytes : bytes.toFixed(1)) + units[i];
    }
};

// 暴露给Java调用
window._addDownloadTask = function(id, name, totalSize) {
    window.DownloadManager.addTask(id, name, totalSize);
};
window._updateDownloadProgress = function(id, downloaded, total, speed) {
    window.DownloadManager.updateProgress(id, downloaded, total, speed);
};
window._downloadComplete = function(id) {
    var task = window.DownloadManager.tasks[id];
    if (task) {
        task.status = 'done';
        task.progress = 100;
        task.downloadedSize = task.totalSize;
        window.DownloadManager.render();
    }
};
// 注意：Java端通过 evaluateJavascript 调用这些函数