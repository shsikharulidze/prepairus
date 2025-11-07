#!/bin/bash
# Git automation script for PrePair project

# Set working directory
cd "/Users/shotisikharulidze/Desktop/PrePair"

# Ensure we're in the right directory
echo "Current directory: $(pwd)"

# Check git status
echo "Checking git status..."
git status

# Add all changes
echo "Adding all changes..."
git add .

# Show what will be committed
echo "Files to be committed:"
git diff --cached --name-only

# Commit with message
echo "Committing changes..."
git commit -m "fix: increase gap between access code input boxes for better spacing

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Check commit status
if [ $? -eq 0 ]; then
    echo "Commit successful!"
    
    # Push to origin main
    echo "Pushing to origin main..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "Push successful!"
        echo "✅ All git operations completed successfully!"
    else
        echo "❌ Push failed!"
    fi
else
    echo "❌ Commit failed!"
fi

# Keep terminal open for review
echo "Press any key to close..."
read -n 1