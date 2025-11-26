/**
 * Supabase Client Module - TypeScript Version
 * Complete setup for authentication with email/password signup
 * Safe for browser environments and Next.js applications
 */

import { createClient, SupabaseClient, User, Session, AuthError } from '@supabase/supabase-js'

// Supabase configuration
const SUPABASE_URL = 'https://aezybthbsmpihbyzfiqi.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlenlidGhic21waWhieXpmaXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTUwNTUsImV4cCI6MjA3ODEzMTA1NX0.ojh8dzVpF62hqU_MrXI9EfCBJGX74NMse_1t55m32go'

// Type definitions
interface SignupOptions {
  fullName?: string
  metadata?: Record<string, any>
}

interface SignupResult {
  success: true
  user: User
  session: Session | null
  needsEmailConfirmation: boolean
}

interface SignupError {
  success: false
  error: string
  originalError: string
}

type SignupResponse = SignupResult | SignupError

interface AuthResponse {
  success: boolean
  error?: string
}

// Create and configure Supabase client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * Sign up a new user with email and password
 * @param email - User's email address
 * @param password - User's password (min 6 characters)
 * @param options - Additional options (optional)
 * @returns Promise resolving to signup result with user data or error
 */
export async function signUpUser(
  email: string, 
  password: string, 
  options: SignupOptions = {}
): Promise<SignupResponse> {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required')
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address')
    }

    console.log('🔄 Attempting to sign up user:', email)
    
    // Perform signup
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        // Add any additional user metadata here
        data: {
          full_name: options.fullName || '',
          ...options.metadata
        }
      }
    })

    if (error) {
      console.error('❌ Signup failed:', error.message)
      throw error
    }

    if (data.user) {
      console.log('✅ Signup successful!')
      console.log('📧 User email:', data.user.email)
      console.log('🆔 User ID:', data.user.id)
      
      // Check if email confirmation is required
      if (!data.user.email_confirmed_at) {
        console.log('📬 Email confirmation required - check your inbox')
      } else {
        console.log('✅ Email already confirmed')
      }
      
      return {
        success: true,
        user: data.user,
        session: data.session,
        needsEmailConfirmation: !data.user.email_confirmed_at
      }
    }

    // This shouldn't happen, but handle edge case
    throw new Error('Signup completed but no user data returned')

  } catch (error) {
    // Enhanced error handling with user-friendly messages
    const authError = error as AuthError
    let friendlyMessage = authError.message
    
    if (authError.message.includes('already registered')) {
      friendlyMessage = 'An account with this email already exists. Please sign in instead.'
    } else if (authError.message.includes('Password should be at least')) {
      friendlyMessage = 'Password must be at least 6 characters long.'
    } else if (authError.message.includes('Invalid email')) {
      friendlyMessage = 'Please enter a valid email address.'
    } else if (authError.message.includes('signup is disabled')) {
      friendlyMessage = 'Account creation is currently disabled. Please contact support.'
    } else if (authError.message.includes('rate limit')) {
      friendlyMessage = 'Too many attempts. Please wait a moment and try again.'
    }

    console.error('❌ Signup error:', authError.message)
    
    return {
      success: false,
      error: friendlyMessage,
      originalError: authError.message
    }
  }
}

/**
 * Additional helper functions for common authentication tasks
 */

// Get current user session
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Error getting session:', (error as Error).message)
    return null
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting user:', (error as Error).message)
    return null
  }
}

// Sign out user
export async function signOutUser(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    console.log('✅ User signed out successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Sign out failed:', (error as Error).message)
    return { success: false, error: (error as Error).message }
  }
}

// Listen to auth state changes
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback)
}

// Example usage function
export async function exampleSignup(): Promise<void> {
  const result = await signUpUser('test@example.com', 'securepassword123', {
    fullName: 'Test User',
    metadata: { source: 'web' }
  })
  
  if (result.success) {
    console.log('User signed up successfully:', result.user.email)
    if (result.needsEmailConfirmation) {
      console.log('Please check email for confirmation link')
    }
  } else {
    console.log('Signup failed:', result.error)
  }
}

// Export the configured client as default
export default supabase