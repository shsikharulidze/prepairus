const { execSync } = require('child_process');
const path = require('path');

try {
    // Change to the PrePair directory
    const prepairDir = '/Users/shotisikharulidze/Desktop/PrePair';
    process.chdir(prepairDir);
    
    console.log('Current directory:', process.cwd());
    
    // Execute git commands
    console.log('Adding files...');
    execSync('git add .', { stdio: 'inherit' });
    
    console.log('Committing changes...');
    const commitMessage = `fix: increase gap between access code input boxes for better spacing

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
    
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    console.log('Pushing to origin main...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('Git commit and push completed successfully!');
    
} catch (error) {
    console.error('Error executing git commands:', error.message);
    process.exit(1);
}