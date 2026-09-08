(() => {
  const site = window.ECONOMIC_TUTORING;
  if (!site) return;

  document.documentElement.classList.add("js");
  const yen = (value) => new Intl.NumberFormat("ja-JP").format(value);
  const product = (key) => site.products[key];
  const priceText = (key) => `${yen(product(key).price)}円`;
  const consultationHref = site.consultationForm.url;
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
  document.addEventListener("keydown", (event) => {
    if (!navigation?.classList.contains("is-open")) return;
    if (event.key === "Escape") { closeMenu(); menuButton?.focus(); }
    if (event.key === "Tab") {
      const links = [...navigation.querySelectorAll("a")];
      const first = menuButton;
      const last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  const openAnchorDetails = () => {
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); }
    catch { return; }
    if (target?.tagName === "DETAILS") target.open = true;
    target?.closest("details")?.setAttribute("open", "");
  };
  openAnchorDetails();
  window.addEventListener("hashchange", openAnchorDetails);
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
