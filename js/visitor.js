
const VISITOR_FUNCTION =
  "https://acuwzmknybtkxnbhhfjb.supabase.co/functions/v1/visitor-manager";

const SUPABASE_PUBLIC_KEY =
  "sb_publishable_7a22MkwS4JphaaZVoMnxYQ_bMe4gy7P";

document.addEventListener("DOMContentLoaded", () => {
  const deviceIdKey = "demo_visitor_device";

  let deviceId = localStorage.getItem(deviceIdKey);

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(deviceIdKey, deviceId);
  }

  document.getElementById("visitorLogin")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const code = document.getElementById("visitorCode").value.trim();
    const message = document.getElementById("visitorMessage");
    const button = event.currentTarget.querySelector("button");

    if (code.length < 2 || code.length > 60) {
      message.textContent = "Identyfikator musi mieć od 2 do 60 znaków.";
      return;
    }

    button.disabled = true;
    message.textContent = "Sprawdzanie dostępu...";

    try {
      const response = await fetch(VISITOR_FUNCTION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_PUBLIC_KEY,
          "Authorization": `Bearer ${SUPABASE_PUBLIC_KEY}`
        },
        body: JSON.stringify({
          action: "register",
          visitorCode: code,
          deviceId
        })
      });

      const result = await response.json();

      if (!response.ok || !result.allowed) {
        message.textContent = "Dostęp został zablokowany.";
        button.disabled = false;
        return;
      }

      message.textContent = "Identyfikator zapisany. Dostęp przyznany.";
    } catch {
      message.textContent = "Nie udało się połączyć z serwerem skontaktuj się z administratorem strony w celu dodatkowej weryfikacji w systemie.";
      button.disabled = false;
    }
  });
});
