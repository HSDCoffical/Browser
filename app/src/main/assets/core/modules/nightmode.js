// ============================================================
// 夜间模式模块
// ============================================================
(function() {
    'use strict';
    try {
        window.toggleNightMode = function() {
            document.body.classList.toggle('night-mode');
            var toggle = document.getElementById('nightModeToggleMenu');
            if (toggle) {
                toggle.classList.toggle('active');
            }
            window.saveNightMode();
            window.showToast(document.body.classList.contains('night-mode') ? '夜间模式已开启' : '夜间模式已关闭');
        };

        console.log('✅ 夜间模式模块加载成功');
    } catch(e) {
        console.error('❌ 夜间模式模块加载失败:', e);
        window.toggleNightMode = function() {};
    }
})();