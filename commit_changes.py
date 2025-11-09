#!/usr/bin/env python3

import subprocess
import os
import sys

def run_command(command, cwd=None):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, 
                              capture_output=True, text=True, check=True)
        print(f"✓ {command}")
        if result.stdout:
            print(result.stdout)
        return result
    except subprocess.CalledProcessError as e:
        print(f"✗ {command}")
        print(f"Error: {e.stderr}")
        return None

def main():
    # Change to the PrePair directory
    prepair_dir = '/Users/shotisikharulidze/Desktop/PrePair'
    
    if not os.path.exists(prepair_dir):
        print(f"Error: Directory {prepair_dir} does not exist")
        sys.exit(1)
    
    print(f"Working in directory: {prepair_dir}")
    
    # Check if it's a git repository
    git_check = run_command("git status", prepair_dir)
    if git_check is None:
        print("Error: Not a git repository or git not available")
        sys.exit(1)
    
    # Add all changes
    add_result = run_command("git add .", prepair_dir)
    if add_result is None:
        print("Failed to add files")
        sys.exit(1)
    
    # Commit with message
    commit_message = """Add Google authentication to login and signup pages

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"""
    
    commit_cmd = f'git commit -m "{commit_message}"'
    commit_result = run_command(commit_cmd, prepair_dir)
    if commit_result is None:
        print("Failed to commit changes")
        sys.exit(1)
    
    # Push to origin main
    push_result = run_command("git push origin main", prepair_dir)
    if push_result is None:
        print("Failed to push changes")
        sys.exit(1)
    
    print("✅ Git commit and push completed successfully!")

if __name__ == "__main__":
    main()