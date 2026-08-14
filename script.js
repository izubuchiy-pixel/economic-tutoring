document.documentElement.classList.add("js");

(() => {
  const site = window.ECONOMIC_TUTORING;
  if (!site) return;

  const yen = (value) => new Intl.NumberFormat("ja-JP").format(value);
  const product = (key) => site.products[key];
  const priceText = (key) => `${yen(product(key).price)}円`;

  const page = document.body.dataset.page || "top";
  const isInstagramPage = page === "instagram";
  const navItems = [
    ["top", "ホーム", "/"],
    ["subjects", "対応科目", "/subjects.html"],
    ["pricing", "料金・サービス", "/pricing.html"],
    ["web", "伴走の仕組み", "/web-learning.html"]
  ];
  const contactHref = page === "top" || isInstagramPage ? "#contact" : "/#contact";

  const header = `
    <a class="skip-link" href="#main">本文へ移動</a>
    <header class="site-header">
      <div class="shell header-inner">
        <a class="brand" href="/" aria-label="economic_tutoring ホームへ">
          <span class="brand-name">${site.brand}</span>
          <span class="brand-sub">UNIVERSITY SUBJECT SUPPORT</span>
        </a>
        <button class="menu-button" type="button" aria-label="メニューを開く" aria-expanded="false" aria-controls="global-nav"><span></span><span></span><span></span></button>
        <nav class="nav" id="global-nav" aria-label="メインナビゲーション">
          ${navItems.map(([id, label, href]) => `<a href="${href}"${page === id ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          <a class="nav-cta" href="${contactHref}">${site.cta.short}</a>
        </nav>
      </div>
    </header>`;

  const footer = `
    <footer class="site-footer">
      <div class="shell footer-grid">
        <div class="footer-brand"><strong>${site.brand}</strong><p>大学生向け 経済学系専門科目のオンライン個別指導・学習管理</p></div>
        <nav class="footer-nav" aria-label="サイト案内">
          <a href="/">ホーム</a><a href="/subjects.html">対応科目</a><a href="/pricing.html">料金・サービス</a><a href="/web-learning.html">伴走の仕組み</a>
          <a href="/terms.html">利用案内・受講規約</a><a href="/privacy.html">プライバシーポリシー</a><a href="/tokusho.html">特定商取引法に基づく表記</a>
        </nav>
        <small>© 2026 ${site.brand}</small>
      </div>
    </footer>`;

  const inquirySource = isInstagramPage ? "Instagram LP" : "公式サイト";
  const inquirySubject = encodeURIComponent("【サイト相談】初回相談・体験");
  const inquiryBody = encodeURIComponent(`大学名・学部：
相談したい科目：
試験・課題の時期：
現在困っていること：
相談経路：${inquirySource}`);

  const instagramContact = `
    <section class="section contact" id="contact">
      <div class="shell contact-grid">
        <div>
          <p class="section-label">CONTACT</p>
          <h2>まずは60分で、<br>現在地と次の一手を整理。</h2>
          <p>シラバス・講義資料・試験範囲など、手元にある資料を確認しながら進めます。相談時点で継続受講を決める必要はありません。</p>
          <div class="contact-facts"><span>オンライン</span><span>60分</span><span data-price="trial"></span></div>
        </div>
        <div class="contact-card">
          <h3>Instagram DMで相談</h3>
          <p>次の内容が分かる範囲でお知らせください。</p>
          <div class="contact-template" id="contact-template">大学名・学部：
相談したい科目：
試験・課題の時期：
現在困っていること：
相談経路：${inquirySource}</div>
          <button class="button button-navy" type="button" data-copy-template>相談文をコピー</button>
          <a class="button button-gold" href="${site.instagram.url}" target="_blank" rel="noopener">Instagram DMを開く</a>
          <div class="email-row"><a href="mailto:${site.email}?subject=${inquirySubject}&body=${inquiryBody}">${site.email}</a><button type="button" data-copy-email>コピー</button></div>
          <p class="copy-status" aria-live="polite"></p>
        </div>
      </div>
    </section>`;

  const officialContact = `
    <section class="section contact" id="contact">
      <div class="shell contact-grid">
        <div>
          <p class="section-label">CONTACT</p>
          <h2>まずは60分で、<br>現在地と次の一手を整理。</h2>
          <p>大学・学年、科目、試験時期、困っていることを分かる範囲で入力してください。相談時点で継続受講を決める必要はありません。</p>
          <div class="contact-facts"><span>全国オンライン</span><span>60分</span><span data-price="trial"></span></div>
        </div>
        <div class="contact-card contact-card-form">
          <p class="contact-kicker">OFFICIAL APPLICATION</p>
          <h3>相談フォームから申し込む</h3>
          <p>入力は2〜3分程度です。講義資料や答案の添付は求めません。</p>
          <ul class="contact-form-points">
            <li><span>01</span><div><strong>状況を入力</strong><small>大学・学年、科目、期限、困りごと</small></div></li>
            <li><span>02</span><div><strong>内容を確認</strong><small>対応可否を確認し、事業用メールから連絡</small></div></li>
            <li><span>03</span><div><strong>日程を調整</strong><small>双方で確認してから初回相談・体験を確定</small></div></li>
          </ul>
          <a class="button button-navy contact-form-button" href="${site.consultationForm.url}" target="_blank" rel="noopener">${site.consultationForm.label}</a>
          <p class="contact-assurance">フォーム送信だけで契約・支払いは確定しません。</p>
          <div class="contact-alternatives">
            <p>入力前に短く相談したい方は</p>
            <a href="${site.instagram.url}" target="_blank" rel="noopener">Instagram DM</a>
            <span>または</span>
            <a href="mailto:${site.email}?subject=${inquirySubject}&body=${inquiryBody}">メール</a>
          </div>
        </div>
      </div>
    </section>`;

  const contact = isInstagramPage ? instagramContact : officialContact;

  document.querySelectorAll("[data-site-header]").forEach((el) => { el.outerHTML = header; });
  document.querySelectorAll("[data-site-footer]").forEach((el) => { el.outerHTML = footer; });
  document.querySelectorAll("[data-site-contact]").forEach((el) => { el.outerHTML = contact; });

  document.querySelectorAll("[data-price]").forEach((el) => {
    const item = product(el.dataset.price);
    if (item) el.textContent = priceText(el.dataset.price);
  });

  document.querySelectorAll("[data-product-name]").forEach((el) => {
    const item = product(el.dataset.productName);
    if (item) el.textContent = item.name;
  });

  const list = (items) => `<ul class="check-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  const exclusions = (items) => items?.length ? `<div class="not-included"><strong>確認事項</strong>${items.map((item) => `<p>${item}</p>`).join("")}</div>` : "";
  const card = (key, compact = false) => {
    const item = product(key);
    return `<article class="plan-card${key === "support8" ? " plan-card-focus" : ""}">
      <p class="plan-label">${item.label}</p><h3>${item.name}</h3>
      <div class="plan-price"><strong>${yen(item.price)}</strong><span>円<br>${item.unit}</span></div>
      <p class="plan-summary">${item.summary}</p>
      ${item.lessons || item.subjects ? `<div class="plan-facts">${item.lessons ? `<span>${item.lessons}</span>` : ""}${item.subjects ? `<span>${item.subjects}</span>` : ""}</div>` : ""}
      ${compact ? "" : `<details class="plan-details"><summary>含まれる内容を見る</summary>${list(item.includes)}${exclusions(item.excludes)}</details>`}
      <a class="text-link" href="#contact">このプランを相談する →</a>
    </article>`;
  };

  document.querySelectorAll("[data-plan-cards]").forEach((el) => {
    const keys = (el.dataset.planCards || "").split(",").map((v) => v.trim()).filter(Boolean);
    el.innerHTML = keys.map((key) => card(key)).join("");
  });

  document.querySelectorAll("[data-web-plan-cards]").forEach((el) => {
    el.innerHTML = ["testAddon"].map((key) => card(key, true)).join("");
  });

  const legalPrices = document.querySelector("[data-legal-prices]");
  if (legalPrices) {
    legalPrices.innerHTML = Object.values(site.products).map((item) => `<div><strong>${item.name}</strong><span>${yen(item.price)}円（${item.unit}）</span></div>`).join("");
  }

  const menuButton = document.querySelector(".menu-button");
  const navigation = document.querySelector(".nav");
  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    navigation.classList.remove("is-open");
    menuButton.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "メニューを開く");
    document.body.classList.remove("menu-open");
  };
  menuButton?.addEventListener("click", () => {
    const open = !navigation.classList.contains("is-open");
    closeMenu();
    if (open) {
      navigation.classList.add("is-open");
      menuButton.classList.add("is-open");
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "メニューを閉じる");
      document.body.classList.add("menu-open");
    }
  });
  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => { if (window.innerWidth > 900) closeMenu(); });

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const area = document.createElement("textarea");
      area.value = text; area.readOnly = true; area.style.position = "fixed"; area.style.opacity = "0";
      document.body.append(area); area.select(); document.execCommand("copy"); area.remove();
    }
  }
  let timer;
  const status = document.querySelector(".copy-status");
  const showStatus = (message) => {
    if (!status) return;
    clearTimeout(timer); status.textContent = message;
    timer = setTimeout(() => { status.textContent = ""; }, 2600);
  };
  document.querySelector("[data-copy-template]")?.addEventListener("click", async () => {
    await copyText(document.querySelector("#contact-template")?.textContent.trim() || "");
    showStatus("相談文をコピーしました。");
  });
  document.querySelector("[data-copy-email]")?.addEventListener("click", async () => {
    await copyText(site.email); showStatus("メールアドレスをコピーしました。");
  });

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }
})();
