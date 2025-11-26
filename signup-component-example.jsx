/**
 * Example React/Next.js Signup Component
 * Shows how to use the Supabase client module in a real application
 */

import React, { useState } from 'react'
import { signUpUser } from './supabase-client-module'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await signUpUser(email, password, { 
        fullName,
        metadata: { signupSource: 'web' }
      })

      if (result.success) {
        setIsError(false)
        if (result.needsEmailConfirmation) {
          setMessage('Account created! Please check your email to confirm your account.')
        } else {
          setMessage('Account created successfully! You can now sign in.')
        }
        
        // Clear form
        setEmail('')
        setPassword('')
        setFullName('')
      } else {
        setIsError(true)
        setMessage(result.error)
      }
    } catch (error) {
      setIsError(true)
      setMessage('An unexpected error occurred. Please try again.')
      console.error('Signup error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name (Optional)
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            required
            minLength="6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password (min. 6 characters)"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading || !email || !password
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-4 rounded-md ${
            isError
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  )
}

// Alternative hook-based approach for more complex state management
export function useSignup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const signup = async (email, password, options = {}) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await signUpUser(email, password, options)
      
      if (result.success) {
        setSuccess(true)
        return result
      } else {
        setError(result.error)
        return result
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return { signup, loading, error, success }
}