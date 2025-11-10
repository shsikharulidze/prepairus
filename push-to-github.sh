#!/bin/bash

# PrePair GitHub Push Script
# This script commits and pushes the authentication flow updates to GitHub

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 PrePair GitHub Push Script${NC}"
echo -e "${BLUE}================================${NC}"
echo

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    echo -e "${YELLOW}💡 Run 'git init' first or navigate to your git repository${NC}"
    exit 1
fi

# Check git status
echo -e "${BLUE}📊 Checking git status...${NC}"
git status
echo

# Add all changes
echo -e "${BLUE}📝 Adding all changes to staging...${NC}"
git add .

# Check what's being committed
echo -e "${BLUE}📋 Files to be committed:${NC}"
git diff --cached --name-only
echo

# Create commit message
COMMIT_MESSAGE="Add authentication flow updates

✨ Features Added:
- Created profile.html for student profile setup
- Updated login.html with auto-redirect to profile page
- Updated apply.html with enhanced registration flow
- Added loading screens for better UX
- Implemented Google OAuth redirect to profile.html

🔧 Authentication Improvements:
- Auto-redirect logged-in users to profile page
- Enhanced student profile creation for all sign-up methods
- Updated all redirect URLs to https://prepairus.co/profile.html
- Added session checking on auth pages
- Improved error handling and user feedback

🎨 UI/UX Enhancements:
- Smooth loading animations and transitions
- Professional toast notifications
- Mobile-responsive design
- Form validation with visual feedback
- Consistent PrePair design language

🔗 Integration:
- Supabase SDK v2 integration
- student_profiles table support
- Google user metadata handling
- Backward compatibility maintained

🤖 Generated with Claude Code (https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Show commit message preview
echo -e "${YELLOW}📝 Commit message preview:${NC}"
echo "----------------------------------------"
echo "$COMMIT_MESSAGE"
echo "----------------------------------------"
echo

# Ask for confirmation
read -p "$(echo -e "${YELLOW}❓ Do you want to commit with this message? (y/N): ${NC}")" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Commit cancelled${NC}"
    exit 1
fi

# Commit changes
echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "$COMMIT_MESSAGE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully committed changes!${NC}"
else
    echo -e "${RED}❌ Commit failed!${NC}"
    exit 1
fi

# Check if we have a remote repository
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  No remote repository configured${NC}"
    echo -e "${YELLOW}💡 Add a remote with: git remote add origin <repository-url>${NC}"
    exit 1
fi

echo -e "${BLUE}🌐 Remote repository: ${NC}$REMOTE_URL"
echo

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}🌿 Current branch: ${NC}$CURRENT_BRANCH"
echo

# Ask if user wants to push
read -p "$(echo -e "${YELLOW}❓ Push to remote repository? (y/N): ${NC}")" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Push skipped. Changes committed locally.${NC}"
    echo -e "${BLUE}💡 To push later, run: git push origin $CURRENT_BRANCH${NC}"
    exit 0
fi

# Push to remote
echo -e "${BLUE}🚀 Pushing to remote repository...${NC}"
git push origin "$CURRENT_BRANCH"

if [ $? -eq 0 ]; then
    echo
    echo -e "${GREEN}🎉 SUCCESS! Changes pushed to GitHub!${NC}"
    echo
    echo -e "${GREEN}✅ Authentication flow updates are now live${NC}"
    echo -e "${GREEN}✅ Profile.html created and deployed${NC}"
    echo -e "${GREEN}✅ Login/registration redirects updated${NC}"
    echo
    echo -e "${BLUE}🔗 Next steps:${NC}"
    echo -e "${BLUE}  1. Check your GitHub repository for the new commits${NC}"
    echo -e "${BLUE}  2. Test the authentication flow on your live site${NC}"
    echo -e "${BLUE}  3. Ensure Supabase auth policies are configured${NC}"
    echo
    echo -e "${YELLOW}🌍 If using GitHub Pages, changes will be live at:${NC}"
    echo -e "${YELLOW}   https://yourusername.github.io/repository-name/${NC}"
    echo
else
    echo -e "${RED}❌ Push failed!${NC}"
    echo -e "${YELLOW}💡 Check your internet connection and repository permissions${NC}"
    exit 1
fi