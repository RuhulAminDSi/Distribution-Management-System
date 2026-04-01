# Code Review, Test & Push Workflow

This document describes the workflow for reviewing code changes, running tests, and pushing to GitHub.

---

## Quick Commands

### Step 1: Review Code Changes
```bash
git diff
git status
git log --oneline -5
```

### Step 2: Run Tests
```bash
# Run test script
bash .test_script/test.sh

# Health check
curl http://localhost:5000/api/health
```

### Step 3: Commit to dev Branch
```bash
# Add changes (excluding problematic files)
git add .gitignore AGENTS.md .bug_fixes/ .commands/ .markdown_files/ .test_script/ backend/ frontend/ database/ scripts/

# Commit with message
git commit -m "fix: [description]"

# Push to dev branch
git push origin dev
```

### Step 4: Push dev to main (if needed)
```bash
# Force push dev to main (main is behind dev)
git push origin dev:main --force
```

---

## Detailed Workflow

### Code Review
1. Run `git diff` to see all changes
2. Check modified files match the fix
3. Verify no secrets or sensitive data exposed
4. Ensure code follows AGENTS.md conventions

### Testing
1. Start backend: `npm run dev:backend`
2. Start frontend: `npm run dev:frontend`
3. Test the specific feature that was fixed
4. Check for console errors

### Push to GitHub
1. All changes committed to dev branch first
2. Run build to ensure no errors: `cd frontend && npm run build`
3. Push dev to remote: `git push origin dev`
4. If syncing to main: `git push origin dev:main --force`

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | `netstat -ano \| findstr :5000` then `taskkill //PID <PID> //F` |
| Build fails | Check error messages, fix syntax |
| Test fails | Review test expectations |
| Push rejected | Pull latest changes first |
| nul file error | `rm -f nul` before git add |

---

## Important Notes

- All development happens on `dev` branch
- Push to `dev` first, then sync to `main` if needed
- Run `bash .test_script/test.sh` to verify 18 tests