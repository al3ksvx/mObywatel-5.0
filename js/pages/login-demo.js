// Rejestracja.
// W razie problemów krytycznych skontaktuj się z administratorem. (a jak nie masz internetu to nie zawracaj mi dupy)

const VISITOR_FUNCTION =
  "https://acuwzmknybtkxnbhhfjb.supabase.co/functions/v1/visitor-manager";

const SUPABASE_PUBLIC_KEY =
  "sb_publishable_7a22MkwS4JphaaZVoMnxYQ_bMe4gy7P";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const input = document.getElementById("passwordInput");
  const message = document.getElementById("passwordError");
  const submit = document.getElementById("submitPasswordBtn");

  if (!form || !input || !message || !submit) return;

  let deviceId = localStorage.getItem("demo_visitor_device");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("demo_visitor_device", deviceId);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const visitorCode = input.value.trim();

    if (visitorCode.length < 2 || visitorCode.length > 60) {
      message.textContent =
        "Hasło musi mieć od 2 do 60 znaków.";
      message.style.display = "block";
      return;
    }

    submit.disabled = true;
    message.textContent = "Rejestrowanie dostępu...";
    message.style.display = "block";

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
          visitorCode,
          deviceId
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.allowed) {
        message.textContent =
          response.status === 403
            ? "Twój dostęp został zablokowany przez system. Skontaktuj się z administratorem."
            : "Pzyznanie dostępu nie powiodło się.";
        submit.disabled = false;
        return;
      }

      message.textContent =
        "Dostęp został zapisany w bazie.";

    } catch (error) {
      message.textContent =
        "Nie udało się połączyć z serwerem. Skontaktuj się z administratorem.";
    }

    submit.disabled = false;
  });
});