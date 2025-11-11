// Shared utilities for PrePair
const SUPABASE_URL = 'https://aezybthbsmpihbyzfiqi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlenlidGhic21waWhieXpmaXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTUwNTUsImV4cCI6MjA3ODEzMTA1NX0.ojh8dzVpF62hqU_MrXI9EfCBJGX74NMse_1t55m32go';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global auth state
let currentUser = null;

// Navigation component
function renderNavigation(containerId = 'nav-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const isAuthenticated = !!currentUser;
  
  const nav = `
    <nav class="global-nav">
      <div class="nav-content">
        <a href="index.html" class="brand">
          <div class="logo">
            <svg viewBox="0 0 64 64" width="32" height="32">
              <path d="M32 56V20m0 0c6 0 10-5 10-10M32 20c-6 0-10-5-10-10M24 36c4 0 8-4 8-8M40 44c4 0 8-4 8-8" />
              <path d="M20 48c-4 2-6 5-7 8m6-4c2 0 5-1 8-3" />
            </svg>
          </div>
          <span class="wordmark">PrePair</span>
        </a>
        
        <div class="nav-links">
          ${isAuthenticated ? `
            <a href="dashboard.html" class="nav-link">Dashboard</a>
            <a href="opportunity.html" class="nav-link">Opportunities</a>
            <a href="applications.html" class="nav-link">Applications</a>
            <a href="profile.html" class="nav-link">Profile</a>
            <a href="settings.html" class="nav-link">Settings</a>
            <button class="nav-link sign-out-btn" onclick="handleSignOut()">Sign Out</button>
          ` : `
            <a href="signin.html" class="nav-link">Sign In</a>
            <a href="apply.html" class="nav-link-cta">Apply</a>
          `}
        </div>
      </div>
    </nav>
  `;
  
  container.innerHTML = nav;
}

// Auth check and redirect logic
async function checkAuthAndRedirect() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    currentUser = user;
    
    const currentPath = window.location.pathname;
    const authPages = ['/signin.html', '/apply.html', '/index.html'];
    const protectedPages = ['/dashboard.html', '/profile.html', '/applications.html', '/settings.html', '/opportunity.html', '/apply-opportunity.html'];
    
    // If on auth page and logged in, redirect to dashboard
    if (user && authPages.some(page => currentPath.endsWith(page))) {
      window.location.href = 'dashboard.html';
      return;
    }
    
    // If on protected page and not logged in, redirect to signin
    if (!user && protectedPages.some(page => currentPath.endsWith(page))) {
      window.location.href = 'signin.html';
      return;
    }
    
    // Render navigation after auth check
    renderNavigation();
    
  } catch (error) {
    console.error('Auth check failed:', error);
    renderNavigation();
  }
}

// Sign out handler
async function handleSignOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    currentUser = null;
    window.location.href = 'signin.html';
  } catch (error) {
    console.error('Sign out failed:', error);
    showToast('Failed to sign out. Please try again.', 'error');
  }
}

// Toast notification system
function showToast(message, type = 'success') {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ⓘ';
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  // Show toast with animation
  setTimeout(() => toast.classList.add('show'), 100);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Loading state management
function setLoading(element, loading = true, originalText = '') {
  if (loading) {
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.textContent = 'Loading...';
    element.classList.add('loading');
  } else {
    element.disabled = false;
    element.textContent = originalText || element.dataset.originalText || 'Submit';
    element.classList.remove('loading');
  }
}

// File upload helper
async function uploadFile(file, bucket, path) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Get file URL helper
function getFileUrl(bucket, path) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

// Initialize page
document.addEventListener('DOMContentLoaded', checkAuthAndRedirect);