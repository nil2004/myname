#!/bin/bash

echo "🔍 Verifying Security Before GitHub Push..."
echo ""

# Check if .gitignore exists and contains .env
echo "1. Checking .gitignore..."
if grep -q ".env" .gitignore; then
    echo "   ✅ .gitignore includes .env files"
else
    echo "   ❌ WARNING: .gitignore does not include .env files!"
fi
echo ""

# Check if .env.local exists
echo "2. Checking .env.local..."
if [ -f .env.local ]; then
    echo "   ✅ .env.local exists (good for local development)"
else
    echo "   ⚠️  .env.local not found (you'll need to create it)"
fi
echo ""

# Check if .env.example exists
echo "3. Checking .env.example..."
if [ -f .env.example ]; then
    echo "   ✅ .env.example exists (safe to push)"
else
    echo "   ⚠️  .env.example not found (should create one)"
fi
echo ""

# Check if .env.local will be pushed
echo "4. Checking if .env.local will be pushed..."
if git ls-files --error-unmatch .env.local 2>/dev/null; then
    echo "   ❌ DANGER: .env.local is tracked by git!"
    echo "   Run: git rm --cached .env.local"
else
    echo "   ✅ .env.local is not tracked by git"
fi
echo ""

# Check for hardcoded credentials
echo "5. Checking for hardcoded credentials in source code..."
if grep -r "CEO.NIL2004" src/ 2>/dev/null | grep -v "process.env"; then
    echo "   ⚠️  Found hardcoded password in source code"
else
    echo "   ✅ No hardcoded passwords found"
fi
echo ""

if grep -r "uaiwuivyrdoausenvlbs" src/ 2>/dev/null | grep -v "process.env"; then
    echo "   ⚠️  Found hardcoded Supabase URL in source code"
else
    echo "   ✅ No hardcoded Supabase URLs found"
fi
echo ""

echo "6. Summary:"
echo "   If all checks show ✅, you're safe to push to GitHub!"
echo "   If any show ❌ or ⚠️, fix those issues first."
echo ""
echo "To push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git push -u origin main"
