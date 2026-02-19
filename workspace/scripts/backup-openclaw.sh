#!/bin/bash

# OpenClaw Backup Script
# Backup .openclaw folder to GitHub (excluding sensitive files)

REPO_DIR="/Users/hsieh/.openclaw-backup"
SOURCE_DIR="/Users/hsieh/.openclaw"
GIT_REPO="https://github.com/panggihsieh/clawbackup.git"

# Files and folders to exclude (sensitive data)
EXCLUDE_PATTERN=(
    "--exclude=.git"
    "--exclude=agents/main/agent/auth.json"
    "--exclude=agents/main/agent/auth-profiles.json"
    "--exclude=agents/main/agent/models.json"
    "--exclude=agents/main/sessions/*.jsonl"
    "--exclude=credentials"
    "--exclude=identity"
    "--exclude=browser"
    "--exclude=logs"
    "--exclude=openclaw.json"
    "--exclude=openclaw.json.bak*"
    "--exclude=exec-approvals.json"
    "--exclude=*.db"
    "--exclude=*-journal"
    "--exclude=media/browser/*"
)

# Create backup dir if not exists
mkdir -p "$REPO_DIR"

# Clean repo directory
cd "$REPO_DIR"
rm -rf .git * 

2>/dev/null# Initialize git if needed
git init
git checkout -b main 2>/dev/null || true

# Copy files (excluding sensitive data)
rsync -av "${EXCLUDE_PATTERN[@]}" "$SOURCE_DIR/" "$REPO_DIR/"

# Add, commit and push
git add .
git commit -m "Backup $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || echo "No changes to commit"

# Set remote and pull (handle conflicts)
git remote add origin "$GIT_REPO" 2>/dev/null || true
git pull origin main --allow-unrelated-histories --rebase 2>/dev/null || true
git push -u origin main

echo "Backup completed at $(date)"
