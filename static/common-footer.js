(() => {
  const footer = document.createElement("footer");
  footer.className = "site-footer-common";
  footer.innerHTML = `
    <div class="site-footer-inner">
      <div class="site-footer-main">
        <div class="site-footer-brand">
          <a href="top-index.html">Re:Tailor</a>
          <p>誰かの手から、誰かの手へ。</p>
          <p class="site-footer-tagline">Secondhand clothing &amp; handmade goods.</p>
        </div>
        <nav class="site-footer-nav" aria-label="フッターメニュー">
          <div class="site-footer-group">
            <h2>SHOP</h2>
            <a href="new-arrivals.html">新着商品</a>
            <a href="my-closet.html">マイクローゼット</a>
            <a href="syuppin_itiran.html">商品を出品</a>
          </div>
          <div class="site-footer-group">
            <h2>SUPPORT</h2>
            <a href="help.html">ヘルプ・よくある質問</a>
            <a href="contact.html">お問い合わせ</a>
            <a href="about-index.html">Re:Tailorについて</a>
          </div>
        </nav>
      </div>
      <div class="site-footer-bottom">
        <div class="site-footer-legal" aria-label="ポリシー">
          <a href="terms.html">利用規約</a>
          <span class="site-footer-separator" aria-hidden="true">|</span>
          <a href="privacy-policy.html">プライバシーポリシー</a>
        </div>
        <small>© ${new Date().getFullYear()} Re:Tailor</small>
      </div>
    </div>`;
  document.body.append(footer);

    const alignFooterToViewport = () => {
      footer.style.width = `${document.documentElement.clientWidth}px`;
      footer.style.marginLeft = `${-document.body.getBoundingClientRect().left}px`;
    };

    alignFooterToViewport();
    window.addEventListener("resize", alignFooterToViewport);
})();