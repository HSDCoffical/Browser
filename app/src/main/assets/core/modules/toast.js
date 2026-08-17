// ============================================================
// Toast通知模块
// ============================================================
(function() {
    'use strict';
    try {
        window.showToast = function(msg) {
            var el = document.getElementById('toast');
            if (!el) return;
            el.textContent = msg;
            el.classList.add('show');
            clearTimeout(window.toastTimer);
            window.toastTimer = setTimeout(function() {
                el.classList.remove('show');
            }, 1800);
        };
        console.log('✅ Toast模块加载成功');
    } catch(e) {
        console.error('❌ Toast模块加载失败:', e);
        window.showToast = function() {};
    }
})();