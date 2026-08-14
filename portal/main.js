/* ========================================
   PRISM Labs Members Portal - JavaScript
   ======================================== */

// Configuration
const CONFIG = {
  storageKey: 'prismPortalAccess',
  resourcesFile: 'resources.json',
  announcementsFile: 'announcements.json'
};

// DOM Elements
const loginPage = document.getElementById('loginPage');
const portalDashboard = document.getElementById('portalDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize Portal
function init() {
  const hasAccess = checkAccess();
  
  if (hasAccess) {
    showDashboard();
  } else {
    showLogin();
  }
}

// Check if user has valid access
function checkAccess() {
  const stored = localStorage.getItem(CONFIG.storageKey);
  if (!stored) return false;
  
  try {
    const data = JSON.parse(stored);
    return data.authenticated === true;
  } catch {
    return false;
  }
}

// Show login page
function showLogin() {
  loginPage.style.display = 'flex';
  portalDashboard.style.display = 'none';
  document.title = 'Members Portal Login | PRISM Labs';
}

// Show dashboard
function showDashboard() {
  loginPage.style.display = 'none';
  portalDashboard.style.display = 'block';
  document.title = 'Members Portal | PRISM Labs';
  loadDashboardData();
}

// Login form submission
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const accessCode = document.getElementById('accessCode').value.trim();
    
    try {
      // Load resources to check access code
      const response = await fetch(CONFIG.resourcesFile);
      const data = await response.json();
      
      if (accessCode === data.accessCode) {
        // Store authentication
        localStorage.setItem(CONFIG.storageKey, JSON.stringify({
          authenticated: true,
          loginTime: new Date().toISOString()
        }));
        
        // Hide error and show dashboard
        loginError.style.display = 'none';
        showDashboard();
      } else {
        // Show error
        loginError.style.display = 'block';
      }
    } catch (error) {
      console.error('Login error:', error);
      loginError.style.display = 'block';
      loginError.querySelector('p').textContent = 'Error loading portal. Please refresh and try again.';
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(CONFIG.storageKey);
    showLogin();
    // Clear form
    document.getElementById('accessCode').value = '';
    loginError.style.display = 'none';
  });
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Load resources
    const resourcesResponse = await fetch(CONFIG.resourcesFile);
    const resourcesData = await resourcesResponse.json();
    
    // Update current week
    document.getElementById('currentWeek').textContent = `Week ${resourcesData.currentWeek}`;
    document.getElementById('totalResources').textContent = resourcesData.weeks.length;
    
    // Render resources
    renderResources(resourcesData.weeks);
    
    // Load announcements
    const announcementsResponse = await fetch(CONFIG.announcementsFile);
    const announcementsData = await announcementsResponse.json();
    
    renderAnnouncements(announcementsData.announcements);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// Render resources grid
function renderResources(weeks) {
  const grid = document.getElementById('resourcesGrid');
  if (!grid) return;
  
  grid.innerHTML = weeks.map(week => {
    const isUnlocked = week.status === 'unlocked';
    const resourcesHtml = isUnlocked 
      ? week.resources.map(res => `
          <li class="resource-item">
            <div class="resource-icon">${getResourceIcon(res.type)}</div>
            <div class="resource-info">
              <div class="resource-title">${res.title}</div>
              <div class="resource-note">${res.note}</div>
            </div>
          </li>
        `).join('')
      : '<li class="resource-item"><span class="lock-icon">🔒</span> Content locked until this week</li>';
    
    return `
      <div class="resource-card ${isUnlocked ? '' : 'locked'}">
        <div class="resource-header">
          <div class="resource-week">Week ${week.week}</div>
          <h3 class="resource-theme">${week.theme}</h3>
          <p class="resource-description">${week.description}</p>
        </div>
        <div class="resource-body">
          <ul class="resource-list">
            ${resourcesHtml}
          </ul>
        </div>
      </div>
    `;
  }).join('');
}

// Get icon for resource type
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

// Render announcements
function renderAnnouncements(announcements) {
  const grid = document.getElementById('announcementsGrid');
  if (!grid) return;
  
  // Sort by date (newest first)
  const sorted = announcements.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  grid.innerHTML = sorted.map(ann => `
    <div class="announcement-card priority-${ann.priority}">
      <div class="announcement-header">
        <h3 class="announcement-title">${ann.title}</h3>
        <div class="announcement-meta">
          ${formatDate(ann.date)} ${ann.author ? `• ${ann.author}` : ''}
        </div>
      </div>
      <div class="announcement-content">${ann.content}</div>
      ${ann.author ? `<div class="announcement-author">— ${ann.author}</div>` : ''}
    </div>
  `).join('');
}

// Format date nicely
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-NZ', options);
}

// Update next meeting info
function updateNextMeeting() {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  let nextMeeting;
  
  // Thursday (4) or Tuesday (2)
  if (day === 1 || day === 3) {
    nextMeeting = 'Today';
  } else if (day === 4 || day === 5) {
    nextMeeting = 'Tuesday';
  } else if (day === 6 || day === 0) {
    nextMeeting = 'Thursday';
  } else {
    nextMeeting = 'Thursday';
  }
  
  const nextMeetingEl = document.getElementById('nextMeeting');
  if (nextMeetingEl) {
    nextMeetingEl.textContent = nextMeeting;
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  init();
  updateNextMeeting();
});

// Log initialization
console.log('PRISM Labs Portal loaded');
