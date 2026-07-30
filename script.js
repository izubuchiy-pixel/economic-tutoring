const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    menuButton.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("is-open");
      menuButton.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "メニューを開く");
      document.body.style.overflow = "";
    });
  });
}

const copyButton = document.querySelector(".dm-card button");
const message = `economic_tutoringについて相談したいです。

学年：
科目：
困っている内容：
希望時期：`;

async function copyMessage() {
  try {
    await navigator.clipboard.writeText(message);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = message;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }

  if (copyButton) {
    const original = copyButton.textContent;
    copyButton.textContent = "コピーしました";
    window.setTimeout(() => {
      copyButton.textContent = original;
    }, 2400);
  }
}

if (copyButton) {
  copyButton.addEventListener("click", copyMessage);
}
