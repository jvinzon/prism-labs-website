# PRISM Labs Admin Dashboard — Complete Guide

## 🔐 Access Information

**Admin URL:** `https://jvinzon.github.io/prism-labs-website/admin/`

**Default Credentials:**
- **Username:** `admin`
- **Password:** `PrismTeacher2026!`

⚠️ **IMPORTANT:** Change the password immediately after your first login!

---

## 📋 What You Can Do

The Admin Dashboard gives you complete control over:

### 1. **Student Registrations** (`admin/registrations.html`)
- View all student registrations in real-time
- Filter by year level or search by name/email
- Export registrations to CSV (for Excel/Google Sheets)
- Email students directly with one click
- Delete duplicate or test registrations

### 2. **Resource Management** (`admin/resources.html`)
- Unlock/lock weekly resources for students
- Update Google Drive/GitHub links for slides, code, challenges
- Add notes or instructions for each resource
- See which weeks are currently accessible

### 3. **Announcements** (`admin/announcements.html`)
- Post new announcements to the members portal
- Set priority (normal vs. high priority highlighted)
- Edit or remove existing announcements
- All announcements show date and your name as author

### 4. **Settings** (on main dashboard `admin/index.html`)
- Change the portal access code (default: `prismlabs2026`)
- Update current week number
- Change your admin password
- Update term information display

### 5. **Data Management** (on main dashboard)
- Export all registrations as CSV
- Download complete backup of all portal data
- Reset all data (use with extreme caution!)

---

## 🚀 Quick Start

### Step 1: Access the Admin Dashboard

1. Go to: `https://jvinzon.github.io/prism-labs-website/admin/`
2. Enter credentials:
   - Username: `admin`
   - Password: `PrismTeacher2026!`
3. Click "Login to Dashboard"

### Step 2: Change Your Password (IMPORTANT!)

1. On the dashboard, scroll to **Settings**
2. In the "Admin Password" card:
   - Enter current password: `PrismTeacher2026!`
   - Enter new password (min 8 characters)
   - Click "Change Password"
3. **Write down your new password somewhere safe!**

### Step 3: Review Student Registrations

1. Click "View all →" under Total Registrations
2. See all students who have registered
3. Use filters to find specific students
4. Click "📧 Email" to contact a student directly
5. Click "📊 Export CSV" to download for records

### Step 4: Unlock Week 4 Resources

1. Go to "Manage Resources" from dashboard
2. Find "Week 4: AI Literacy Kickoff"
3. Click "🔓 Unlock Week" (if not already unlocked)
4. Update the resource URLs with your actual Google Drive/GitHub links:
   - Slides URL
   - Code Examples URL
   - Challenge URL
5. Click "💾 Save Changes"

### Step 5: Post a Welcome Announcement

1. Go to "Post Announcements" from dashboard
2. Fill in:
   - Title: "Welcome to PRISM Labs!"
   - Content: Your welcome message
   - Priority: High (for important announcements)
3. Click "Post Announcement"

---

## 📁 File Structure

```
admin/
├── index.html              # Main dashboard
├── styles.css              # Admin styles
├── main.js                 # Dashboard JavaScript
├── config.json             # Admin settings & credentials
├── registrations.json      # Student registration data
├── registrations.html      # Registration manager
├── resources.html          # Resource manager
├── announcements.html      # Announcement manager
└── README.md               # This file
```

---

## 🔧 Configuration

### Change Portal Access Code

Edit `admin/config.json`:

```json
{
  "portalAccessCode": "your-new-code-here"
}
```

Or change it from the dashboard Settings section.

### Change Admin Credentials

Edit `admin/config.json`:

```json
{
  "adminUsername": "your-username",
  "adminPassword": "your-secure-password"
}
```

⚠️ **After editing config.json:**
```bash
git add admin/config.json
git commit -m "Update admin credentials"
git push
```

---

## 📊 How Registrations Work

### Student Registration Flow:

1. Student visits main site → clicks "Join"
2. Fills out form on `join.html`
3. Form submits to `/api/submit` (Resend API)
4. Email sent to you: `jedidiah@asdah.school.nz`
5. Registration also saved to `admin/registrations.json`
6. You see it in the admin dashboard

### Manual Registration Entry:

If a student registers on paper or via email, you can manually add them to `admin/registrations.json`:

```json
{
  "registrations": [
    {
      "id": "reg-002",
      "fullName": "Student Name",
      "yearLevel": "Year 11",
      "email": "student@asdah.school.nz",
      "whyJoin": "Interested in robotics and AI",
      "submittedAt": "2026-08-15T14:30:00Z"
    }
  ]
}
```

Then commit and push:
```bash
git add admin/registrations.json
git commit -m "Add manual registration"
git push
```

---

## 📧 Email Students

### From the Admin Dashboard:

1. Go to "View Registrations"
2. Find the student
3. Click "📧 Email"
4. Pre-filled email opens in your default mail app:
   - To: Student's email
   - Subject: "PRISM Labs Registration Confirmation"
   - Body: Welcome message with portal access code

### Customize Email Template:

Edit the `emailStudent()` function in `admin/registrations.html`:

```javascript
function emailStudent(email, name) {
  const subject = encodeURIComponent('Your custom subject');
  const body = encodeURIComponent(`Your custom message...`);
  window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
}
```

---

## 📈 Weekly Workflow

### Before Each Term:
- [ ] Change portal access code (update in Settings)
- [ ] Update term info in Settings
- [ ] Post "Welcome to Term X" announcement
- [ ] Unlock Week 4 resources

### Weekly (Before Thursday Session):
- [ ] Upload slides to Google Drive
- [ ] Upload code examples to GitHub
- [ ] Create challenge document
- [ ] Go to "Manage Resources"
- [ ] Unlock the current week
- [ ] Update resource URLs
- [ ] Save changes
- [ ] Post announcement if needed

### As Needed:
- [ ] Check new registrations
- [ ] Email students with updates
- [ ] Export registrations for attendance
- [ ] Post important announcements

---

## 🔒 Security Notes

### Current Security Level: **Basic**

⚠️ **Important Limitations:**
- Admin credentials are stored in client-side JSON (not secure for production)
- Anyone with the URL can attempt to login
- Data files (registrations.json) are publicly accessible if someone knows the URL

### For Better Security (Phase 2):

1. **Move to backend authentication:**
   - Use Firebase Auth or Supabase
   - Store credentials server-side
   - Use JWT tokens for sessions

2. **Protect data files:**
   - Move registrations to server-side database
   - Use API endpoints with authentication
   - Never expose raw JSON files

3. **Add rate limiting:**
   - Prevent brute force login attempts
   - Lock account after N failed attempts

### For Now (Phase 1):
- ✅ Change default password immediately
- ✅ Don't share admin URL with students
- ✅ Use HTTPS (GitHub Pages provides this)
- ✅ Monitor for suspicious activity

---

## 🛠️ Troubleshooting

### Can't Login:
- Check username/password (case-sensitive!)
- Clear browser cache
- Check browser console (F12) for errors
- Verify `admin/config.json` exists and is valid JSON

### Registrations Not Showing:
- Check `admin/registrations.json` exists
- Verify JSON syntax (use jsonlint.com)
- Check browser console for fetch errors
- Ensure file is committed to Git

### Changes Not Saving:
- Remember to commit and push after editing JSON files
- GitHub Pages takes 1-2 minutes to update
- Hard refresh (Ctrl+Shift+R) to see changes

### Export CSV Not Working:
- Check if there are any registrations
- Browser may block downloads - check permissions
- Try a different browser

---

## 📱 Mobile Access

The admin dashboard is responsive and works on mobile devices:
- Check registrations on your phone
- Post announcements between classes
- Email students directly from your device

However, for complex tasks (updating resources, editing config), use a desktop computer.

---

## 🎯 Next Steps (Phase 2)

When ready to upgrade:

1. **Backend Authentication**
   - Firebase or Supabase integration
   - Secure password storage (hashed)
   - Session management

2. **Real Database**
   - Move from JSON files to database
   - Query and filter registrations
   - Track attendance history

3. **Advanced Features**
   - Bulk email to all members
   - Attendance tracking per session
   - Project submission system
   - Badge/progress management
   - Parent permission form digital signing

4. **Student Features**
   - Individual student accounts
   - Project portfolios
   - Progress dashboards
   - Peer collaboration tools

---

## 📞 Support

**Contact:** jedidiah@asdah.school.nz

**Documentation:**
- Main site README: `/README.md`
- Portal README: `/portal/README.md`
- This guide: `/admin/README.md`

---

## 🎉 You're All Set!

The admin dashboard gives you complete control over PRISM Labs operations. Start by:

1. ✅ Logging in and changing your password
2. ✅ Reviewing current registrations
3. ✅ Unlocking Week 4 resources
4. ✅ Posting a welcome announcement

Then use it weekly to manage the club with ease!

**Admin URL:** https://jvinzon.github.io/prism-labs-website/admin/

**Portal Access Code:** `prismlabs2026` (change it in Settings!)

---

**PRISM Labs** — Where curiosity becomes capability.
