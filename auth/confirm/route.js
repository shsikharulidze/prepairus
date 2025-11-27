import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Email confirmation error:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/signin?error=confirmation_failed`)
      }

      if (data?.user) {
        console.log('User confirmed successfully:', data.user.email)
        
        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from('student_profiles')
          .select('onboarding_complete')
          .eq('user_id', data.user.id)
          .single()

        if (profileError) {
          console.error('Profile check error:', profileError.message)
          // Create minimal profile if doesn't exist
          await supabase
            .from('student_profiles')
            .upsert({
              user_id: data.user.id,
              email: data.user.email,
              onboarding_complete: false
            })
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
        }

        if (!profile?.onboarding_complete) {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
        }

        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (err) {
      console.error('Confirmation process error:', err)
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=confirmation_failed`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${requestUrl.origin}/signin?error=no_code`)
}