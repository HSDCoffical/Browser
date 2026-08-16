// ============================================================
// 下载管理模块（模拟实现，不依赖Java接口）
// ============================================================
(function() {
    'use strict';

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
                        if (confirm('确定取消下载吗？')) {
                            window.DownloadManager.cancel(id);
                        }
                    }
                });
            });
            container.querySelectorAll('.di-install').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var id = this.dataset.id;
                    window.DownloadManager.install(id);
                });
            });

            // 长按删除（触屏）
            var longPressTimer = null;
            container.querySelectorAll('.download-item').forEach(function(item) {
                item.addEventListener('touchstart', function(e) {
                    var id = this.dataset.id;
                    longPressTimer = setTimeout(function() {
                        if (confirm('确定删除此下载记录吗？')) {
                            window.DownloadManager.cancel(id);
                        }
                    }, 600);
                });
                item.addEventListener('touchend', function() {
                    clearTimeout(longPressTimer);
                });
                item.addEventListener('touchmove', function() {
                    clearTimeout(longPressTimer);
                });
            });
        },
        _formatSize: function(bytes) {
            if (!bytes) return '0B';
            var units = ['B', 'KB', 'MB', 'GB'];
            var i = 0;
            while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
            return (i === 0 ? bytes : bytes.toFixed(1)) + units[i];
        }
    };

    // 暴露给Java调用的接口（占位）
    window._addDownloadTask = function(id, name, totalSize) {
        if (window.DownloadManager) window.DownloadManager.addTask(id, name, totalSize);
    };
    window._updateDownloadProgress = function(id, downloaded, total, speed) {
        if (window.DownloadManager) window.DownloadManager.updateProgress(id, downloaded, total, speed);
    };
    window._downloadComplete = function(id, filePath) {
        if (window.DownloadManager) window.DownloadManager.complete(id, filePath);
    };
})();