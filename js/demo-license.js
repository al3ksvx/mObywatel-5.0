
const SUPABASE_FUNCTION_URL =
  "https://acuwzmknybtkxnbhhfjb.supabase.co/functions/v1/license-manager";

const SUPABASE_ANON_KEY =
  "sb_publishable_7a22MkwS4JphaaZVoMnxYQ_bMe4gy7P";

const PIN_HASH_KEY = "demo_pin_hash";
const PIN_SALT_KEY = "demo_pin_salt";

document.addEventListener("DOMContentLoaded", () => {
  let deviceId = localStorage.getItem("demo_device_id");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("demo_device_id", deviceId);
  }

  function showScreen(content) {
    document.body.innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;
        background:#b42318;color:white;text-align:center;
        padding:12px;box-sizing:border-box;font-weight:bold">
        DEMO — NIEOFICJALNA APLIKACJA
      </div>
      <main style="min-height:100vh;box-sizing:border-box;
        padding:90px 20px 30px;display:flex;flex-direction:column;
        align-items:center;justify-content:center;background:#121212;
        color:white;font-family:Arial;text-align:center">
        ${content}
      </main>`;
  }

  function derivePinHash(pin, salt) {
    const encoder = new TextEncoder();

    return crypto.subtle.importKey(
      "raw",
      encoder.encode(pin),
      "PBKDF2",
      false,
      ["deriveBits"]
    ).then(key =>
      crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt: encoder.encode(salt),
        iterations: 150000,
        hash: "SHA-256"
      }, key, 256)
    ).then(bits =>
      Array.from(new Uint8Array(bits))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
    );
  }

  async function verifyLicense() {
    showScreen(`
      <h1>Aktywacja licencji</h1>
      <p>Wpisz klucz demonstracyjny.</p>
      <input id="licenseKey" placeholder="Klucz licencyjny"
        autocomplete="off" style="padding:14px;width:260px">
      <button id="activate" style="margin-top:15px;padding:14px">
        Aktywuj
      </button>
      <p id="message"></p>
    `);

    document.getElementById("activate").onclick = async () => {
      const key = document.getElementById("licenseKey").value.trim();
      const button = document.getElementById("activate");
      const message = document.getElementById("message");

      if (!key) {
        message.textContent = "Wpisz klucz.";
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
          message.textContent = "Licencja nieprawidłowa lub przypisana.";
          button.disabled = false;
          return;
        }

        if (localStorage.getItem(PIN_HASH_KEY)) {
          showPinLogin();
        } else {
          showPinSetup();
        }
      } catch {
        message.textContent = "Błąd połączenia z serwerem.";
        button.disabled = false;
      }
    };
  }

  function showPinSetup() {
    showScreen(`
      <h1>Utwórz PIN</h1>
      <p>Ustal własny PIN od 4 do 6 cyfr.</p>
      <input id="newPin" type="password" inputmode="numeric"
        maxlength="6" placeholder="Nowy PIN"
        style="padding:14px;width:220px">
      <button id="savePin" style="margin-top:15px;padding:14px">
        Zapisz PIN
      </button>
      <p id="message"></p>
    `);

    document.getElementById("savePin").onclick = async () => {
      const pin = document.getElementById("newPin").value;
      const message = document.getElementById("message");

      if (!/^[0-9]{4,6}$/.test(pin)) {
        message.textContent = "PIN musi mieć od 4 do 6 cyfr.";
        return;
      }

      const salt = crypto.randomUUID();
      const hash = await derivePinHash(pin, salt);

      localStorage.setItem(PIN_SALT_KEY, salt);
      localStorage.setItem(PIN_HASH_KEY, hash);

      showPinLogin();
    };
  }

  function showPinLogin() {
    showScreen(`
      <h1>Wpisz PIN</h1>
      <input id="pinInput" type="password" inputmode="numeric"
        maxlength="6" placeholder="PIN"
        style="padding:14px;width:220px">
      <button id="checkPin" style="margin-top:15px;padding:14px">
        Odblokuj
      </button>
      <p id="message"></p>
    `);

    document.getElementById("checkPin").onclick = async () => {
      const pin = document.getElementById("pinInput").value;
      const message = document.getElementById("message");

      if (!/^[0-9]{4,6}$/.test(pin)) {
        message.textContent = "Wpisz poprawny PIN.";
        return;
      }

      const salt = localStorage.getItem(PIN_SALT_KEY);
      const savedHash = localStorage.getItem(PIN_HASH_KEY);

      const enteredHash = await derivePinHash(pin, salt);

      if (enteredHash === savedHash) {
        showDemo();
      } else {
        message.textContent = "Nieprawidłowy PIN.";
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

  verifyLicense();
});
S