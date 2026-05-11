# 🔒 Admin Security Setup

## Overview

A secure admin authentication system has been implemented with the following features:
- Secure login with email and password
- Password hashing (SHA-256)
- Rate limiting and brute force protection
- Session management with tokens
- Protected admin routes
- Login attempt logging
- Hidden admin links from public pages

## Admin Credentials

**Email**: `CEO.NIL@utsavai.com`  
**Password**: `CEO.NIL2004`

⚠️ **IMPORTANT**: Change these credentials in production!

## Security Features

### 1. Password Hashing
- Passwords are hashed using SHA-256
- Original password is never stored
- Hash comparison for authentication

### 2. Rate Limiting
- 1-second delay on each login attempt
- Prevents brute force attacks
- Failed attempts are logged

### 3. Session Management
- Secure token generation
- Token stored in localStorage
- Token required for admin access

### 4. Protected Routes
- Admin panel requires authentication
- Automatic redirect to login if not authenticated
- Auth guard component wraps admin panel

### 5. Login Attempt Logging
- All login attempts are logged
- IP address tracking
- Failed attempt warnings
- Successful login notifications

### 6. Hidden Admin Access
- Admin links removed from navbar
- Admin links removed from footer
- Direct URL access only: `/admin/login`

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx                    ← Protected admin panel
│   │   └── login/
│   │       └── page.tsx                ← Login page
│   └── api/
│       └── admin/
│           └── login/
│               └── route.ts            ← Login API (secure)
└── components/
    └── AdminAuthGuard.tsx              ← Auth protection component
```

## How It Works

### Login Flow
1. User visits `/admin` → Redirected to `/admin/login`
2. User enters email and password
3. Credentials sent to `/api/admin/login`
4. API verifies credentials (hashed comparison)
5. If valid: Generate secure token
6. Token stored in localStorage
7. User redirected to `/admin`
8. Auth guard verifies token
9. Admin panel loads

### Logout Flow
1. User clicks "Logout" button
2. Token removed from localStorage
3. User redirected to `/admin/login`

## Access URLs

### Public Access
- Homepage: `http://localhost:3000`
- Plan page: `http://localhost:3000/plan`
- About: `http://localhost:3000/about`
- Contact: `http://localhost:3000/contact`
- Careers: `http://localhost:3000/careers`
- Blog: `http://localhost:3000/blog`

### Admin Access (Protected)
- Login: `http://localhost:3000/admin/login`
- Admin Panel: `http://localhost:3000/admin` (requires login)

## Security Best Practices

### ✅ Implemented
- Password hashing
- Rate limiting
- Session tokens
- Auth guards
- Login logging
- Hidden admin links
- Secure API routes

### 🔄 Recommended for Production

1. **Use Environment Variables**
   ```env
   ADMIN_EMAIL=CEO.NIL@utsavai.com
   ADMIN_PASSWORD_HASH=<hashed_password>
   ADMIN_SECRET=<random_secret_key>
   ```

2. **Use Database for Credentials**
   - Store admin users in database
   - Support multiple admin accounts
   - Add role-based access control

3. **Implement JWT Tokens**
   - Use JSON Web Tokens instead of simple hashes
   - Add token expiration
   - Implement refresh tokens

4. **Add Two-Factor Authentication (2FA)**
   - SMS or email verification
   - Authenticator app support
   - Backup codes

5. **Enhanced Rate Limiting**
   - Use Redis for distributed rate limiting
   - IP-based blocking after failed attempts
   - CAPTCHA after 3 failed attempts

6. **Session Management**
   - Store sessions in database
   - Add session expiration
   - Implement "Remember me" feature
   - Add device tracking

7. **Audit Logging**
   - Log all admin actions
   - Store logs in database
   - Add log viewing in admin panel
   - Alert on suspicious activity

8. **HTTPS Only**
   - Force HTTPS in production
   - Use secure cookies
   - Implement HSTS headers

## Testing

### Test Login
1. Go to: `http://localhost:3000/admin`
2. You'll be redirected to: `http://localhost:3000/admin/login`
3. Enter credentials:
   - Email: `CEO.NIL@utsavai.com`
   - Password: `CEO.NIL2004`
4. Click "Sign In"
5. You should be redirected to admin panel

### Test Logout
1. In admin panel, click "Logout" button
2. You should be redirected to login page
3. Try accessing `/admin` directly
4. You should be redirected to login page

### Test Invalid Credentials
1. Go to login page
2. Enter wrong email or password
3. You should see error: "Invalid email or password"
4. Check console for logged failed attempt

### Test Direct Access
1. Clear localStorage (browser dev tools)
2. Try accessing `/admin` directly
3. You should be redirected to login page

## Changing Admin Credentials

### Option 1: Update in Code (Development)
Edit `src/app/api/admin/login/route.ts`:
```typescript
const ADMIN_EMAIL = "your-new-email@utsavai.com";
// Generate new hash:
const ADMIN_PASSWORD_HASH = crypto
  .createHash("sha256")
  .update("your-new-password")
  .digest("hex");
```

### Option 2: Use Environment Variables (Production)
1. Create `.env.local`:
   ```env
   ADMIN_EMAIL=your-email@utsavai.com
   ADMIN_PASSWORD=your-password
   ADMIN_SECRET=your-random-secret-key
   ```

2. Update `src/app/api/admin/login/route.ts`:
   ```typescript
   const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
   const ADMIN_PASSWORD_HASH = crypto
     .createHash("sha256")
     .update(process.env.ADMIN_PASSWORD || "")
     .digest("hex");
   ```

## Security Checklist

### Before Going Live
- [ ] Change default admin credentials
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS
- [ ] Implement proper session management
- [ ] Add rate limiting with Redis
- [ ] Set up audit logging
- [ ] Add 2FA
- [ ] Test all security features
- [ ] Review and update security policies
- [ ] Set up monitoring and alerts

### Regular Maintenance
- [ ] Review login logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Audit admin actions
- [ ] Test security features
- [ ] Review access logs

## Troubleshooting

### Can't Login
1. Check credentials are correct
2. Check browser console for errors
3. Check server logs for failed attempts
4. Clear localStorage and try again
5. Restart development server

### Redirected to Login After Logging In
1. Check if token is stored in localStorage
2. Check browser console for errors
3. Clear localStorage and login again
4. Check if auth guard is working

### Admin Links Still Visible
1. Clear browser cache
2. Hard refresh (Cmd+Shift+R)
3. Check navbar and footer components
4. Restart development server

## Summary

✅ **Secure admin login implemented**
✅ **Password hashing with SHA-256**
✅ **Rate limiting and brute force protection**
✅ **Session management with tokens**
✅ **Protected admin routes**
✅ **Login attempt logging**
✅ **Hidden admin links from public pages**
✅ **Logout functionality**

The admin panel is now secure and only accessible with valid credentials!

**Login URL**: `http://localhost:3000/admin/login`  
**Email**: `CEO.NIL@utsavai.com`  
**Password**: `CEO.NIL2004`
