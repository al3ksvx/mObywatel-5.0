
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
        padding:12px;box-sizing:border-box;font-weight:bold;z-index:10">
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
      <h1>Aktywacja licencji DEMO</h1>
      <p>Wpisz klucz demonstracyjny.</p>
      <input id="licenseKey" placeholder="Klucz licencyjny"
        autocomplete="off" style="padding:14px;width:260px;max-width:80%">
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
      } catch (error) {
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

      try {
        const salt = crypto.randomUUID();
        const hash = await derivePinHash(pin, salt);

        localStorage.setItem(PIN_SALT_KEY, salt);
        localStorage.setItem(PIN_HASH_KEY, hash);

        showPinLogin();
      } catch {
        message.textContent = "Nie udało się zapisać PIN-u.";
      }
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

      try {
        const salt = localStorage.getItem(PIN_SALT_KEY);
        const savedHash = localStorage.getItem(PIN_HASH_KEY);

        if (!salt || !savedHash) {
          message.textContent = "Brak zapisanego PIN-u.";
          return;
        }

        const enteredHash = await derivePinHash(pin, salt);

        if (enteredHash === savedHash) {
          showDemo();
        } else {
          message.textContent = "Nieprawidłowy PIN.";
        }
      } catch {
        message.textContent = "Błąd sprawdzania PIN-u.";
      }
    };
  }

  function showDemo() {
    showScreen(`
      <div style="width:100%;max-width:520px;text-align:left">

        <div style="text-align:center;margin-bottom:25px">
          <h1 style="font-size:30px">Panel główny DEMO</h1>
          <p style="color:#aaa">Witaj w demonstracji aplikacji</p>
        </div>

        <div style="background:#242424;padding:22px;
          border-radius:16px;margin-bottom:20px">
          <div style="font-size:13px;color:#ff9999">
            PROFIL TESTOWY
          </div>
          <h2>Użytkownik DEMO</h2>
          <p style="color:#aaa">Konto demonstracyjne · Dane fikcyjne</p>
        </div>

        <h2>Moduły demonstracyjne</h2>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">

          <button data-section="Dokumenty"
            style="padding:22px 10px;border:0;border-radius:14px;
            background:#292929;color:white;cursor:pointer">
            <div style="font-size:27px">📄</div>
            <b>Dokumenty</b>
          </button>

          <button data-section="Profil"
            style="padding:22px 10px;border:0;border-radius:14px;
            background:#292929;color:white;cursor:pointer">
            <div style="font-size:27px">👤</div>
            <b>Profil</b>
          </button>

          <button data-section="Usługi"
            style="padding:22px 10px;border:0;border-radius:14px;
            background:#292929;color:white;cursor:pointer">
            <div style="font-size:27px">🧩</div>
            <b>Usługi</b>
          </button>

          <button data-section="Ustawienia"
            style="padding:22px 10px;border:0;border-radius:14px;
            background:#292929;color:white;cursor:pointer">
            <div style="font-size:27px">⚙️</div>
            <b>Ustawienia</b>
          </button>

        </div>

        <p style="text-align:center;color:#999;font-size:12px;margin-top:25px">
          Nieoficjalny projekt demonstracyjny. Wszystkie dane są fikcyjne.
        </p>
      </div>
    `);

    document.querySelectorAll("[data-section]").forEach(button => {
      button.addEventListener("click", () => {
        showDemoSection(button.dataset.section);
      });
    });
  }

  function showDemoSection(name) {
    showScreen(`
      <div style="width:100%;max-width:450px">
        <h1>${name}</h1>
        <p>Przykładowy moduł demonstracyjny.</p>
        <p style="color:#aaa">
          Ta sekcja nie zawiera prawdziwych dokumentów ani danych.
        </p>
        <button id="backHome"
          style="padding:14px 25px;margin-top:20px;cursor:pointer">
          Wróć do panelu głównego
        </button>
      </div>
    `);

    document.getElementById("backHome").onclick = showDemo;
  }

  verifyLicense();
});
