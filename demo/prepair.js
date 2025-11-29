// prepair.js - Shared client-side code for PrePair Dashboard System

// --- Supabase Client Initialization ---
// Replace with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client with magic link authentication settings
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true
  }
});

// --- Global State ---
let currentUser = null;
let currentUserProfile = null;

// --- Authentication Handling ---

// Check if user is authenticated and redirect if not
async function requireAuth() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[auth/getSession]', { error });
      redirectToLogin();
      return null;
    }
    
    if (!session) {
      redirectToLogin();
      return null;
    }
    
    currentUser = session.user;
    return session.user;
  } catch (error) {
    console.error('[auth/requireAuth]', { error });
    redirectToLogin();
    return null;
  }
}

// Get current session without redirecting
async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[auth/getCurrentSession]', { error });
      return null;
    }
    
    if (session) {
      currentUser = session.user;
    }
    
    return session;
  } catch (error) {
    console.error('[auth/getCurrentSession]', { error });
    return null;
  }
}

// Redirect to login page
function redirectToLogin() {
  window.location.href = '/signin.html';
}

// Sign out user
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[auth/signOut]', { error });
      showToast('Failed to sign out. Please try again.', 'error');
      return;
    }
    
    // Clear global state
    currentUser = null;
    currentUserProfile = null;
    
    // Redirect to login
    redirectToLogin();
  } catch (error) {
    console.error('[auth/signOut]', { error });
    showToast('Failed to sign out. Please try again.', 'error');
  }
}

// --- Profile Data Handling ---

// Load user profile from database
async function loadProfile(userId = null) {
  try {
    const userIdToUse = userId || currentUser?.id;
    
    if (!userIdToUse) {
      console.error('[profile/load] No user ID provided');
      return null;
    }
    
    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', userIdToUse)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('[profile/load]', { error, userId: userIdToUse });
      throw error;
    }
    
    if (profile) {
      currentUserProfile = profile;
    }
    
    return profile;
  } catch (error) {
    console.error('[profile/load]', { error });
    return null;
  }
}

// Update user profile in database
async function updateProfile(profileData) {
  try {
    if (!currentUser?.id) {
      throw new Error('No authenticated user');
    }
    
    // Ensure the profile data includes the user's ID for RLS
    const dataToUpdate = {
      ...profileData,
      id: currentUser.id
    };
    
    const { data, error } = await supabase
      .from('student_profiles')
      .upsert(dataToUpdate, { 
        onConflict: 'id',
        returning: 'representation' 
      })
      .select()
      .single();
    
    if (error) {
      console.error('[profile/update]', { error, data: dataToUpdate });
      throw error;
    }
    
    // Update global state
    currentUserProfile = data;
    
    return { success: true, data };
  } catch (error) {
    console.error('[profile/update]', { error });
    return { success: false, error: error.message };
  }
}

// Create minimal profile for new user
async function createMinimalProfile(user) {
  try {
    const profileData = {
      id: user.id,
      name: user.user_metadata?.name || '',
      surname: user.user_metadata?.surname || '',
      university: 'Fordham University'
    };
    
    const { data, error } = await supabase
      .from('student_profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single();
    
    if (error) {
      console.error('[profile/createMinimal]', { error, data: profileData });
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[profile/createMinimal]', { error });
    return null;
  }
}

// --- Applications Data Handling ---

// Load user's applications
async function loadApplications(userId = null) {
  try {
    const userIdToUse = userId || currentUser?.id;
    
    if (!userIdToUse) {
      throw new Error('No user ID provided');
    }
    
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userIdToUse)
      .order('applied_at', { ascending: false });
    
    if (error) {
      console.error('[applications/load]', { error, userId: userIdToUse });
      throw error;
    }
    
    return applications || [];
  } catch (error) {
    console.error('[applications/load]', { error });
    throw error;
  }
}

// Withdraw (delete) an application
async function withdrawApplication(applicationId) {
  try {
    if (!currentUser?.id) {
      throw new Error('No authenticated user');
    }
    
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId)
      .eq('user_id', currentUser.id); // Ensure user can only delete their own applications
    
    if (error) {
      console.error('[applications/withdraw]', { error, applicationId });
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('[applications/withdraw]', { error });
    return { success: false, error: error.message };
  }
}

// --- UI Helper Functions ---

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // Auto-hide toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('[formatDate]', { error, dateString });
    return 'Invalid Date';
  }
}

// Set loading state on button
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = 'Loading...';
  } else {
    button.classList.remove('loading');
    button.disabled = false;
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }
}

// --- Page-Specific Initialization ---

// Initialize dashboard page
async function initDashboard() {
  try {
    console.log('[dashboard] Initializing dashboard page');
    
    // Check authentication
    const user = await requireAuth();
    if (!user) return;
    
    // Load user profile for welcome message
    const profile = await loadProfile(user.id);
    
    // Update welcome message
    updateWelcomeMessage(user, profile);
    
    // Load recent applications for dashboard
    await loadRecentApplicationsForDashboard();
    
    console.log('[dashboard] Dashboard initialization complete');
  } catch (error) {
    console.error('[dashboard/init]', { error });
    showToast('Failed to load dashboard. Please refresh the page.', 'error');
  }
}

// Update welcome message on dashboard
function updateWelcomeMessage(user, profile) {
  try {
    const welcomeTitle = document.getElementById('welcomeTitle');
    const userAvatar = document.getElementById('userAvatar');
    
    if (!welcomeTitle || !userAvatar) return;
    
    // Get user's display name
    const firstName = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Student';
    
    // Update welcome message
    welcomeTitle.textContent = `Welcome back, ${firstName}!`;
    
    // Update avatar
    if (profile?.avatar_url || user.user_metadata?.avatar_url) {
      const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
      userAvatar.innerHTML = `<img src="${avatarUrl}" alt="${firstName}" 
        onerror="this.style.display='none'; this.parentNode.textContent='${firstName.charAt(0).toUpperCase()}'">`;
    } else {
      userAvatar.textContent = firstName.charAt(0).toUpperCase();
    }
  } catch (error) {
    console.error('[dashboard/updateWelcome]', { error });
  }
}

// Load recent applications for dashboard
async function loadRecentApplicationsForDashboard() {
  try {
    const container = document.getElementById('recentApplicationsList');
    if (!container) return;
    
    const applications = await loadApplications();
    
    // Show only the 3 most recent applications
    const recentApplications = applications.slice(0, 3);
    
    if (recentApplications.length > 0) {
      container.innerHTML = recentApplications.map(app => `
        <div class="application-item">
          <h4 class="position-title">${app.position}</h4>
          <p class="muted">${app.company} • <span class="status ${app.status}">${app.status}</span></p>
          <p class="application-date">${formatDate(app.applied_at)}</p>
        </div>
      `).join('');
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <p class="muted">You have not applied to any internships yet.</p>
          <a href="/applications.html" class="btn ghost" style="margin-top: 12px;">Start Applying</a>
        </div>
      `;
    }
  } catch (error) {
    console.error('[dashboard/loadRecentApplications]', { error });
    const container = document.getElementById('recentApplicationsList');
    if (container) {
      container.innerHTML = `<p class="muted">Failed to load recent applications.</p>`;
    }
  }
}

// Initialize edit profile page
async function initEditProfile() {
  try {
    console.log('[edit-profile] Initializing edit profile page');
    
    // Check authentication
    const user = await requireAuth();
    if (!user) return;
    
    // Load and populate profile form
    await populateProfileForm(user);
    
    // Set up form submission handler
    setupProfileFormHandler();
    
    console.log('[edit-profile] Edit profile initialization complete');
  } catch (error) {
    console.error('[edit-profile/init]', { error });
    showToast('Failed to load profile. Please refresh the page.', 'error');
  }
}

// Populate profile form with existing data
async function populateProfileForm(user) {
  try {
    const profile = await loadProfile(user.id);
    
    if (profile) {
      // Populate form fields
      const fields = ['first-name', 'last-name', 'university', 'major', 'graduation-year', 'campus', 'nationality', 'birthday'];
      
      fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
          const profileKey = {
            'first-name': 'name',
            'last-name': 'surname',
            'graduation-year': 'graduation_year'
          }[fieldId] || fieldId.replace('-', '_');
          
          if (profile[profileKey]) {
            field.value = profile[profileKey];
          }
        }
      });
    }
  } catch (error) {
    console.error('[edit-profile/populate]', { error });
  }
}

// Set up profile form submission handler
function setupProfileFormHandler() {
  const form = document.getElementById('profile-form');
  const submitBtn = document.getElementById('save-btn');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  
  if (!form || !submitBtn) return;
  
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Hide previous messages
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Validate required fields
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    
    if (!firstName || !lastName) {
      showFormError('Please fill in your first and last name.');
      if (!firstName) {
        document.getElementById('first-name').focus();
      } else {
        document.getElementById('last-name').focus();
      }
      return;
    }
    
    // Set loading state
    setButtonLoading(submitBtn, true);
    
    try {
      // Gather form data
      const profileData = {
        name: firstName,
        surname: lastName,
        university: document.getElementById('university').value.trim() || 'Fordham University',
        major: document.getElementById('major').value.trim(),
        graduation_year: document.getElementById('graduation-year').value ? 
          parseInt(document.getElementById('graduation-year').value) : null,
        campus: document.getElementById('campus').value || null,
        nationality: document.getElementById('nationality').value.trim() || null,
        birthday: document.getElementById('birthday').value || null
      };
      
      // Update profile
      const result = await updateProfile(profileData);
      
      if (result.success) {
        showFormSuccess('Profile updated successfully!');
        // Update welcome message if on dashboard
        if (document.getElementById('welcomeTitle')) {
          updateWelcomeMessage(currentUser, result.data);
        }
      } else {
        showFormError(result.error || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('[edit-profile/submit]', { error });
      showFormError('An unexpected error occurred. Please try again.');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
  
  // Helper functions for form messages
  function showFormSuccess(message) {
    if (successMessage) {
      successMessage.textContent = message;
      successMessage.style.display = 'block';
    } else {
      showToast(message, 'success');
    }
  }
  
  function showFormError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    } else {
      showToast(message, 'error');
    }
  }
}

// Initialize applications page
async function initApplications() {
  try {
    console.log('[applications] Initializing applications page');
    
    // Check authentication
    const user = await requireAuth();
    if (!user) return;
    
    // Load and display applications
    await loadAndDisplayApplications();
    
    // Set up new application button
    setupNewApplicationButton();
    
    console.log('[applications] Applications initialization complete');
  } catch (error) {
    console.error('[applications/init]', { error });
    showToast('Failed to load applications. Please refresh the page.', 'error');
  }
}

// Load and display applications list
async function loadAndDisplayApplications() {
  try {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const applicationsList = document.getElementById('applications-list');
    const applicationsRows = document.getElementById('applications-rows');
    
    if (!loadingState || !emptyState || !applicationsList || !applicationsRows) return;
    
    // Show loading state
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    applicationsList.style.display = 'none';
    
    // Load applications
    const applications = await loadApplications();
    
    // Hide loading state
    loadingState.style.display = 'none';
    
    if (applications.length > 0) {
      // Show applications list
      applicationsList.style.display = 'block';
      
      // Generate application rows
      applicationsRows.innerHTML = applications.map(app => `
        <div class="application-row">
          <div class="row-cell position" data-label="Position">
            <div class="position-title">${app.position}</div>
          </div>
          <div class="row-cell company" data-label="Company">
            <div class="company-name">${app.company}</div>
          </div>
          <div class="row-cell status" data-label="Status">
            <span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span>
          </div>
          <div class="row-cell date" data-label="Applied">
            <div class="application-date">${formatDate(app.applied_at)}</div>
          </div>
          <div class="row-cell actions" data-label="Actions">
            <div class="application-actions">
              <button class="action-btn" onclick="viewApplication('${app.id}')">View</button>
              <button class="action-btn withdraw" onclick="handleWithdrawApplication('${app.id}')">Withdraw</button>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      // Show empty state
      emptyState.style.display = 'block';
    }
  } catch (error) {
    console.error('[applications/loadAndDisplay]', { error });
    
    // Show error state
    const container = document.getElementById('applications-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <h3 style="color: #dc3545;">Failed to load applications</h3>
          <p class="muted">Please try refreshing the page.</p>
          <button class="btn ghost" onclick="window.location.reload()" style="margin-top: 16px;">
            Try Again
          </button>
        </div>
      `;
    }
  }
}

// Handle application withdrawal
async function handleWithdrawApplication(applicationId) {
  try {
    const confirmed = confirm('Are you sure you want to withdraw this application? This action cannot be undone.');
    
    if (!confirmed) return;
    
    const result = await withdrawApplication(applicationId);
    
    if (result.success) {
      showToast('Application withdrawn successfully.', 'success');
      // Reload applications list
      await loadAndDisplayApplications();
    } else {
      showToast(result.error || 'Failed to withdraw application.', 'error');
    }
  } catch (error) {
    console.error('[applications/withdraw]', { error });
    showToast('Failed to withdraw application. Please try again.', 'error');
  }
}

// View application (placeholder function)
function viewApplication(applicationId) {
  showToast('Viewing application details... (not yet implemented)', 'info');
}

// Set up new application button
function setupNewApplicationButton() {
  const newAppBtn = document.getElementById('new-application-btn');
  
  if (newAppBtn) {
    newAppBtn.addEventListener('click', (event) => {
      event.preventDefault();
      showToast('New application flow coming soon!', 'info');
    });
  }
}

// --- Navigation Handling ---

// Set up sidebar navigation
function setupSidebarNavigation() {
  // Set up sign out button
  const signOutBtn = document.getElementById('signout-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      await signOut();
    });
  }
  
  // Highlight active navigation item
  highlightActiveNavItem();
}

// Highlight active navigation item based on current page
function highlightActiveNavItem() {
  try {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
      const linkPath = new URL(link.href).pathname;
      const listItem = link.closest('li');
      
      if (currentPath === linkPath || (currentPath === '/' && linkPath.includes('dashboard'))) {
        listItem?.classList.add('active');
      } else {
        listItem?.classList.remove('active');
      }
    });
  } catch (error) {
    console.error('[navigation/highlight]', { error });
  }
}

// --- Auto-Initialization ---

// Initialize the appropriate page based on body ID
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('[init] Starting page initialization');
    
    // Set up navigation for all pages
    setupSidebarNavigation();
    
    // Initialize page-specific functionality
    const bodyId = document.body.id;
    
    switch (bodyId) {
      case 'dashboard-page':
        await initDashboard();
        break;
      case 'edit-profile-page':
        await initEditProfile();
        break;
      case 'applications-page':
        await initApplications();
        break;
      default:
        console.log('[init] No specific initialization for page:', bodyId);
    }
    
    console.log('[init] Page initialization complete');
  } catch (error) {
    console.error('[init] Page initialization failed:', error);
    showToast('Failed to initialize page. Please refresh and try again.', 'error');
  }
});

// --- Global Error Handling ---
window.addEventListener('error', (event) => {
  console.error('[global-error]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[unhandled-promise-rejection]', {
    reason: event.reason,
    promise: event.promise
  });
});

// --- Export functions for global access ---
// Make key functions available globally for onclick handlers
window.handleWithdrawApplication = handleWithdrawApplication;
window.viewApplication = viewApplication;