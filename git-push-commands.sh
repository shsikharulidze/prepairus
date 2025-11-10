#!/bin/bash

# Quick Git Push Commands for PrePair Authentication Updates
# Username: shsikharulidze

echo "🚀 Pushing PrePair authentication updates to GitHub..."
echo "=================================================="

# Add all files
echo "📁 Adding all files..."
git add .

# Check status
echo "📊 Current status:"
git status --short

# Commit with detailed message
echo "💾 Committing changes..."
git commit -m "Add authentication flow updates with profile setup

✨ New Features:
- Created profile.html for student profile setup page
- Auto-redirect authentication flow to profile.html
- Enhanced Google OAuth integration
- Loading screens with smooth animations

🔧 Authentication Updates:
- Updated login.html with session checking
- Updated apply.html with enhanced registration
- All redirects now point to https://prepairus.co/profile.html
- Automatic student profile creation for all sign-up methods

🎨 UI/UX Improvements:
- Professional toast notifications
- Form validation with visual feedback
- Mobile-responsive design
- Consistent PrePair design language

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to main branch
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Done! Changes pushed to GitHub successfully!"
echo "🌐 Check your repository: https://github.com/shsikharulidze/prepair-homepage"