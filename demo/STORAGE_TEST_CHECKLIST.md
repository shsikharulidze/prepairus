# PrePair Storage Implementation Test Checklist

## 📋 Overview
This checklist covers testing the storage implementation with proper security and UX for avatars (public) and application files (private).

## 🔐 Avatar Upload Tests (Public Bucket)

### ✅ Basic Upload Flow
- [ ] **Upload Avatar**: Navigate to profile.html, click "Change Photo", select an image
- [ ] **File Validation**: Try uploading files >5MB (should show error)
- [ ] **Type Validation**: Try uploading non-image files (should show error)  
- [ ] **Success State**: Valid image uploads show success message and preview
- [ ] **Profile Save**: Avatar URL gets written to student_profiles.avatar_url
- [ ] **UI Updates**: Both welcome section and form avatar update immediately

### ✅ Public Access Test
- [ ] **Public URL**: After upload, copy avatar URL from network tab
- [ ] **Logged Out Access**: Sign out, paste URL in new tab (should load image)
- [ ] **Cross-Origin**: URL should work when accessed directly without authentication

### ✅ Error Handling
- [ ] **Upload Failure**: Simulate network failure (should show inline error)
- [ ] **Large File**: Upload 10MB+ file (should show size error)
- [ ] **Invalid Type**: Upload .txt file (should show type error)
- [ ] **Button State**: Upload button disables during upload, shows "Uploading..."

## 🔒 Application File Tests (Private Bucket)

### ✅ Basic Upload Flow
- [ ] **File Questions**: Go to apply-opportunity.html, find opportunity with file questions
- [ ] **Multiple Files**: Upload different file types (PDF, DOC, TXT, JPG)
- [ ] **Upload Progress**: Each file shows uploading spinner then success checkmark
- [ ] **File Storage**: Files stored in `application-files/{user_id}/{opportunity_id}/` structure
- [ ] **Application Save**: Attachments array properly saved to applications table

### ✅ Private Security Test
- [ ] **Direct Access Blocked**: Copy file path, try accessing directly (should fail)
- [ ] **Signed URL Generation**: From applications.html, click file download link
- [ ] **Signed URL Works**: Generated signed URL opens file correctly
- [ ] **URL Expiration**: Wait 10 minutes, try same signed URL (should fail)
- [ ] **Cross-User Block**: User A cannot access User B's files via any method

### ✅ Download Functionality
- [ ] **Applications List**: Navigate to applications.html after submitting application
- [ ] **File Links**: File attachments show as download links with file names
- [ ] **Download Click**: Clicking download generates signed URL and opens file
- [ ] **Multiple Downloads**: Each click generates fresh signed URL
- [ ] **Error Handling**: Deleted file shows proper error message

## ⚠️ Error Scenarios

### ✅ Upload Failures
- [ ] **Network Disconnect**: Disable network during upload (shows error, allows retry)
- [ ] **File Size**: 15MB file upload (shows clear size limit error)
- [ ] **Invalid Extension**: .exe file upload (shows type restriction error)
- [ ] **Bucket Full**: Simulate storage limit (shows meaningful error)

### ✅ Download Failures  
- [ ] **Missing File**: Delete file from bucket, try download (shows file not found)
- [ ] **Expired URL**: Use old signed URL (shows access denied)
- [ ] **Wrong User**: Try accessing other user's files (shows permission denied)
- [ ] **Network Issues**: Download during network problems (shows retry option)

## 📱 UI/UX Validation

### ✅ Loading States
- [ ] **Avatar Upload**: Shows spinner overlay on avatar during upload
- [ ] **File Upload**: Shows progress indicator for each file
- [ ] **Button States**: Upload buttons disable during progress
- [ ] **Form Submission**: Submit button shows loading during application save

### ✅ Inline Feedback
- [ ] **Success Messages**: "Avatar uploaded successfully!" appears after avatar upload
- [ ] **File Success**: "✓ filename uploaded successfully" appears after file upload  
- [ ] **Error Display**: Red error text appears under input on upload failure
- [ ] **Error Clearing**: Errors disappear when user selects new file

### ✅ Visual Consistency
- [ ] **Dark Theme**: All upload UI matches existing dark premium style
- [ ] **File Icons**: File downloads show appropriate icons (📎)
- [ ] **Spacing**: Upload areas follow existing form spacing patterns
- [ ] **Responsive**: File upload works properly on mobile devices

## 🔍 Technical Validation

### ✅ Structured Logging
- [ ] **Upload Errors**: Console shows `[storage/avatars/upload]` error context
- [ ] **Download Errors**: Console shows `[storage/signed-url]` error context  
- [ ] **File Errors**: Console shows `[storage/application-files/upload]` context
- [ ] **Cleanup Logging**: File operations log bucket, path, and error details

### ✅ Database Integration
- [ ] **Avatar URL**: student_profiles.avatar_url updates after avatar upload
- [ ] **File Paths**: applications.answers stores file paths for file questions
- [ ] **Attachments**: applications.attachments stores file metadata array
- [ ] **Upsert Logic**: Profile updates use `{ onConflict: 'user_id' }` pattern

## 🧪 Edge Case Tests

### ✅ Concurrent Operations
- [ ] **Multiple Files**: Upload 3 files simultaneously (all succeed or fail gracefully)
- [ ] **Avatar + Form**: Upload avatar while filling form (no conflicts)
- [ ] **Multiple Users**: Two users upload to same opportunity (files isolated)

### ✅ Data Integrity
- [ ] **Profile Refresh**: Reload profile.html (avatar displays from getAvatarUrl())
- [ ] **Application Refresh**: Reload applications.html (files still downloadable)
- [ ] **File Metadata**: File names, sizes stored correctly in applications table
- [ ] **Path Structure**: Files stored in correct user/opportunity folders

### ✅ Browser Compatibility
- [ ] **File API Support**: File uploads work in Chrome, Firefox, Safari
- [ ] **Signed URLs**: Downloads work across different browsers
- [ ] **Error Handling**: Graceful fallbacks for unsupported browsers

## 🎯 Quick Test Scenario

1. **Setup**: Sign up new user account
2. **Avatar**: Upload profile photo → verify public URL access  
3. **Apply**: Find opportunity with file questions
4. **Upload**: Attach resume PDF and cover letter DOC
5. **Submit**: Complete application with all files
6. **Verify**: Check applications.html shows downloadable files
7. **Security**: Sign out, verify direct file URLs fail
8. **Download**: Sign back in, download files via signed URLs

## ✅ Expected Results

- ✅ **Avatar**: Public URL works logged out, updates across all pages
- ✅ **Files**: Private files require signed URLs, download correctly
- ✅ **Errors**: Clear inline errors, no console failures
- ✅ **UX**: Smooth loading states, immediate visual feedback
- ✅ **Security**: Public/private access properly enforced
- ✅ **Integration**: Database updates correctly, files persist across sessions

## 🚫 Failure Modes

If any test fails:
1. Check browser console for structured error logs
2. Verify Supabase bucket policies match specification
3. Confirm file paths follow expected structure
4. Test network connectivity and file permissions
5. Validate file size/type restrictions are working

---

**Complete this checklist before considering the storage implementation production-ready.**