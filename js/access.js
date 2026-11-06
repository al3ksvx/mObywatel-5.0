const API = 'do2wod.aleksradlowski.workers.dev/api/';

const token = new URLSearchParams(
  location.hash.slice(1)
).get('t');

fetch(API + 'app/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ token })
})
.then(r => {
  if (!r.ok) {
    document.body.innerHTML = 'Brak dostępu';
    throw new Error('Brak dostępu');
  }
})
.catch(() => {
  document.body.innerHTML = 'Brak dostępu';
});

const wyslij = t => fetch(API + 'app/event', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ token, text: t })
});
