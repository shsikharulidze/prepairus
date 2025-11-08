#!/bin/bash

# Navigate to the PrePair directory
cd "/Users/shotisikharulidze/Desktop/PrePair"

# Add all changes
git add .

# Commit with message
git commit -m "Update registration info page to display all user details - IP address, browser, timestamp, access code used

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to origin main
git push origin main

echo "Git commit and push completed successfully!"