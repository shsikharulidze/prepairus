// Shared utilities for PrePair
const SUPABASE_URL = 'https://aezybthbsmpihbyzfiqi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlenlidGhic21waWhieXpmaXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTUwNTUsImV4cCI6MjA3ODEzMTA1NX0.ojh8dzVpF62hqU_MrXI9EfCBJGX74NMse_1t55m32go';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global auth state
let currentUser = null;
let currentProfile = null;

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
            <a href="opportunities.html" class="nav-link">Opportunities</a>
            <a href="applications.html" class="nav-link">My Applications</a>
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
    const protectedPages = ['/dashboard.html', '/profile.html', '/applications.html', '/settings.html', '/opportunity.html', '/apply-opportunity.html', '/opportunities.html'];
    
    // If on auth page and logged in, redirect to dashboard  
    if (user && authPages.some(page => currentPath.endsWith(page))) {
      // Check if onboarding is complete
      const profile = await getUserProfile(user.id);
      if (profile && !profile.onboarding_complete) {
        window.location.href = 'profile.html';
        return;
      }
      window.location.href = 'dashboard.html';
      return;
    }
    
    // If on protected page and not logged in, redirect to signin
    if (!user && protectedPages.some(page => currentPath.endsWith(page))) {
      window.location.href = 'signin.html';
      return;
    }

    // If logged in but onboarding not complete, redirect to profile (except if already on profile)
    if (user && !currentPath.endsWith('/profile.html')) {
      const profile = await getUserProfile(user.id);
      if (profile && !profile.onboarding_complete) {
        window.location.href = 'profile.html';
        return;
      }
    }
    
    // Render navigation after auth check
    renderNavigation();
    
  } catch (error) {
    console.error('Auth check failed:', error);
    renderNavigation();
  }
}

// Get user profile
async function getUserProfile(userId) {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Profile fetch error:', error);
      return null;
    }

    currentProfile = data;
    return data;
  } catch (error) {
    console.error('Get user profile failed:', error);
    return null;
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
    
    // Log to files_manifest
    await logFileUpload(bucket, path, file.type, file.name);
    
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

// Log file upload to manifest
async function logFileUpload(bucket, path, mimeType, originalName) {
  try {
    const { error } = await supabase
      .from('files_manifest')
      .insert({
        user_id: currentUser?.id,
        bucket_name: bucket,
        file_path: path,
        mime_type: mimeType,
        original_name: originalName,
        purpose: bucket === 'avatars' ? 'profile_avatar' : 'application_file'
      });

    if (error) console.error('File manifest logging failed:', error);
  } catch (error) {
    console.error('File manifest logging failed:', error);
  }
}

// Profile completeness checker
function checkProfileCompleteness(profile) {
  const requiredFields = ['firstName', 'lastName', 'university', 'major'];
  const missingFields = requiredFields.filter(field => !profile[field] || profile[field].trim() === '');
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completeness: Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
  };
}

// Loading skeleton helper
function showLoadingSkeleton(containerId, type = 'default') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const skeletons = {
    card: `
      <div class="loading-skeleton">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-subtitle"></div>
        <div class="skeleton-line skeleton-text"></div>
        <div class="skeleton-line skeleton-text short"></div>
      </div>
    `,
    list: `
      <div class="loading-skeleton">
        <div class="skeleton-line skeleton-text"></div>
        <div class="skeleton-line skeleton-text"></div>
        <div class="skeleton-line skeleton-text"></div>
      </div>
    `,
    default: `
      <div class="loading-skeleton">
        <div class="skeleton-line skeleton-text"></div>
      </div>
    `
  };

  container.innerHTML = skeletons[type] || skeletons.default;
}

// Question type renderer
function renderQuestion(question, value = '', error = '') {
  const baseClass = error ? 'input error' : 'input';
  
  switch (question.type) {
    case 'textarea':
      return `
        <div class="form-group">
          <label for="${question.id}">${question.text}${question.required ? ' *' : ''}</label>
          <textarea id="${question.id}" name="${question.id}" class="${baseClass}" 
                    placeholder="Enter your response..." 
                    ${question.required ? 'required' : ''}>${value}</textarea>
          ${error ? `<div class="error-message">${error}</div>` : ''}
        </div>
      `;
    case 'file':
      return `
        <div class="form-group">
          <label for="${question.id}">${question.text}${question.required ? ' *' : ''}</label>
          <input type="file" id="${question.id}" name="${question.id}" class="${baseClass}"
                 accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                 ${question.required ? 'required' : ''}>
          ${error ? `<div class="error-message">${error}</div>` : ''}
        </div>
      `;
    default:
      return `
        <div class="form-group">
          <label for="${question.id}">${question.text}${question.required ? ' *' : ''}</label>
          <input type="text" id="${question.id}" name="${question.id}" class="${baseClass}"
                 value="${value}" placeholder="Enter your response..."
                 ${question.required ? 'required' : ''}>
          ${error ? `<div class="error-message">${error}</div>` : ''}
        </div>
      `;
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', checkAuthAndRedirect);