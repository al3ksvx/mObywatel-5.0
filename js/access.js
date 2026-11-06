const API = 'https://do2wod.aleksradlowski.workers.dev/api/';

(async () => {
  const token = new URLSearchParams(location.hash.slice(1)).get('t');

  document.body.style.display = 'none';

  if (!token) {
    document.body.innerHTML = 'Brak dostępu';
    document.body.style.display = 'block';
    return;
  }

  try {
    const response = await fetch(API + 'app/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) throw new Error('Brak dostępu');

    document.body.style.display = '';
  } catch {
    document.body.innerHTML = 'Brak dostępu';
    document.body.style.display = 'block';
  }
})();
