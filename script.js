const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".nav");

function closeMenu() {
  if (!menuButton || !navigation) return;
  navigation.classList.remove("is-open");
  menuButton.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "メニューを開く");
  document.body.style.overflow = "";
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    menuButton.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) closeMenu();
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }
}

const copyStatus = document.querySelector(".copy-status");
let statusTimer;

function showCopyStatus(message) {
  if (!copyStatus) return;
  window.clearTimeout(statusTimer);
  copyStatus.textContent = message;
  statusTimer = window.setTimeout(() => {
    copyStatus.textContent = "";
  }, 2600);
}

const templateButton = document.querySelector("[data-copy-template]");
const template = document.querySelector("#contact-template");

if (templateButton && template) {
  templateButton.addEventListener("click", async () => {
    await copyText(template.textContent.trim());
    showCopyStatus("相談文をコピーしました。Instagramまたはメールへ貼り付けてください。");
  });
}

const emailButton = document.querySelector("[data-copy-email]");
const emailAddress = "economic.tutoring.office@gmail.com";

if (emailButton) {
  emailButton.addEventListener("click", async () => {
    await copyText(emailAddress);
    showCopyStatus("メールアドレスをコピーしました。");
  });
}

// 専用学習環境の提供開始後に true へ変更すると、79,800円プランが表示されます。
const SHOW_DEDICATED_LEARNING_PLAN = false;
const monthlyPlanGrid = document.querySelector("[data-monthly-plan-grid]");
const premiumPlan = document.querySelector("[data-premium-plan]");
const premiumConsult = document.querySelector("[data-premium-consult]");

if (SHOW_DEDICATED_LEARNING_PLAN && premiumPlan) {
  premiumPlan.hidden = false;
  premiumConsult?.setAttribute("hidden", "");
  monthlyPlanGrid?.classList.add("has-premium");
}
