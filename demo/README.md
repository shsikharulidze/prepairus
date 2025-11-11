# PrePair - Student-Business Matching Platform

A complete, production-ready platform connecting students with internship opportunities at local businesses.

## Features

- **Dark Premium Design**: Professional UI with glassy cards and smooth animations
- **Complete Authentication**: Email/password + Google OAuth with Supabase
- **Dynamic Navigation**: Auth-aware header that changes based on user state
- **Student Dashboard**: Welcome card, profile completeness tracking, featured opportunities
- **Profile Management**: Editable profiles with avatar uploads
- **Opportunity Browsing**: View detailed opportunity information and requirements
- **Application System**: Complete application flow with file uploads and form submissions
- **Real-time Updates**: Live status tracking and notifications

## File Structure

```
PrePair/
├── shared.js              # Global utilities and navigation
├── dashboard.html          # Main student landing page
├── signin.html            # Sign in page
├── apply.html             # Sign up page  
├── profile.html           # Editable student profile
├── opportunity.html       # Opportunity details
├── apply-opportunity.html # Application submission form
├── applications.html      # User's application history
├── settings.html          # Account management
├── supabase.sql          # Database schema and setup
└── README.md             # This file
```

## Setup Instructions

### 1. Database Setup
```sql
-- Run this in Supabase SQL Editor
-- Copy contents of supabase.sql and execute
```

### 2. Storage Setup
The SQL script automatically creates:
- `avatars` bucket for profile images (public)
- `application-files` bucket for resume/essay uploads (private)

### 3. Authentication Setup
- Google OAuth is pre-configured
- Email confirmation can be disabled in Supabase Auth settings for development

### 4. Deploy
```bash
# Commit all changes
git add .
git commit -m "Complete PrePair platform refactor"
git push origin main

# Files will be available at:
# - Dashboard: /dashboard.html
# - Sign In: /signin.html
# - Apply: /apply.html
```

## Navigation Flow

### Guest Users
- Homepage → Sign In / Apply
- After auth → Dashboard

### Authenticated Users  
- Dashboard → Profile, Opportunities, Applications, Settings
- Sign Out → Homepage

## Key Components

### Dashboard (`dashboard.html`)
- Welcome card with user avatar and greeting
- Profile completeness banner if missing fields
- Featured opportunity showcase
- Direct links to complete profile or apply

### Authentication (`signin.html`, `apply.html`)
- Email/password and Google OAuth
- Auto-redirects if already signed in
- Profile creation on signup
- Error handling and loading states

### Profile (`profile.html`)
- Editable form with all student details
- Avatar upload to Supabase Storage
- Real-time save with success/error feedback
- Auto-populates with existing data

## Test Checklist

### Authentication Flow
- [ ] Sign up with email creates account and profile
- [ ] Sign up with Google creates account and profile  
- [ ] Sign in with email redirects to dashboard
- [ ] Sign in with Google redirects to dashboard
- [ ] Logged-in users can't access auth pages
- [ ] Logged-out users can't access protected pages

### Profile Management
- [ ] Profile form loads existing data
- [ ] Profile saves successfully with all fields
- [ ] Avatar upload works and displays
- [ ] Profile completeness banner shows/hides correctly
- [ ] Sign out works from profile page

### Dashboard Experience
- [ ] Welcome message shows correct name
- [ ] Avatar displays (uploaded or initials)
- [ ] Featured opportunity loads and displays
- [ ] Navigation links work correctly
- [ ] Profile banner shows for incomplete profiles

### Navigation
- [ ] Auth-aware header updates correctly
- [ ] All navigation links work
- [ ] Back buttons work on auth pages
- [ ] Mobile navigation works

### Data Persistence
- [ ] User profiles save to database
- [ ] File uploads save to storage
- [ ] Auth state persists across page loads
- [ ] Profile data loads correctly

## Technical Details

### Authentication
- Supabase Auth with RLS policies
- Session-based redirects
- Google OAuth integration
- Profile auto-creation on signup

### Database Schema
- `student_profiles`: User profile data
- `opportunities`: Job/internship listings  
- `applications`: User submissions
- RLS policies for data security

### Storage
- `avatars`: Public profile images
- `application-files`: Private user uploads
- Bucket policies for user-specific access

### Styling
- CSS custom properties for theming
- Responsive design with mobile support
- Dark gradient backgrounds
- Glassy card effects with backdrop-filter

## Error Handling

- Form validation with inline errors
- Network error handling
- File upload error handling
- Auth error messages
- Graceful fallbacks for missing data

## Security Features

- Row Level Security on all tables
- User-specific file access policies
- Input validation and sanitization
- CSRF protection via Supabase
- Secure file upload paths

This platform is production-ready with proper error handling, security measures, and a complete user experience flow.