# 🧪 Production Testing Guide

## Step 1: Test Database Connection

1. **Visit the Test Page**: Go to `https://your-render-url.onrender.com/test`
2. **Check Database Status**: Should show "Database: connected"
3. **Verify Environment**: Should show "Environment: production"

## Step 2: Test User Signup

1. **Go to Signup Page**: Click "Sign Up" in the navigation
2. **Create Test Account**:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `testpass123` (min 6 characters)
   - Confirm Password: `testpass123`
3. **Submit Form**: Click "Sign Up"
4. **Expected Result**: 
   - You should be redirected to the home page
   - Navigation bar should show "👤 TEST USER"
   - Console should log: "✅ User logged in: { name: 'Test User', email: 'test@example.com' }"

## Step 3: Test User Login

1. **Logout**: Click "Logout Test User" in navigation
2. **Go to Login Page**: Click "Login" in navigation
3. **Login with Test Account**:
   - Email: `test@example.com`
   - Password: `testpass123`
4. **Submit Form**: Click "Log In"
5. **Expected Result**: 
   - You should be redirected to the home page
   - Navigation bar should show "👤 TEST USER"
   - You should see your user greeting in gold border

## Step 4: Verify Persistence

1. **Refresh the Page**: Press F5 or reload
2. **Expected Result**: 
   - You should still be logged in
   - User data persists across page refreshes
   - JWT token is stored in localStorage

## Step 5: Check MongoDB Atlas

1. **Go to MongoDB Atlas Dashboard**: https://cloud.mongodb.com
2. **Browse Collections**: 
   - Navigate to your `mtgpile` database
   - Check the `users` collection
   - You should see your test user with hashed password
3. **Verify Data**:
   - Email should be lowercase
   - Password should be bcrypt hashed (not plain text)
   - Created timestamp should be present

## Troubleshooting

### Database Shows "disconnected"
- Check Render environment variables
- Verify `MONGODB_URI` is set correctly with URL-encoded password
- Check MongoDB Atlas Network Access (allow all IPs: 0.0.0.0/0)

### Signup Returns 400 Error
- Open browser console (F12)
- Check Network tab for error details
- Common issues:
  - Password too short (< 6 characters)
  - Email already exists
  - Missing required fields

### Login Returns 401 Error
- Verify email and password are correct
- Check that user exists in MongoDB
- Ensure password was hashed during signup

### User Not Persisting After Refresh
- Check browser localStorage (F12 > Application > Local Storage)
- Look for `token` key
- If missing, JWT creation or storage has an issue

## Health Check Endpoint

**URL**: `https://your-render-url.onrender.com/api/health`

**Expected Response**:
```json
{
  "status": "ok",
  "database": "connected",
  "environment": "production",
  "timestamp": "2025-10-23T..."
}
```

## Console Commands for Testing

```javascript
// Check if user is logged in
console.log(localStorage.getItem('token'));

// Decode JWT (copy token from localStorage)
// Go to https://jwt.io and paste token to decode

// Clear token (logout manually)
localStorage.removeItem('token');
```

## Next Steps After Testing

Once login/signup is working in production:

1. ✅ **User Authentication** - DONE
2. 🔜 **User Piles** - Create, save, and view card collections
3. 🔜 **TCGplayer Integration** - Shopping cart with affiliate links
4. 🔜 **Ad Banner Integration** - Monetization setup
5. 🔜 **User Pile Display Page** - Show saved collections

---

**Current Status**: Ready for production testing!

**Test URL**: Visit `/test` on your Render deployment to see the test dashboard.

