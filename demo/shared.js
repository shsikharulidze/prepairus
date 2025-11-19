// PrePair Shared Utilities - Uses global Supabase client
// Supabase client is now available as window.sb from /js/supabase-client.js

// Global state
let currentUser = null;
let currentProfile = null;

// Get current session - centralized helper
async function getSession() {
  try {
    const { data: { session } } = await window.sb.auth.getSession();
    return session;
  } catch (error) {
    console.error('[auth/getSession]', error);
    return null;
  }
}

// Get current user 
async function getCurrentUser() {
  try {
    const { data: { user }, error } = await window.sb.auth.getUser();
    if (error) {
      // Only log non-session errors (session missing is normal for logged out users)
      if (error.message !== 'Auth session missing!' && !error.message.includes('session missing')) {
        console.error('[auth/getUser] Error:', error.message || error);
      }
      return null;
    }
    currentUser = user;
    return user;
  } catch (error) {
    console.error('[auth/getUser] Catch:', error.message || error);
    return null;
  }
}

// Get current session user or redirect (for protected pages only)
async function requireAuth() {
  const { data: { user }, error } = await window.sb.auth.getUser();
  if (error || !user || !user.email_confirmed_at) {
    window.location.href = '/signin.html';
    return null;
  }
  // Strip OAuth hash if present
  if (location.hash.includes('access_token')) {
    history.replaceState(null, '', location.pathname + location.search);
  }
  currentUser = user;
  return user;
}

// Load user profile
async function loadProfile(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('[student_profiles/select]', { error, userId });
      return null;
    }

    const profile = data && data.length > 0 ? data[0] : null;
    currentProfile = profile;
    return profile;
  } catch (error) {
    console.error('[student_profiles/select]', { error, userId });
    return null;
  }
}

// Create minimal profile if none exists
async function createMinimalProfile(user) {
  const profile = {
    user_id: user.id,
    email: user.email,
    firstName: '',
    lastName: '',
    onboarding_complete: false,
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .upsert(profile, { onConflict: 'user_id' })
      .select();

    if (error) {
      console.error('[student_profiles/upsert]', { error, profile });
      return null;
    }

    currentProfile = data[0];
    return data[0];
  } catch (error) {
    console.error('[student_profiles/upsert]', { error, profile });
    return null;
  }
}

// ============= STORAGE HELPERS =============

// AVATARS - Public read, owner only write
async function uploadAvatar(file) {
  const user = await requireAuth();
  if (!user) return null;

  const path = `${user.id}/profile.jpg`;
  const { error: upErr } = await supabase
    .storage.from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' });
  if (upErr) {
    console.error('[storage/avatars/upload]', upErr);
    throw upErr;
  }
  const { data } = window.sb.storage.from('avatars').getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

function getAvatarUrl(userId) {
  const { data } = window.sb.storage.from('avatars').getPublicUrl(`${userId}/profile.jpg`);
  return data.publicUrl;
}

// APPLICATION FILES - Private, owner only read/write
async function uploadAppFile(file, opportunityId) {
  const user = await requireAuth();
  if (!user) return null;

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${user.id}/${opportunityId}/${Date.now()}_${safeName}`;

  const { error: upErr } = await supabase
    .storage.from('application-files')
    .upload(path, file, { upsert: false, cacheControl: '3600' });
  if (upErr) {
    console.error('[storage/application-files/upload]', upErr);
    throw upErr;
  }
  return { bucket: 'application-files', path, name: file.name, size: file.size, type: file.type };
}

// Get signed URL for private files
async function getSignedUrl(bucket, path, expiresSeconds = 600) {
  const { data, error } = await supabase
    .storage.from(bucket)
    .createSignedUrl(path, expiresSeconds);
  if (error) {
    console.error('[storage/signed-url]', { bucket, path, error });
    throw error;
  }
  return data.signedUrl;
}

// Delete application file
async function deleteAppFile(path) {
  const { error } = await window.sb.storage.from('application-files').remove([path]);
  if (error) {
    console.error('[storage/application-files/delete]', { path, error });
    throw error;
  }
  return true;
}

// ============= AUTH & NAVIGATION =============

// Auth guard and redirect logic - COMPLETELY DISABLED
async function initAuth() {
  console.log('PrePair v1.8 - AUTH COMPLETELY DISABLED');
  
  // Do absolutely nothing except render UI
  renderHeader();
  renderFooter();
}

// Render header matching homepage design
function renderHeader() {
  const headerShell = document.getElementById('header-shell');
  if (!headerShell) return;

  const isAuthenticated = !!currentUser;
  
  const header = `
    <header id="site-header">
      <div class="nav-left">
        <a href="how-it-works.html">How it works</a>
        <a href="students.html">For Students</a>
        <a href="business.html">For Businesses</a>
      </div>

      <a class="brand brand-center" href="index.html">
        <div class="logo doodle" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="40" height="40" preserveAspectRatio="xMidYMid meet" role="img" aria-label="PrePair sprout logo">
            <path d="M32 56V20m0 0c6 0 10-5 10-10M32 20c-6 0-10-5-10-10M24 36c4 0 8-4 8-8M40 44c4 0 8-4 8-8" />
            <path d="M20 48c-4 2-6 5-7 8m6-4c2 0 5-1 8-3" />
          </svg>
        </div>
        <span class="wordmark">PrePair</span>
      </a>

      <div class="nav-right">
        <a href="about.html">About</a>
        
        <!-- Guest navigation (not signed in) -->
        <div class="nav-guest">
          <a href="signin.html">Sign in</a>
          <a class="btn-chip" href="apply.html">Apply</a>
        </div>
        
        <!-- Authenticated navigation (signed in) -->
        <div class="nav-authenticated">
          <a href="dashboard.html" class="profile-link">Dashboard</a>
          <a href="profile.html" class="profile-link">My Profile</a>
          <a href="applications.html" class="profile-link">Applications</a>
          <button class="sign-out-btn" onclick="handleSignOut()">Sign Out</button>
        </div>
      </div>
    </header>
  `;
  
  headerShell.innerHTML = header;
  
  // Apply auth state
  if (isAuthenticated) {
    document.body.classList.add('is-authenticated');
  } else {
    document.body.classList.remove('is-authenticated');
  }

  // Setup island header scroll effect
  setupIslandHeader();
}

// Island header scroll effect
function setupIslandHeader() {
  const shell = document.getElementById('header-shell');
  if (!shell) return;
  
  let floating = false;
  
  function onScroll() {
    const want = window.scrollY > 8;
    if (want !== floating) {
      shell.classList.toggle('is-floating', want);
      floating = want;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Render footer
function renderFooter() {
  const footer = document.querySelector('footer');
  if (footer) {
    footer.innerHTML = `
      <small>© <span id="year">${new Date().getFullYear()}</span> PrePair. Preparing students, pairing them with opportunity.</small>
    `;
  }
}

// Sign out handler
async function handleSignOut() {
  try {
    const { error } = await window.sb.auth.signOut();
    if (error) {
      console.error('[auth/signOut]', { error });
      showToast('Failed to sign out. Please try again.', 'error');
      return;
    }
    
    currentUser = null;
    currentProfile = null;
    window.location.href = '/signin.html';
  } catch (error) {
    console.error('[auth/signOut]', { error });
    showToast('Failed to sign out. Please try again.', 'error');
  }
}

// ============= UI UTILITIES =============

// Show inline error message under an input
function showInlineError(message, inputElement) {
  // Remove existing error
  const existingError = inputElement.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Create new error
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  inputElement.parentNode.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

// Clear inline error from an input
function clearInlineError(inputElement) {
  const errorMessage = inputElement.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
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

// ============= UTILITY FUNCTIONS =============

// Profile completeness checker
function checkProfileCompleteness(profile) {
  if (!profile) return { isComplete: false, missingFields: [], completeness: 0 };
  
  const requiredFields = ['firstName', 'lastName', 'university', 'major'];
  const missingFields = requiredFields.filter(field => !profile[field] || profile[field].trim() === '');
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completeness: Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
  };
}

// Question renderer for application forms
function renderQuestion(question, value = '', error = '') {
  const baseClass = error ? 'input error' : 'input';
  
  switch (question.type) {
    case 'textarea':
      return `
        <div class="form-group">
          <label for="${question.id}">${question.text}${question.required ? ' *' : ''}</label>
          <textarea id="${question.id}" name="${question.id}" class="${baseClass}" 
                    placeholder="Enter your response..." rows="4"
                    ${question.required ? 'required' : ''}>${value}</textarea>
          ${error ? `<div class="error-message">${error}</div>` : ''}
        </div>
      `;
    case 'file':
      return `
        <div class="form-group file-upload-group">
          <label for="${question.id}">${question.text}${question.required ? ' *' : ''}</label>
          <div class="file-input-wrapper">
            <input type="file" id="${question.id}" name="${question.id}" class="file-input"
                   accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                   ${question.required ? 'required' : ''}>
            <div class="file-upload-status" id="${question.id}-status">
              <span class="file-help">Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB)</span>
            </div>
          </div>
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

// Format date for display
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Add file upload CSS dynamically
if (typeof document !== 'undefined') {
  const fileUploadCSS = `
    .file-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px dashed rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .file-input:hover {
      border-color: var(--accent);
      background: rgba(255, 255, 255, 0.08);
    }
    
    .file-upload-status {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }
    
    .file-help {
      color: var(--text-muted);
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = fileUploadCSS;
  document.head.appendChild(style);
}

// Initialize page on DOM load
document.addEventListener('DOMContentLoaded', () => {
  console.log('PrePair v1.8 - ALL AUTH LOGIC DISABLED');
  console.log('Current page:', window.location.pathname);
  console.log('Page title:', document.title);
  console.log('URL hash:', window.location.hash);
  console.log('URL search:', window.location.search);
  initAuth();
});