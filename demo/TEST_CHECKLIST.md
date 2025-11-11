# PrePair MVP Test Checklist

## 🔐 Authentication Flow
- [ ] **Sign Up**: New users can create accounts with email/password
- [ ] **Google OAuth**: Users can sign up/in with Google
- [ ] **Email Verification**: Check if email confirmation is working (optional)
- [ ] **Session Persistence**: User stays logged in after page refresh
- [ ] **Auto Redirect**: Authenticated users redirected from auth pages to dashboard

## 🚀 Onboarding Flow  
- [ ] **Profile Redirect**: New users sent to profile.html after signup
- [ ] **Onboarding Block**: Users with incomplete profiles can't access other pages
- [ ] **Profile Completion**: Profile form saves with all fields
- [ ] **Avatar Upload**: Profile photo uploads to avatars bucket successfully
- [ ] **Onboarding Complete**: After first save, onboarding_complete = true
- [ ] **Dashboard Access**: Completed users can access dashboard

## 🏠 Dashboard Experience
- [ ] **Welcome Message**: Dashboard shows correct first name and avatar
- [ ] **Profile Completeness**: Banner shows if required fields missing
- [ ] **Featured Opportunity**: Mock opportunity loads and displays correctly
- [ ] **Navigation**: All nav links work from dashboard
- [ ] **Profile Banner**: Clicking banner goes to profile.html

## 👤 Profile Management
- [ ] **Load Existing Data**: Profile form populates with saved data
- [ ] **Edit Profile**: Can modify and re-save profile information
- [ ] **Avatar Update**: Can change profile photo successfully
- [ ] **Required Fields**: Form validates required fields (firstName, lastName, university, major)
- [ ] **Save Success**: Shows success message after saving
- [ ] **Data Persistence**: Profile data saves to student_profiles table

## 🎯 Opportunity Flow
- [ ] **Opportunity Detail**: /opportunity.html?id=... loads opportunity correctly
- [ ] **Questions Display**: Shows all questions from opportunities.questions json
- [ ] **Apply Button**: Links to apply-opportunity.html with correct ID
- [ ] **Already Applied**: Shows different state if user already applied

## 📝 Application Flow
- [ ] **Form Generation**: Questions render correctly from JSON (textarea, file)
- [ ] **File Upload**: Files upload to application-files/{user_id}/{opportunity_id}/
- [ ] **Answer Collection**: Text answers save as JSON keyed by question ID
- [ ] **Duplicate Prevention**: Prevents multiple applications to same opportunity
- [ ] **Success State**: Shows confirmation after successful application
- [ ] **Database Record**: Creates record in applications table

## 📋 Applications List
- [ ] **My Applications**: Shows user's submitted applications
- [ ] **Application Data**: Displays title, company, status, date
- [ ] **Detail View**: Can view answers and attachments for each application
- [ ] **File Links**: Attachment links work correctly

## ⚙️ Settings Page
- [ ] **Email Display**: Shows current user email
- [ ] **Password Reset**: Email/password users can request password reset
- [ ] **Google Account**: Google users see appropriate message
- [ ] **Sign Out**: Sign out button works correctly

## 🔒 Security & Data
- [ ] **File Permissions**: Users can only access their own files
- [ ] **RLS Policies**: Database queries respect Row Level Security
- [ ] **Files Manifest**: Uploads log to files_manifest table
- [ ] **Data Validation**: Forms validate input before submission

## 📱 Navigation & UX
- [ ] **Auth-Aware Nav**: Navigation changes based on login state
- [ ] **Guest Navigation**: Shows "Sign In" and "Apply" when logged out
- [ ] **User Navigation**: Shows Dashboard, Opportunities, etc when logged in
- [ ] **Mobile Responsive**: All pages work on mobile devices
- [ ] **Loading States**: Forms show loading spinners during submission
- [ ] **Error Messages**: Clear error messages for failed operations

## 🛠️ Technical Health
- [ ] **Console Errors**: No critical JavaScript errors
- [ ] **Database Errors**: Error messages include table/action context
- [ ] **File Upload Errors**: Clear feedback when uploads fail
- [ ] **Network Failures**: Graceful handling of connection issues

## 🔄 Edge Cases
- [ ] **Incomplete Profile**: Users can't bypass onboarding
- [ ] **Duplicate Applications**: Prevented with helpful message
- [ ] **Large File Upload**: Handles file size limits gracefully
- [ ] **Network Disconnect**: App handles offline scenarios
- [ ] **Invalid URLs**: 404 handling for bad opportunity IDs

---

## Quick Test Scenario
1. Sign up new account → Redirected to profile
2. Complete profile with avatar → Onboarding complete
3. View dashboard → See welcome + opportunity
4. Click opportunity → View details and questions
5. Submit application → Upload files + answers
6. Check applications list → See submitted application
7. Visit settings → Confirm account details
8. Sign out → Return to public state

**Expected Result**: Complete flow works without errors, data persists correctly.