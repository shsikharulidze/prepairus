/**
 * Supabase Authentication Module v1.0
 * Complete email/password signup with enhanced error handling
 * Safe for Next.js and browser environments
 */

// Import Supabase (for ES modules) or use global supabase for browser
let supabase;

// Browser environment - use global supabase
if (typeof window !== 'undefined' && window.supabase) {
  const SUPABASE_URL = 'https://aezybthbsmpihbyzfiqi.supabase.co'
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlenlidGhic21waWhieXpmaXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTUwNTUsImV4cCI6MjA3ODEzMTA1NX0.ojh8dzVpF62hqU_MrXI9EfCBJGX74NMse_1t55m32go'
  
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
  
  console.log('✅ Supabase client initialized for browser environment')
}

/**
 * Email/Password Sign Up Function
 * @param {string} email - User's email address
 * @param {string} password - User's password (minimum 6 characters)
 * @param {Object} options - Additional signup options
 * @returns {Promise<Object>} Signup result with success/error data
 */
async function signUpUser(email, password, options = {}) {
  try {
    console.log('🔄 [Supabase Auth] Starting signup process for:', email)
    
    // Input validation
    if (!email || typeof email !== 'string') {
      throw new Error('Valid email address is required')
    }
    
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required')
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address')
    }
    
    // Check if supabase client is available
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    console.log('🔄 [Supabase Auth] Calling supabase.auth.signUp()')
    
    // Perform the signup
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        data: {
          full_name: options.fullName || '',
          signup_source: 'web',
          ...options.metadata
        }
      }
    })
    
    // Handle Supabase errors
    if (error) {
      console.error('❌ [Supabase Auth] Signup error:', error.message)
      console.error('❌ [Supabase Auth] Error details:', error)
      throw error
    }
    
    // Log successful data
    if (data) {
      console.log('✅ [Supabase Auth] Signup successful!')
      console.log('📧 [Supabase Auth] User email:', data.user?.email)
      console.log('🆔 [Supabase Auth] User ID:', data.user?.id)
      console.log('📄 [Supabase Auth] Full data:', data)
      
      // Check email confirmation status
      const needsConfirmation = data.user && !data.user.email_confirmed_at
      if (needsConfirmation) {
        console.log('📬 [Supabase Auth] Email confirmation required')
      }
      
      return {
        success: true,
        user: data.user,
        session: data.session,
        needsEmailConfirmation: needsConfirmation,
        message: needsConfirmation 
          ? 'Account created! Please check your email to confirm your account.'
          : 'Account created successfully! You are now signed in.'
      }
    }
    
    // Edge case - no data and no error
    throw new Error('Signup completed but no data was returned')
    
  } catch (error) {
    console.error('❌ [Supabase Auth] Signup failed:', error.message)
    
    // Enhanced error handling with user-friendly messages
    let friendlyMessage = error.message
    let errorCode = error.code || 'unknown'
    
    // Map common Supabase errors to friendly messages
    if (error.message.includes('already registered') || error.message.includes('User already registered')) {
      friendlyMessage = 'An account with this email already exists. Please sign in instead.'
      errorCode = 'user_already_exists'
    } else if (error.message.includes('Password should be at least')) {
      friendlyMessage = 'Password must be at least 6 characters long.'
      errorCode = 'weak_password'
    } else if (error.message.includes('Invalid email')) {
      friendlyMessage = 'Please enter a valid email address.'
      errorCode = 'invalid_email'
    } else if (error.message.includes('signup is disabled')) {
      friendlyMessage = 'Account creation is currently disabled. Please contact support.'
      errorCode = 'signup_disabled'
    } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
      friendlyMessage = 'Too many signup attempts. Please wait a moment and try again.'
      errorCode = 'rate_limited'
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      friendlyMessage = 'Network error. Please check your connection and try again.'
      errorCode = 'network_error'
    }
    
    return {
      success: false,
      error: friendlyMessage,
      errorCode: errorCode,
      originalError: error.message,
      details: error
    }
  }
}

/**
 * Additional helper functions for authentication
 */

// Get current session
async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('[Supabase Auth] Session error:', error.message)
      return null
    }
    return session
  } catch (error) {
    console.error('[Supabase Auth] Failed to get session:', error.message)
    return null
  }
}

// Get current user
async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('[Supabase Auth] User error:', error.message)
      return null
    }
    return user
  } catch (error) {
    console.error('[Supabase Auth] Failed to get user:', error.message)
    return null
  }
}

// Sign out
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    console.log('✅ [Supabase Auth] User signed out successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ [Supabase Auth] Sign out failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Test function for debugging
async function testSignup() {
  console.log('🧪 [Supabase Auth] Testing signup with dummy data...')
  const result = await signUpUser('test@example.com', 'testpassword123')
  console.log('🧪 [Supabase Auth] Test result:', result)
  return result
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    signUpUser,
    getCurrentSession,
    getCurrentUser,
    signOut,
    testSignup,
    supabase
  }
} else if (typeof window !== 'undefined') {
  // Browser environment - attach to window
  window.SupabaseAuth = {
    signUpUser,
    getCurrentSession,
    getCurrentUser,
    signOut,
    testSignup,
    supabase
  }
  
  console.log('✅ [Supabase Auth] Module loaded and attached to window.SupabaseAuth')
  console.log('💡 [Supabase Auth] Try calling SupabaseAuth.testSignup() in console')
}