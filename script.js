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
    ["pricing", "料金・サービス", "/pricing"],
    ["subjects", "対応科目", "/subjects"],
    ["web", "学習環境", "/web-learning"],
    ["guides", "学習ガイド", "/guides/"]
  ];
  const consultationHref = site.consultationForm.url;
  const primaryContactHref = isInstagramPage ? site.instagram.url : consultationHref;
  const primaryContactLabel = isInstagramPage ? "Instagramで相談" : site.cta.short;

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
          <a class="nav-cta" href="${primaryContactHref}" target="_blank" rel="noopener">${primaryContactLabel}</a>
        </nav>
      </div>
    </header>`;

  const footer = `
    <footer class="site-footer">
      <div class="shell footer-grid">
        <div class="footer-brand"><strong>${site.brand}</strong><p>大学生向け 経済学系専門科目のオンライン個別指導・学習確認</p></div>
        <nav class="footer-nav" aria-label="サイト案内">
          <a href="/">ホーム</a><a href="/economics-tutor">経済学塾・オンライン家庭教師</a><a href="/subjects">対応科目</a><a href="/pricing">料金・サービス</a><a href="/web-learning">学習環境</a><a href="/guides/">学習ガイド</a>
          <a href="/terms">利用案内・受講規約</a><a href="/privacy">プライバシーポリシー</a><a href="/tokusho">特定商取引法に基づく表記</a>
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

  const consultationIntro = `
        <div class="inquiry-intro">
          <p class="section-label">相談の入口</p>
          <h2>プランは未定でも、<br>相談できます。</h2>
          <p>「どこが分からないか」を、きれいに説明できなくても大丈夫。科目と、いま止まっているところを分かる範囲でお知らせください。</p>
          <div class="inquiry-trial">
            <p class="inquiry-trial-label">内容・日程・条件を確認してから</p>
            <h3>初回相談・体験</h3>
            <p class="inquiry-trial-price">60分 <strong data-price="trial">3,000円</strong><span>（税込）</span></p>
            <ul><li>現在の授業と、止まっている地点を確認</li><li>実際の問題を使って、説明と練習</li><li>次に取り組む内容と、進め方を整理</li></ul>
            <p class="inquiry-trial-note">継続契約は必須ではありません。資料の共有方法は必要に応じて返信後にご案内します。</p>
          </div>
        </div>`;

  const inquirySteps = `
          <ol class="inquiry-steps" aria-label="問い合わせから初回相談・体験まで">
            <li><span>01</span><div><strong>状況を送る</strong><p>科目・時期・困りごと。プランは未定でも構いません。</p></div></li>
            <li><span>02</span><div><strong>対応可否と日程を確認</strong><p>内容を確認して返信し、必要な支援と条件をご案内します。</p></div></li>
            <li><span>03</span><div><strong>合意後に、初回相談・体験</strong><p>60分3,000円（税込）。送信だけで契約・支払いは確定しません。</p></div></li>
          </ol>`;

  const instagramContact = `
    <section class="section contact inquiry-contact" id="contact">
      <div class="shell contact-grid">
        ${consultationIntro}
        <div class="contact-card">
          <p class="contact-kicker">INSTAGRAM</p>
          <h3>まずは、科目と困りごとをDMで。</h3>
          <p>大学・学年や試験時期も、分かる範囲で添えてください。</p>
          <div class="inquiry-example"><span>相談文の例</span><p>ミクロ経済学の予算制約が分かりません。式は書けるのですが、グラフから解き方を選ぶところで止まります。</p></div>
          <details class="inquiry-template-details"><summary>書き始めに迷ったら、ひな形を使う</summary><div class="contact-template" id="contact-template">相談したい科目：
いま困っていること：
大学・学年（分かる範囲で）：
試験などの時期（未定でも可）：</div><button class="button button-outline" type="button" data-copy-template>ひな形をコピー</button></details>
          <p class="copy-status" aria-live="polite"></p>
          <a class="button button-gold" href="${site.instagram.url}" target="_blank" rel="noopener">Instagramのプロフィールへ</a>
          <p class="inquiry-button-help">プロフィールの「メッセージ」から送信してください。</p>
          ${inquirySteps}
          <div class="instagram-form-option">
            <p><strong>DM以外をご希望の方は、フォームでも。</strong><span>項目に沿って相談内容を送れます。資料の添付は不要です。</span></p>
            <a class="button button-navy contact-form-button" href="${site.consultationForm.url}" target="_blank" rel="noopener">${site.consultationForm.label}</a>
            <p class="contact-assurance">講義資料や答案の添付は不要です。送信だけで契約・支払いは確定しません。</p>
          </div>
          <div class="email-row"><a href="mailto:${site.email}?subject=${inquirySubject}&body=${inquiryBody}">${site.email}</a><button type="button" data-copy-email>コピー</button></div>
        </div>
      </div>
    </section>`;

  const officialContact = `
    <section class="section contact inquiry-contact" id="contact">
      <div class="shell contact-grid">
        ${consultationIntro}
        <div class="contact-card contact-card-form">
          <p class="contact-kicker">CONSULTATION FORM</p>
          <h3>フォームで、今の状況を送る。</h3>
          <p>大学・学年、科目、希望時期、困りごとなどを入力します。講義資料や答案の添付は不要です。</p>
          <div class="inquiry-example"><span>困りごとの書き方の例</span><p>統計学の検定で、どの公式を使うのか判断できません。授業の演習を一人で進められるようになりたいです。</p></div>
          <a class="button button-navy contact-form-button" href="${site.consultationForm.url}" target="_blank" rel="noopener">${site.consultationForm.label}</a>
          <p class="contact-assurance">フォーム送信だけで契約・支払いは確定しません。</p>
          ${inquirySteps}
          <p class="inquiry-button-help">フォームでいただいた内容を確認し、事業用メールからご連絡します。</p>
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

  document.querySelectorAll("[data-direct-consultation], [data-consultation-link]").forEach((link) => {
    link.href = consultationHref;
    link.target = "_blank";
    link.rel = "noopener";
  });

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
    return `<article class="plan-card${key === "support8" || key === "quizService" ? " plan-card-focus" : ""}">
      <p class="plan-label">${item.label}</p><h3>${item.name}</h3>
      <div class="plan-price"><strong>${yen(item.price)}</strong><span>円<br>${item.unit}</span></div>
      ${item.priceNote ? `<p class="plan-price-note">${item.priceNote}</p>` : ""}
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

  const detailRow = (key) => {
    const item = product(key);
    const price = `${yen(item.price)}円`;
    return `<details class="hub-plan-detail">
      <summary><span><small>${item.label}</small><strong>${item.name}</strong></span><b>${price}<em>${item.unit}</em></b></summary>
      <div class="hub-plan-detail-body">
        <p>${item.summary}</p>
        ${item.priceNote ? `<p class="hub-plan-price-note">${item.priceNote}</p>` : ""}
        ${item.lessons || item.subjects ? `<div class="hub-details-meta">${item.lessons ? `<b>${item.lessons}</b>` : ""}${item.subjects ? `<b>${item.subjects}</b>` : ""}</div>` : ""}
        <div class="hub-plan-columns"><div><h4>含まれる内容</h4>${list(item.includes)}</div>${item.excludes?.length ? `<div><h4>確認事項</h4>${list(item.excludes)}</div>` : ""}</div>
        <a class="text-link" href="#contact">このプランを相談する →</a>
      </div>
    </details>`;
  };

  document.querySelectorAll("[data-plan-details]").forEach((el) => {
    const keys = (el.dataset.planDetails || "").split(",").map((value) => value.trim()).filter(Boolean);
    el.innerHTML = keys.map((key) => detailRow(key)).join("");
  });

  document.querySelectorAll("[data-web-plan-cards]").forEach((el) => {
    el.innerHTML = ["testAddon"].map((key) => card(key, true)).join("");
  });

  const legalPrices = document.querySelector("[data-legal-prices]");
  if (legalPrices) {
    legalPrices.innerHTML = Object.values(site.products).map((item) => `<div><strong>${item.name}</strong><span>${item.legalPrice || `${yen(item.price)}円（${item.unit}）`}</span></div>`).join("");
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
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const area = document.createElement("textarea");
      area.value = text; area.readOnly = true; area.style.position = "fixed"; area.style.opacity = "0";
      document.body.append(area); area.select();
      try { return document.execCommand("copy"); }
      catch { return false; }
      finally { area.remove(); }
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
    const copied = await copyText(document.querySelector("#contact-template")?.textContent.trim() || "");
    showStatus(copied ? "相談文をコピーしました。必要なところを書き足して送れます。" : "コピーできませんでした。上のひな形を選択してコピーしてください。");
  });
  document.querySelector("[data-copy-email]")?.addEventListener("click", async () => {
    const copied = await copyText(site.email);
    showStatus(copied ? "メールアドレスをコピーしました。" : "コピーできませんでした。メールアドレスを選択してコピーしてください。");
  });

  const mobileCta = document.querySelector(".hub-mobile-cta");
  const contactSection = document.querySelector("#contact");
  if (mobileCta && contactSection) {
    let contactFrame;
    const updateMobileCta = () => {
      const bounds = contactSection.getBoundingClientRect();
      mobileCta.classList.toggle("is-contact-visible", bounds.top < window.innerHeight && bounds.bottom > 0);
      contactFrame = undefined;
    };
    updateMobileCta();
    window.addEventListener("scroll", () => {
      if (contactFrame) return;
      contactFrame = requestAnimationFrame(updateMobileCta);
    }, { passive: true });
    window.addEventListener("resize", updateMobileCta);
  }

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    try {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      document.documentElement.classList.add("reveal-ready");
      revealElements.forEach((el) => observer.observe(el));
    } catch {
      document.documentElement.classList.remove("reveal-ready");
      revealElements.forEach((el) => el.classList.add("is-visible"));
    }
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }
})();
