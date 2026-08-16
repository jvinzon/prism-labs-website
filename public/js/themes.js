class ThemeSwitcher {
  constructor() {
    this.theme = localStorage.getItem('prism-theme') || 'light';
    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.createUI();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.theme = theme;
    localStorage.setItem('prism-theme', theme);
  }

  createUI() {
    const html = `
      <div class="theme-panel" id="themePanel">
        <div class="theme-option" data-theme="light">☀️ Light</div>
        <div class="theme-option" data-theme="dark">🌙 Dark</div>
        <div class="theme-option" data-theme="prism">🌈 PRISM</div>
        <div class="theme-option" data-theme="ocean">🌊 Ocean</div>
        <div class="theme-option" data-theme="forest">🌲 Forest</div>
      </div>
      <button class="theme-btn" id="themeToggle">🎨</button>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    
    document.getElementById('themeToggle').onclick = () => {
      document.getElementById('themePanel').classList.toggle('active');
    };
    
    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.onclick = () => {
        this.applyTheme(opt.dataset.theme);
        document.getElementById('themePanel').classList.remove('active');
      };
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ThemeSwitcher());
} else {
  new ThemeSwitcher();
}
