#!/bin/bash
# IONOS Auto-Deploy Script for NOCPC Concessions Inventory
# 
# This script automatically pulls latest code from GitHub
# 
# Usage: ./deploy.sh
# Or add to crontab: */5 * * * * /home/u12345678/nola-park-inventory/deploy.sh

# Configuration
REPO_PATH="/home/u12345678/htdocs/nola-park-inventory"
LOG_FILE="$REPO_PATH/deploy.log"
GITHUB_BRANCH="main"

# Logging function
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Start deployment
log_message "========== DEPLOYMENT START =========="

# Navigate to repo
cd "$REPO_PATH" || {
    log_message "ERROR: Could not navigate to $REPO_PATH"
    exit 1
}

log_message "Working directory: $(pwd)"

# Check if git is available
if ! command -v git &> /dev/null; then
    log_message "ERROR: Git is not installed"
    exit 1
fi

log_message "Git version: $(git --version)"

# Fetch latest changes
log_message "Fetching latest changes from GitHub..."
git fetch origin "$GITHUB_BRANCH" 2>&1 | while read line; do
    log_message "FETCH: $line"
done

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log_message "Current branch: $CURRENT_BRANCH"

# Pull latest changes
if [ "$CURRENT_BRANCH" = "$GITHUB_BRANCH" ]; then
    log_message "Pulling latest code from origin/$GITHUB_BRANCH..."
    if git pull origin "$GITHUB_BRANCH" 2>&1 | tee -a "$LOG_FILE"; then
        log_message "✓ Successfully pulled latest code"
    else
        log_message "✗ Error pulling code"
        exit 1
    fi
else
    log_message "WARNING: Not on $GITHUB_BRANCH branch, switching..."
    git checkout "$GITHUB_BRANCH"
    git pull origin "$GITHUB_BRANCH" 2>&1 | tee -a "$LOG_FILE"
fi

# Set proper permissions
log_message "Setting file permissions..."
chmod -R 755 "$REPO_PATH" 2>&1 | tee -a "$LOG_FILE"
chmod -R 644 "$REPO_PATH/public"/* 2>&1 | tee -a "$LOG_FILE"

# Get current commit
COMMIT=$(git rev-parse --short HEAD)
log_message "Current commit: $COMMIT"

# Get commit message
COMMIT_MSG=$(git log -1 --pretty=%B)
log_message "Latest commit message: $COMMIT_MSG"

# Verify files are in place
if [ -f "$REPO_PATH/public/index.html" ]; then
    log_message "✓ Main app file found (index.html)"
else
    log_message "✗ ERROR: index.html not found!"
    exit 1
fi

log_message "========== DEPLOYMENT SUCCESS =========="
log_message "App is now live!"
log_message ""

# Optional: Send notification (if you have mail configured)
# echo "Deployment successful at $(date)" | mail -s "NOCPC Deploy Success" yourmail@example.com

exit 0
