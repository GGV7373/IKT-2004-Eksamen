const heiKnapp = document.getElementById('hei-knapp');
const melding = document.getElementById('melding');

heiKnapp.addEventListener('click', () => {
  melding.textContent = 'Hei';
});
