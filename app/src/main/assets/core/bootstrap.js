// ============================================================
// 启动器 - 加载所有模块，错误隔离
// ============================================================
(function() {
    'use strict';

    var modules = [
        'toast.js',
        'greeting.js',
        'storage.js',
        'engine.js',
        'search.js',
        'windows.js',
        'favorites.js',
        'panels.js',
        'menu.js',
        'background.js',
        'download.js',
        'nightmode.js',
        'topbar.js'
    ];

    var loadedCount = 0;
    var failedModules = [];
    var totalModules = modules.length;

    function loadModule(src) {
        var script = document.createElement('script');
        script.src = 'core/modules/' + src;
        script.onload = function() {
            loadedCount++;
            console.log('✅ 模块加载成功:', src);
            checkAllLoaded();
        };
        script.onerror = function() {
            failedModules.push(src);
            loadedCount++;
            console.warn('⚠️ 模块加载失败:', src);
            checkAllLoaded();
        };
        document.head.appendChild(script);
    }

    function checkAllLoaded() {
        if (loadedCount === totalModules) {
            if (failedModules.length > 0) {
                console.warn('⚠️ 部分模块加载失败:', failedModules.join(', '));
            } else {
                console.log('✅ 所有模块加载完成');
            }
            // 启动应用
            try {
                if (typeof window.startApp === 'function') {
                    window.startApp();
                } else {
                    console.error('❌ startApp 函数未定义');
                }
            } catch(e) {
                console.error('❌ 应用启动失败:', e);
            }
        }
    }

    // 开始加载
    modules.forEach(function(src) {
        loadModule(src);
    });

    // 超时保护（8秒后强制启动）
    setTimeout(function() {
        if (loadedCount < totalModules) {
            console.warn('⏱️ 加载超时，强制启动，已加载:', loadedCount, '/', totalModules);
            if (typeof window.startApp === 'function') {
                window.startApp();
            }
        }
    }, 8000);

})();