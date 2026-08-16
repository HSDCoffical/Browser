// ============================================================
// 问候语模块
// ============================================================
(function() {
    'use strict';

    window.setGreeting = function() {
        var el = document.getElementById('greeting');
        if (!el) return;
        var hour = new Date().getHours();
        var msg = '';
        if (hour >= 5 && hour < 9) msg = '早上好 ☀️';
        else if (hour >= 9 && hour < 12) msg = '上午好 🌤️';
        else if (hour >= 12 && hour < 14) msg = '中午好 ☀️';
        else if (hour >= 14 && hour < 18) msg = '下午好 🌤️';
        else if (hour >= 18 && hour < 21) msg = '傍晚好 🌅';
        else msg = '晚上好 🌙';
        el.textContent = msg;
    };
})();