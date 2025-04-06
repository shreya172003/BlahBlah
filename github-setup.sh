#!/bin/bash

# GitHub Setup Script for BlahBlah Notes

echo "Setting up GitHub repository for BlahBlah Notes..."

# Initialize git repository if not already initialized
if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
fi

# Add all files
echo "Adding files to git..."
git add .

# Create initial commit
echo "Creating initial commit..."
git commit -m "Initial commit"

# Prompt for GitHub repository URL
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/blahblah-notes.git): " repo_url

# Add remote and push
if [ -n "$repo_url" ]; then
  echo "Adding remote repository..."
  git remote add origin $repo_url
  
  echo "Pushing to GitHub..."
  git push -u origin main
else
  echo "No repository URL provided. You can add it manually with:"
  echo "git remote add origin <repository-url>"
  echo "git push -u origin main"
fi

echo "Setup complete!" 