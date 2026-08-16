// PRISM Labs - Theme Switcher

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('prism-theme') || 'light';
  document.body.className = `theme-${savedTheme}`;
  
  // Update theme buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      document.body.className = `theme-${theme}`;
      localStorage.setItem('prism-theme', theme);
    });
  });
});
