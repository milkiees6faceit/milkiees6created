const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("[data-nav]");
const revealItems = document.querySelectorAll(".reveal");
const orderForm = document.querySelector("#orderForm");

const telegramConfig = {
  botToken: "8670453694:AAF8EdHvYc06ZrmhTri92xk7JmNj-3gwq3o",
  chatId: "6657672762",
};

if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
  observer.observe(item);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.body.classList.remove("nav-open");
    toggle?.setAttribute("aria-expanded", "false");
  }
});

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

if (orderForm) {
  const status = orderForm.querySelector(".form-status");
  const submitButton = orderForm.querySelector('button[type="submit"]');

  orderForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(orderForm);
    const name = String(formData.get("name") || "").trim();
    const username = String(formData.get("username") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const budget = String(formData.get("budget") || "").trim();

    if (!name || !username || !description || !budget) {
      status.textContent = "Заполни все поля формы.";
      status.className = "form-status error";
      return;
    }

    if (
      telegramConfig.botToken.includes("PASTE_") ||
      telegramConfig.chatId.includes("PASTE_")
    ) {
      status.textContent = "Добавь botToken и chatId в script.js, чтобы заявки уходили в Telegram.";
      status.className = "form-status error";
      return;
    }

    const message = [
      "<b>Новая заявка milkiees6created</b>",
      "",
      `<b>Имя:</b> ${escapeHtml(name)}`,
      `<b>Username:</b> ${escapeHtml(username)}`,
      `<b>Бюджет:</b> ${escapeHtml(budget)}`,
      "",
      `<b>Описание:</b>\n${escapeHtml(description)}`,
    ].join("\n");

    submitButton.disabled = true;
    submitButton.textContent = "Отправляем...";
    status.textContent = "";
    status.className = "form-status";

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: telegramConfig.chatId,
            text: message,
            parse_mode: "HTML",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Telegram request failed");
      }

      orderForm.reset();
      status.textContent = "Заявка отправлена.Ждите ответа от @procentmd1 в Telegram!";
      status.className = "form-status success";
    } catch (error) {
      status.textContent = "Не получилось отправить заявку. Проверь botToken, chatId и интернет.";
      status.className = "form-status error";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Отправить заявку";
    }
  });
}
