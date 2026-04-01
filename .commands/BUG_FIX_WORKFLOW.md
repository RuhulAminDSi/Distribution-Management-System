# Bug Fix Workflow - Custom Commands

This document describes the workflow and instructions for fixing bugs in the DMS project.

---

## Bug Fix Instructions Template

When fixing any bug in this project, follow these steps:

### Step 1: Identify the Issue
- Read the error message carefully
- Identify the file and line number from the stack trace
- Understand the root cause

### Step 2: Fix the Code
- Edit the relevant source files
- Apply the proper fix following AGENTS.md code conventions

### Step 3: Create/Update Bug Fix MD File
After applying a fix, create or update a file in `.bug_fixes/` folder:

```markdown
# Bug Fix: [Brief Title]

**Date:** YYYY-MM-DD  
**Issue:** [Error message or problem description]  
**Root Cause:** [Why it happened]  
**Status:** ✅ FIXED

---

## Problem Description

[Detailed explanation of the bug]

---

## Solution Applied

[How it was fixed - include code snippets if relevant]

---

## Files Modified

- `path/to/file.js` - What was changed

---

## Testing

[How to verify the fix works]

---

## Git Commit

```
fix: [brief description]
```

### Step 4: Run Tests
```bash
bash .test_script/test.sh
```

### Step 5: Verify Build
```bash
cd frontend && npm run build
```

### Step 6: Ask User to Test
Tell the user to test the specific feature locally.

---

## Common Fix Patterns

### QueryBuilder Missing Methods
If you see `leftJoin is not a function` or similar:
- Check if the method exists in QueryBuilder.js
- Add missing methods like `leftJoin()`, `rightJoin()`, etc.

### Validation Errors
If validation fails unexpectedly:
- Check `backend/src/utils/validation.js`
- Ensure field names match what frontend sends
- Use `optional()` for non-required fields

### MySQL Errors
If you see `Incorrect arguments to mysqld_stmt_execute`:
- Don't embed WHERE conditions in JOIN clauses
- Use `whereRaw()` for complex conditions

### Port Already in Use
If `EADDRINUSE` error:
```bash
netstat -ano | findstr :5000
taskkill //F //PID <PID>
```

---

## Quick Reference

| Issue | Fix Location |
|-------|--------------|
| Backend validation | `backend/src/utils/validation.js` |
| QueryBuilder methods | `backend/src/utils/QueryBuilder.js` |
| Report queries | `backend/src/services/reportService.js` |
| Frontend forms | `frontend/src/pages/*.jsx` |
| Translations | `frontend/src/context/LanguageContext.jsx` |
| CSS styles | `frontend/src/styles/index.css` |

---

## Test Script Usage

Run all tests:
```bash
bash .test_script/test.sh
```

Expected output: All 18 tests should pass.

---

## Notes

1. Always create bug fix MD files in `.bug_fixes/` folder
2. Use clear, descriptive titles
3. Include root cause and solution
4. Test both backend and frontend after fixes
5. Ask user to verify locally before pushing to remote
