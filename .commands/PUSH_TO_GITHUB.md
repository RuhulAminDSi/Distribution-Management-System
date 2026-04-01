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
# Backend tests
cd backend && npm test

# Frontend build check
cd frontend && npm run build

# Health check
curl http://localhost:5000/api/health
```

### Step 3: Commit & Push
```bash
# Add changes
git add .

# Commit with message
git commit -m "fix: [description]"

# Push to remote
git push origin main
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
1. Verify all changes are committed
2. Run build to ensure no errors
3. Push to main branch
4. Verify remote update

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | `taskkill //PID <PID> //F` |
| Build fails | Check error messages, fix syntax |
| Test fails | Review test expectations |
| Push rejected | Pull latest changes first |