/* ========================================
   Re:Tailor - 落ちるもみじ（メープルリーフ）アニメーション
   ・<main> の中だけに表示 → フッターの手前で自然に消える
   ・背景のレイヤーなので、商品カードなどの後ろを通る（クリックの邪魔をしない）
   ・OSで「視差効果を減らす」設定の人には表示しない
   ・CSSもこのファイルの中から自動で追加される（HTMLは <script> を1行足すだけ）
======================================== */

(function () {
    'use strict';

    var main = document.querySelector('main');
    if (!main) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* ---------- 設定（ここを変えると見た目を調整できる） ---------- */
    var COLORS = ['#B87961', '#9A5D46', '#C98B4A', '#A8553A', '#CFA06A']; // サイトの茶・テラコッタ系
    var COUNT_PC = 16;       // パソコンでの葉の数
    var COUNT_SP = 8;        // スマホでの葉の数
    var SIZE_MIN = 18;       // 葉の大きさ（px）
    var SIZE_MAX = 34;
    var SPEED_MIN = 35;      // 落ちる速さ（px/秒）
    var SPEED_MAX = 65;
    var OPACITY = 0.8;       // 葉の濃さ（0〜1）

    /* もみじの形（24x24 の中に描いた5つに分かれた葉） */
    var LEAF_PATH =
        'M12 2L14 6L16.5 5L15.5 10L20 8.5L19 12.5L22 14L16.5 16.5L17 19L13 18' +
        'L12.8 22L11.2 22L11 18L7 19L7.5 16.5L2 14L5 12.5L4 8.5L8.5 10L7.5 5L10 6Z';

    /* ---------- CSS を追加 ---------- */
    var css =
        'main.has-leaves{position:relative;isolation:isolate}' +
        '.leaf-layer{position:absolute;inset:0;z-index:-1;overflow:hidden;' +
        'pointer-events:none;container-type:size}' +
        '.leaf{position:absolute;top:0;width:var(--size);height:var(--size);opacity:0;' +
        'will-change:transform,opacity;' +
        'animation:leafFall var(--dur) linear var(--delay) infinite}' +
        '.leaf>i{display:block;width:100%;height:100%;' +
        'background:var(--img) center/contain no-repeat;' +
        'animation:leafSway var(--sway) ease-in-out var(--sway-delay) infinite alternate}' +
        '@keyframes leafFall{' +
        '0%{transform:translate3d(0,-60px,0);opacity:0}' +
        '8%{opacity:' + OPACITY + '}' +
        '85%{opacity:' + OPACITY + '}' +
        '100%{transform:translate3d(0,100cqh,0);opacity:0}}' +
        '@keyframes leafSway{' +
        'from{transform:translateX(-26px) rotate(-35deg)}' +
        'to{transform:translateX(26px) rotate(35deg)}}';

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    /* ---------- 葉を作る ---------- */
    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    function leafImage(color) {
        var svg =
            "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>" +
            "<path d='" + LEAF_PATH + "' fill='" + color + "'/>" +
            "<path d='M12 22V11' stroke='rgba(255,255,255,0.35)' stroke-width='0.8' " +
            "stroke-linecap='round' fill='none'/></svg>";
        return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    }

    var layer = document.createElement('div');
    layer.className = 'leaf-layer';
    layer.setAttribute('aria-hidden', 'true');
    main.classList.add('has-leaves');
    main.insertBefore(layer, main.firstChild);

    var lastWidth = 0;
    var lastHeight = 0;

    function build() {
        layer.textContent = '';

        var height = main.offsetHeight;
        var count = window.innerWidth < 700 ? COUNT_SP : COUNT_PC;

        for (var i = 0; i < count; i++) {
            var speed = rand(SPEED_MIN, SPEED_MAX);
            var dur = height / speed;                    // 長いページでも同じ速さで落ちる

            var leaf = document.createElement('span');
            leaf.className = 'leaf';
            leaf.style.left = rand(0, 96) + '%';
            leaf.style.setProperty('--size', rand(SIZE_MIN, SIZE_MAX) + 'px');
            leaf.style.setProperty('--dur', dur.toFixed(1) + 's');
            leaf.style.setProperty('--delay', (-rand(0, dur)).toFixed(1) + 's'); // 最初から画面中に散らばる
            leaf.style.setProperty('--sway', rand(2.5, 4.5).toFixed(1) + 's');
            leaf.style.setProperty('--sway-delay', (-rand(0, 4)).toFixed(1) + 's');
            leaf.style.setProperty('--img', leafImage(COLORS[Math.floor(Math.random() * COLORS.length)]));

            var inner = document.createElement('i');
            leaf.appendChild(inner);
            layer.appendChild(leaf);
        }

        lastWidth = main.offsetWidth;
        lastHeight = height;
    }

    build();

    /* 商品カードが後から表示されて高さが変わったとき・画面幅が変わったときだけ作り直す */
    var timer = null;

    function onResize() {
        var widthChanged = Math.abs(main.offsetWidth - lastWidth) > 40;
        var heightChanged = Math.abs(main.offsetHeight - lastHeight) > 150;
        if (!widthChanged && !heightChanged) return;
        clearTimeout(timer);
        timer = setTimeout(build, 300);
    }

    if ('ResizeObserver' in window) {
        new ResizeObserver(onResize).observe(main);
    } else {
        window.addEventListener('resize', onResize);
    }
})();