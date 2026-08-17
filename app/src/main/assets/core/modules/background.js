// ============================================================
// 背景/轮播模块
// ============================================================
(function() {
    'use strict';
    try {
        window.applyBgImage = function(index) {
            if (!window.bgImages || window.bgImages.length === 0) {
                document.body.style.backgroundImage = '';
                return;
            }
            var img = window.bgImages[index % window.bgImages.length];
            document.body.style.backgroundImage = 'url(' + img + ')';
            window.currentBgIndex = index;
            window.saveBgIndex();
            if (typeof window.updateCarouselPreview === 'function') {
                window.updateCarouselPreview();
            }
        };

        window.startCarousel = function() {
            window.stopCarousel();
            if (!window.isCarouselMode || !window.bgImages || window.bgImages.length < 2) return;
            var interval = parseInt(document.getElementById('carouselInterval').value) || 3;
            window.carouselInterval = interval;
            window.saveCarouselInterval();
            window.carouselTimer = setInterval(function() {
                var next = (window.currentBgIndex + 1) % window.bgImages.length;
                window.applyBgImage(next);
            }, window.carouselInterval * 1000);
        };

        window.stopCarousel = function() {
            if (window.carouselTimer) {
                clearInterval(window.carouselTimer);
                window.carouselTimer = null;
            }
        };

        window.updateCarouselPreview = function() {
            var container = document.getElementById('carouselPreview');
            if (!container) return;
            var html = '';
            window.bgImages.forEach(function(img, i) {
                var active = (i === window.currentBgIndex) ? 'active' : '';
                html += '<div class="cs-thumb-wrap">' +
                        '<img src="' + img + '" class="cs-thumb ' + active + '" data-index="' + i + '">' +
                        '<button class="cs-del" data-index="' + i + '">✕</button>' +
                        '</div>';
            });
            container.innerHTML = html;

            container.querySelectorAll('.cs-thumb').forEach(function(el) {
                el.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.index);
                    window.applyBgImage(idx);
                    if (window.isCarouselMode && window.bgImages.length > 1) window.startCarousel();
                });
            });
            container.querySelectorAll('.cs-del').forEach(function(el) {
                el.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var idx = parseInt(this.dataset.index);
                    window.bgImages.splice(idx, 1);
                    window.saveBgImages();
                    if (window.bgImages.length === 0) {
                        document.body.style.backgroundImage = '';
                        window.stopCarousel();
                    } else {
                        if (window.currentBgIndex >= window.bgImages.length) window.currentBgIndex = 0;
                        window.applyBgImage(window.currentBgIndex);
                        if (window.isCarouselMode && window.bgImages.length > 1) window.startCarousel();
                    }
                    window.updateCarouselPreview();
                    window.showToast('已删除');
                });
            });
        };

        window.setupBackgroundPicker = function() {
            var fileInput = document.getElementById('bgFileInput');
            var trigger = document.getElementById('bgPickerTrigger');
            var reset = document.getElementById('resetBg');
            var toggle = document.getElementById('carouselToggle');

            if (!toggle) return;
            toggle.addEventListener('click', function() {
                window.isCarouselMode = !window.isCarouselMode;
                this.classList.toggle('active');
                window.saveCarouselMode();
                var settings = document.getElementById('carouselSettings');
                var label = document.getElementById('pickerLabel');
                if (window.isCarouselMode) {
                    settings.style.display = 'block';
                    if (label) label.textContent = '选择背景图片（多选）';
                    fileInput.setAttribute('multiple', 'multiple');
                    if (window.bgImages.length > 1) window.startCarousel();
                } else {
                    settings.style.display = 'none';
                    if (label) label.textContent = '选择背景图片';
                    fileInput.removeAttribute('multiple');
                    window.stopCarousel();
                    if (window.bgImages.length > 1) {
                        var first = window.bgImages[0];
                        window.bgImages = [first];
                        window.saveBgImages();
                        window.currentBgIndex = 0;
                        window.applyBgImage(0);
                        window.updateCarouselPreview();
                        window.showToast('已切换为单图模式');
                    }
                }
            });

            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                fileInput.click();
            });

            fileInput.addEventListener('change', function(e) {
                var files = e.target.files;
                if (!files || files.length === 0) return;

                if (window.isCarouselMode) {
                    var total = window.bgImages.length + files.length;
                    if (total > 9) {
                        window.showToast('最多选择9张图片');
                        this.value = '';
                        return;
                    }
                    var loaded = 0;
                    for (var i = 0; i < files.length; i++) {
                        (function(file) {
                            var reader = new FileReader();
                            reader.onload = function(ev) {
                                window.bgImages.push(ev.target.result);
                                loaded++;
                                if (loaded === files.length) {
                                    window.saveBgImages();
                                    if (window.bgImages.length === 1) {
                                        window.applyBgImage(0);
                                    } else {
                                        window.startCarousel();
                                    }
                                    window.updateCarouselPreview();
                                    window.showToast('已添加 ' + files.length + ' 张图片');
                                    window.closePanel('settings');
                                }
                            };
                            reader.readAsDataURL(file);
                        })(files[i]);
                    }
                } else {
                    var file = files[0];
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        var dataUrl = ev.target.result;
                        window.bgImages = [dataUrl];
                        window.saveBgImages();
                        window.currentBgIndex = 0;
                        window.applyBgImage(0);
                        window.updateCarouselPreview();
                        window.showToast('背景图片已更新');
                        window.closePanel('settings');
                    };
                    reader.readAsDataURL(file);
                }
                this.value = '';
            });

            reset.addEventListener('click', function() {
                window.bgImages = [];
                window.saveBgImages();
                window.stopCarousel();
                document.body.style.backgroundImage = '';
                window.updateCarouselPreview();
                window.showToast('已恢复默认背景');
                window.closePanel('settings');
            });

            var intervalInput = document.getElementById('carouselInterval');
            if (intervalInput) {
                intervalInput.addEventListener('change', function() {
                    var val = parseInt(this.value) || 3;
                    window.carouselInterval = val;
                    window.saveCarouselInterval();
                    if (window.isCarouselMode && window.bgImages.length > 1) {
                        window.startCarousel();
                    }
                });
            }
        };

        console.log('✅ 背景模块加载成功');
    } catch(e) {
        console.error('❌ 背景模块加载失败:', e);
        window.applyBgImage = function() {};
        window.startCarousel = function() {};
        window.stopCarousel = function() {};
        window.setupBackgroundPicker = function() {};
    }
})();