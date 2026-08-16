// ============================================================
// 引擎管理模块（切换后立即生效，保存并刷新下拉）
// ============================================================
(function() {
    'use strict';

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

        // 绑定引擎切换事件
        container.querySelectorAll('.ed-item[data-engine]').forEach(function(el) {
            el.addEventListener('click', function() {
                var eng = JSON.parse(this.dataset.engine);
                // 更新当前引擎
                window.currentEngine = eng;
                window.saveCurrentEngine(); // 立即保存到 localStorage
                // 更新按钮文字
                window.updateEngineBtn();
                // 重新渲染下拉列表（使勾选标记立即更新）
                window.renderEngineDropdown();
                // 关闭下拉（可选）
                window.closeEngineDropdown();
                window.showToast('已切换到：' + eng.name);
            });
        });

        // 绑定自定义引擎添加按钮
        var addBtn = document.getElementById('addCustomEngineBtn');
        if (addBtn) {
            addBtn.addEventListener('click', function(e) {
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
        }
    };

    window.toggleEngineDropdown = function() {
        var dd = document.getElementById('engineDropdown');
        if (!dd) return;
        // 如果已打开，则关闭；否则打开并渲染
        if (dd.classList.contains('open')) {
            dd.classList.remove('open');
        } else {
            dd.classList.add('open');
            window.renderEngineDropdown();
        }
    };

    window.closeEngineDropdown = function() {
        var dd = document.getElementById('engineDropdown');
        if (dd) dd.classList.remove('open');
    };

    window.updateEngineBtn = function() {
        var btn = document.getElementById('engineBtn');
        if (btn) {
            btn.textContent = window.currentEngine.name + ' ›';
        }
    };
})();