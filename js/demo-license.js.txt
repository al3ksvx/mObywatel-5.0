
const SUPABASE_FUNCTION_URL =
  "https://acuwzmknybtkxnbhhfjb.supabase.co/functions/v1/license-manager";

const SUPABASE_ANON_KEY =
  "sb_publishable_7a22MkwS4JphaaZVoMnxYQ_bMe4gy7P";

document.addEventListener("DOMContentLoaded", () => {
  const deviceIdKey = "demo_device_id";
  let deviceId = localStorage.getItem(deviceIdKey);

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(deviceIdKey, deviceId);
  }

  let pin = null;
  let licenseActivated = false;

  function showScreen(content) {
    document.body.innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;
        background:#b42318;color:white;text-align:center;
        padding:12px;box-sizing:border-box;font-weight:bold;
        z-index:99999">
        DEMO — NIEOFICJALNA APLIKACJA
      </div>
      <main style="min-height:100vh;box-sizing:border-box;
        padding:90px 20px 30px;display:flex;flex-direction:column;
        align-items:center;justify-content:center;background:#121212;
        color:white;font-family:Arial;text-align:center">
        ${content}
      </main>`;
  }

  function showLicense() {
    showScreen(`
      <h1>Aktywacja licencji</h1>
      <p>Wpisz klucz demonstracyjny.</p>
      <input id="licenseKey" placeholder="Klucz licencyjny"
        autocomplete="off"
        style="padding:14px;width:100%;max-width:300px;
        box-sizing:border-box;border-radius:8px;border:0">
      <button id="activate" style="margin-top:15px;padding:14px 25px">
        Aktywuj
      </button>
      <p id="message" role="status"></p>
    `);

    document.getElementById("activate").onclick = async () => {
      const key = document.getElementById("licenseKey").value.trim();
      const message = document.getElementById("message");
      const button = document.getElementById("activate");

      if (!key) {
        message.textContent = "Wpisz klucz licencyjny.";
        return;
      }

      button.disabled = true;
      message.textContent = "Sprawdzanie licencji...";

      try {
        const response = await fetch(SUPABASE_FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ key, deviceId })
        });

        const result = await response.json();

        if (!response.ok || !result.valid) {
          message.textContent = "Licencja jest nieprawidłowa lub przypisana.";
          button.disabled = false;
          return;
        }

        licenseActivated = true;
        showPinSetup();
      } catch {
        message.textContent = "Błąd połączenia z serwerem.";
        button.disabled = false;
      }
    };
  }

  function showPinSetup() {
    showScreen(`
      <h1>Utwórz lokalny PIN</h1>
      <p>Ustal własny PIN do tej demonstracji.</p>
      <input id="newPin" type="password" inputmode="numeric"
        maxlength="6" placeholder="Nowy PIN"
        style="padding:14px;width:220px">
      <button id="savePin" style="margin-top:15px;padding:14px">
        Zapisz PIN
      </button>
      <p id="pinMessage"></p>
    `);

    document.getElementById("savePin").onclick = () => {
      const value = document.getElementById("newPin").value;
      const message = document.getElementById("pinMessage");

      if (!/^[0-9]{4,6}$/.test(value)) {
        message.textContent = "PIN musi mieć od 4 do 6 cyfr.";
        return;
      }

      pin = value;
      showPinLogin();
    };
  }

  function showPinLogin() {
    showScreen(`
      <h1>Wpisz PIN</h1>
      <p>PIN jest sprawdzany lokalnie w tej karcie.</p>
      <input id="pinInput" type="password" inputmode="numeric"
        maxlength="6" placeholder="PIN"
        style="padding:14px;width:220px">
      <button id="checkPin" style="margin-top:15px;padding:14px">
        Odblokuj
      </button>
      <p id="pinMessage"></p>
    `);

    document.getElementById("checkPin").onclick = () => {
      const value = document.getElementById("pinInput").value;

      if (value === pin) {
        showDemo();
      } else {
        document.getElementById("pinMessage").textContent =
          "Nieprawidłowy PIN.";
      }
    };
  }

  function showDemo() {
    showScreen(`
      <h1>Demonstracja odblokowana</h1>
      <p>Licencja została sprawdzona.</p>
      <p>To nieoficjalny projekt demonstracyjny.</p>
    `);
  }

  showLicense();
});
