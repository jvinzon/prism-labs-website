// PRISM Labs - Main JavaScript

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // Flash message auto-dismiss
  const flashMessages = document.querySelectorAll('.flash-message');
  flashMessages.forEach(msg => {
    setTimeout(() => {
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 300);
    }, 5000);
  });
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker registered'))
    .catch(err => console.error('SW registration failed:', err));
}

// Utility: Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Utility: Relative time
function relativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) return formatDate(dateString);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

// QR Code scanner for attendance check-in
async function scanQRCode() {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      // Would integrate with a QR code scanning library here
      console.log('Camera access granted for QR scanning');
    } catch (err) {
      console.error('Camera access denied:', err);
      alert('Camera access is required for QR code scanning');
    }
  }
}

// Code Playground - Monaco Editor setup
function setupCodePlayground() {
  // Would initialize Monaco Editor here
  console.log('Code playground ready');
}

// Forum vote functionality
async function votePost(postId, voteType) {
  try {
    const response = await fetch(`/api/posts/${postId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote_type: voteType })
    });
    const result = await response.json();
    if (result.success) {
      location.reload();
    }
  } catch (err) {
    console.error('Vote failed:', err);
  }
}

// Resource bookmark toggle
async function toggleBookmark(resourceId) {
  try {
    const response = await fetch(`/api/resources/${resourceId}/bookmark`, {
      method: 'POST'
    });
    const result = await response.json();
    if (result.success) {
      alert(result.bookmarked ? 'Resource bookmarked!' : 'Bookmark removed');
    }
  } catch (err) {
    console.error('Bookmark failed:', err);
  }
}

// Export functions
window.prismlabs = {
  formatDate,
  relativeTime,
  scanQRCode,
  setupCodePlayground,
  votePost,
  toggleBookmark
};
