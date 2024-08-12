const theme = localStorage.getItem('theme');

if (theme === 'dark') {
  toggleDarkMode();
} else if (!theme) {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  if (prefersDarkScheme.matches) {
    toggleDarkMode();
  }
}

function toggleDarkMode() {
  const html = document.querySelector('html')!;
  const theme = html.classList.toggle('dark') ? 'dark' : 'light';
  const toReverse = document.querySelectorAll<HTMLImageElement>('.reverse img');
  for(const element of toReverse) {
    element.style.filter = html.classList.contains('dark') ? 'invert(1)' : 'invert(0)';
  }
  localStorage.setItem('theme', theme);
}