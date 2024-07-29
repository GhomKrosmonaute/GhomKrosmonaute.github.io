const theme = localStorage.getItem('theme');

if (theme === 'dark') {
  toggleDarkMode();
}

function toggleDarkMode() {
  const html = document.querySelector('html');
  const theme = html.classList.toggle('dark') ? 'dark' : 'light';
  const toReverse = document.querySelectorAll('.reverse img');
  for(const element of toReverse) {
    element.style.filter = html.classList.contains('dark') ? 'invert(1)' : 'invert(0)';
  }
  localStorage.setItem('theme', theme);
}