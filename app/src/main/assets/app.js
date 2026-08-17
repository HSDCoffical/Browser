// ============================================================
// 主入口 - 只负责加载启动器
// ============================================================
(function() {
    'use strict';
    var script = document.createElement('script');
    script.src = 'core/bootstrap.js';
    script.onload = function() {
        console.log('🚀 启动器加载完成');
    };
    script.onerror = function() {
        console.error('❌ 启动器加载失败，请检查 core/bootstrap.js 是否存在');
        // 降级方案：直接显示错误
        document.body.innerHTML = '<div style="text-align:center;padding:50px;color:#e74c3c;">应用启动失败，请检查文件完整性</div>';
    };
    document.head.appendChild(script);
})();