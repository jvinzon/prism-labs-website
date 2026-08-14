/* ========================================
   PRISM Labs Admin Dashboard - JavaScript
   ======================================== */

// Configuration
const CONFIG = {
  storageKey: 'prismAdminAuth',
  configFile: 'config.json',
  resourcesFile: '../portal/resources.json',
  announcementsFile: '../portal/announcements.json',
  registrationsFile: 'registrations.json'
};

// DOM Elements
const adminLoginPage = document.getElementById('adminLoginPage');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const loginError = document.getElementById('loginError');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

// Initialize Admin Dashboard
function init() {
  const isAuthenticated = checkAuth();
  
  if (isAuthenticated) {
    showDashboard();
  } else {
    showLogin();
  }
}

// Check authentication
function checkAuth() {
  const stored = localStorage.getItem(CONFIG.storageKey);
  if (!stored) return false;
  
  try {
    const data = JSON.parse(stored);
    return data.authenticated === true;
  } catch {
    return false;
  }
}

// Show login
function showLogin() {
  adminLoginPage.style.display = 'flex';
  adminDashboard.style.display = 'none';
  document.title = 'Admin Login | PRISM Labs';
}

// Show dashboard
function showDashboard() {
  adminLoginPage.style.display = 'none';
  adminDashboard.style.display = 'block';
  document.title = 'Admin Dashboard | PRISM Labs';
  loadDashboardData();
}

// Login form handler
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    try {
      const response = await fetch(CONFIG.configFile);
      const config = await response.json();
      
      if (username === config.adminUsername && password === config.adminPassword) {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify({
          authenticated: true,
          loginTime: new Date().toISOString(),
          username: username
        }));
        
        loginError.style.display = 'none';
        showDashboard();
      } else {
        loginError.style.display = 'block';
      }
    } catch (error) {
      console.error('Login error:', error);
      loginError.style.display = 'block';
      loginError.querySelector('p').textContent = 'Error loading config. Please refresh.';
    }
  });
}

// Logout handler
if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener('click', () => {
    localStorage.removeItem(CONFIG.storageKey);
    showLogin();
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    loginError.style.display = 'none';
  });
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Load config
    const configResponse = await fetch(CONFIG.configFile);
    const config = await configResponse.json();
    
    // Update displays
    document.getElementById('teacherNameDisplay').textContent = config.teacherName;
    document.getElementById('currentWeekNum').textContent = config.currentWeek;
    document.getElementById('currentWeekDisplay').textContent = config.currentWeek;
    document.getElementById('portalAccessCodeDisplay').textContent = config.portalAccessCode;
    
    // Load resources
    const resourcesResponse = await fetch(CONFIG.resourcesFile);
    const resourcesData = await resourcesResponse.json();
    
    // Update resources preview
    renderResourcesPreview(resourcesData.weeks, config.currentWeek);
    
    // Load announcements
    const announcementsResponse = await fetch(CONFIG.announcementsFile);
    const announcementsData = await announcementsResponse.json();
    
    document.getElementById('totalAnnouncements').textContent = announcementsData.announcements.length;
    renderAnnouncementsPreview(announcementsData.announcements);
    
    // Load registrations
    try {
      const registrationsResponse = await fetch(CONFIG.registrationsFile);
      const registrationsData = await registrationsResponse.json();
      
      document.getElementById('totalRegistrations').textContent = registrationsData.registrations.length;
      renderRegistrationsPreview(registrationsData.registrations);
    } catch (error) {
      // No registrations yet
      document.getElementById('totalRegistrations').textContent = '0';
      document.getElementById('registrationsPreview').innerHTML = '<p class="loading-text">No registrations yet</p>';
    }
    
    // Setup form handlers
    setupSettingsForms(config);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// Render resources preview
function renderResourcesPreview(weeks, currentWeek) {
  const container = document.getElementById('resourcesPreview');
  const currentWeekData = weeks.find(w => w.week === currentWeek);
  
  if (!currentWeekData) {
    container.innerHTML = '<p class="loading-text">Week not found</p>';
    return;
  }
  
  container.innerHTML = `
    <div class="resource-preview-card">
      <h4>Week ${currentWeekData.week}: ${currentWeekData.theme}</h4>
      <p style="color: var(--gray); margin: 8px 0 16px;">${currentWeekData.description}</p>
      <div class="resource-list-mini">
        ${currentWeekData.resources.map(r => `
          <div class="resource-mini-item">
            <span>${getResourceIcon(r.type)}</span>
            <span>${r.title}</span>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 16px; font-size: 0.875rem; color: var(--gray);">
        Status: <strong style="color: ${currentWeekData.status === 'unlocked' ? 'var(--green)' : 'var(--orange)'}">${currentWeekData.status}</strong>
      </div>
    </div>
  `;
}

// Render announcements preview
function renderAnnouncementsPreview(announcements) {
  const container = document.getElementById('announcementsPreview');
  const sorted = announcements.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  
  if (sorted.length === 0) {
    container.innerHTML = '<p class="loading-text">No announcements</p>';
    return;
  }
  
  container.innerHTML = sorted.map(ann => `
    <div class="announcement-preview-item" style="padding: 12px 0; border-bottom: 1px solid #E2E8F0;">
      <div style="font-weight: 600; margin-bottom: 4px;">${ann.title}</div>
      <div style="font-size: 0.875rem; color: var(--gray);">${formatDate(ann.date)}</div>
    </div>
  `).join('');
}

// Render registrations preview
function renderRegistrationsPreview(registrations) {
  const container = document.getElementById('registrationsPreview');
  const recent = registrations.slice(-5).reverse();
  
  if (recent.length === 0) {
    container.innerHTML = '<p class="loading-text">No registrations yet</p>';
    return;
  }
  
  container.innerHTML = `
    <table class="preview-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Year</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${recent.map(reg => `
          <tr>
            <td>${reg.fullName}</td>
            <td>${reg.yearLevel}</td>
            <td>${formatDateShort(reg.submittedAt)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Get resource icon
function getResourceIcon(type) {
  const icons = {
    slides: '📊',
    code: '💻',
    challenge: '🎯',
    reading: '📖',
    template: '📝',
    guide: '📘'
  };
  return icons[type] || '📄';
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-NZ', options);
}

function formatDateShort(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
}

// Setup settings forms
function setupSettingsForms(config) {
  // Access Code Form
  const accessCodeForm = document.getElementById('accessCodeForm');
  if (accessCodeForm) {
    accessCodeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newCode = document.getElementById('newAccessCode').value.trim();
      await updateConfig({ portalAccessCode: newCode }, 'accessCodeMessage', 'Access code updated!');
      document.getElementById('portalAccessCodeDisplay').textContent = newCode;
      accessCodeForm.reset();
    });
  }
  
  // Current Week Form
  const currentWeekForm = document.getElementById('currentWeekForm');
  if (currentWeekForm) {
    currentWeekForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newWeek = parseInt(document.getElementById('newCurrentWeek').value);
      await updateConfig({ currentWeek: newWeek }, 'weekMessage', 'Week updated!');
      document.getElementById('currentWeekNum').textContent = newWeek;
      document.getElementById('currentWeekDisplay').textContent = newWeek;
      currentWeekForm.reset();
    });
  }
  
  // Admin Password Form
  const adminPasswordForm = document.getElementById('adminPasswordForm');
  if (adminPasswordForm) {
    adminPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      
      if (currentPassword !== config.adminPassword) {
        showFormMessage('passwordMessage', 'Current password is incorrect', 'error');
        return;
      }
      
      await updateConfig({ adminPassword: newPassword }, 'passwordMessage', 'Password updated!');
      adminPasswordForm.reset();
    });
  }
  
  // Term Info Form
  const termInfoForm = document.getElementById('termInfoForm');
  if (termInfoForm) {
    termInfoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newTerm = document.getElementById('newTermInfo').value.trim();
      await updateConfig({ term: newTerm }, 'termMessage', 'Term info updated!');
      termInfoForm.reset();
    });
  }
}

// Update config helper
async function updateConfig(updates, messageId, successMessage) {
  try {
    const response = await fetch(CONFIG.configFile);
    const config = await response.json();
    
    const updatedConfig = { ...config, ...updates, lastUpdated: new Date().toISOString().split('T')[0] };
    
    // In a real app, this would save to a server
    // For now, we'll just show success message
    showFormMessage(messageId, successMessage, 'success');
    
    // Save to localStorage for persistence in this session
    localStorage.setItem('prismAdminConfig', JSON.stringify(updatedConfig));
    
  } catch (error) {
    showFormMessage(messageId, 'Error updating config', 'error');
    console.error('Update error:', error);
  }
}

// Show form message
function showFormMessage(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.className = `form-message ${type}`;
    setTimeout(() => {
      el.className = 'form-message';
    }, 5000);
  }
}

// Export registrations
document.getElementById('exportRegistrationsBtn')?.addEventListener('click', async () => {
  try {
    const response = await fetch(CONFIG.registrationsFile);
    const data = await response.json();
    
    const csv = convertToCSV(data.registrations);
    downloadFile(csv, 'prism-labs-registrations.csv', 'text/csv');
  } catch (error) {
    alert('No registrations to export');
  }
});

// Backup data
document.getElementById('backupDataBtn')?.addEventListener('click', async () => {
  try {
    const [config, resources, announcements] = await Promise.all([
      fetch(CONFIG.configFile).then(r => r.json()),
      fetch(CONFIG.resourcesFile).then(r => r.json()),
      fetch(CONFIG.announcementsFile).then(r => r.json())
    ]);
    
    const backup = {
      exportedAt: new Date().toISOString(),
      config,
      resources,
      announcements
    };
    
    const json = JSON.stringify(backup, null, 2);
    downloadFile(json, `prism-labs-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  } catch (error) {
    alert('Error creating backup');
  }
});

// Reset data
document.getElementById('resetDataBtn')?.addEventListener('click', () => {
  if (confirm('⚠️ WARNING: This will delete all registrations and cannot be undone!\n\nAre you sure you want to continue?')) {
    if (confirm('Really sure? This action is permanent.')) {
      // In a real app, this would clear server data
      alert('Data reset would occur here (requires backend)');
    }
  }
});

// Helper: Convert to CSV
function convertToCSV(registrations) {
  if (registrations.length === 0) return '';
  
  const headers = ['Name', 'Year Level', 'Email', 'Why Join', 'Submitted At'];
  const rows = registrations.map(r => [
    r.fullName,
    r.yearLevel,
    r.email,
    `"${r.whyJoin.replace(/"/g, '""')}"`,
    r.submittedAt
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Helper: Download file
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

console.log('PRISM Labs Admin Dashboard loaded');
