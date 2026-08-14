/* ========================================
   PRISM Labs Website - JavaScript
   ======================================== */

// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking a link
  const navLinks = navMenu.querySelectorAll('.nav-link, .nav-btn');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = target.offsetTop - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// Form submission handler for join.html
const joinForm = document.getElementById('joinForm');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn?.querySelector('.btn-text');
const btnLoading = submitBtn?.querySelector('.btn-loading');

if (joinForm) {
  joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    // Gather form data
    const formData = {
      fullName: document.getElementById('fullName').value,
      yearLevel: document.getElementById('yearLevel').value,
      email: document.getElementById('email').value,
      whyJoin: document.getElementById('whyJoin').value
    };
    
    try {
      // Try to submit to the API endpoint
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Success
        joinForm.style.display = 'none';
        formSuccess.style.display = 'block';
        document.querySelector('.what-next').style.display = 'none';
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Show error message
      joinForm.style.display = 'none';
      formError.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  });
}

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.getElementById('navbar');

if (navbar) {
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
    } else {
      navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
    }
    
    lastScroll = currentScroll;
  });
}

// Log that the script loaded (for debugging)
console.log('PRISM Labs website loaded successfully');
