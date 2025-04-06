@echo off
echo GitHub Setup Script for BlahBlah Notes

if not exist .git (
  echo Initializing git repository...
  git init
)

echo Adding files to git...
git add .

echo Creating initial commit...
git commit -m "Initial commit"

set /p repo_url=Enter your GitHub repository URL: 

if not "%repo_url%"=="" (
  echo Adding remote repository...
  git remote add origin %repo_url%
  
  echo Pushing to GitHub...
  git push -u origin main
) else (
  echo No repository URL provided. You can add it manually with:
  echo git remote add origin ^<repository-url^>
  echo git push -u origin main
)

echo Setup complete!
pause 