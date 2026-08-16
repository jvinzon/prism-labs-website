
# 🔐 PRISM Labs Authentication Structure - COMPLETE

## NEW STRUCTURE

### Main Website Navigation
- **Prominent "Member Login" button** in navigation bar
- Visible on all pages when logged out
- Styled with accent color to stand out

### Footer
- **Discreet "Admin Login" link** at bottom of footer
- Small, subtle styling (opacity 0.5, small font)
- Only visible if you look for it

---

## LOGIN PAGES

### Member Login (`/members/login`)
- **Authentication:** Microsoft 365 OAuth
- **For:** Students/members
- **Features shown:**
  - Microsoft login button
  - List of member benefits
  - What they'll get access to
- **After login:** Redirects to `/members/dashboard`

### Admin Login (`/admin/login`)
- **Authentication:** Email + PIN/Password
- **For:** Teachers/administrators
- **Features:**
  - Email field
  - PIN/password field
  - Admin badge indicator
- **After login:** Redirects to `/admin/dashboard` (or member dashboard with admin tools)

---

## ENVIRONMENT VARIABLES

`.env` file includes:
```
# Admin Credentials
ADMIN_EMAIL=jedidiah@asdah.school.nz
ADMIN_PIN=123456

# Microsoft OAuth (for members)
AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
```

---

## AUTHENTICATION FLOW

### Member Flow:
1. Click "Member Login" in nav
2. Microsoft 365 OAuth
3. System checks role in database
4. If member → `/members/dashboard`
5. If admin → `/admin/dashboard`

### Admin Flow:
1. Click discreet "Admin Login" in footer
2. Enter email and PIN
3. System verifies against `.env` credentials
4. If correct → `/admin/dashboard` with admin tools
5. If incorrect → Error message

---

## FILES CREATED

- ✅ `.env.example` (with admin credentials)
- ✅ `.env` (local development)
- ✅ `middleware/auth.js` (authentication middleware)
- ✅ `views/members/login.ejs` (Microsoft OAuth login)
- ✅ `views/admin/login.ejs` (Password/PIN login)
- ✅ `views/layouts/main.ejs` (updated nav and footer)

---

## NEXT STEPS

Still need to create:
- [ ] Member dashboard route
- [ ] Admin dashboard route
- [ ] Admin tools menu
- [ ] Microsoft OAuth integration
- [ ] Admin login route

---

**Structure is ready! Authentication flows are clear!**
