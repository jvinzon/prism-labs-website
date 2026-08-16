# PRISM Labs Website v2.0

**Where Curiosity Becomes Capability**

A comprehensive web platform for ASDAH's PRISM Labs technology club, featuring member resources, event management, discussion forums, achievement tracking, project management, and admin tools.

## Features

### For Members
- **Resource Library** - Tutorials, cheatsheets, templates, and tools organized by track and difficulty
- **Event Calendar** - Upcoming sessions, workshops, and competitions with RSVP and check-in
- **Member Directory** - Connect with other members, view profiles and projects
- **Discussion Forum** - Stack Overflow-style Q&A with voting, accepted answers, and tags
- **Achievement Badges** - Gamified progression with 17+ badges across attendance, projects, community, and skills
- **Code Playground** - In-browser code editor for practicing programming

### For Admins
- **Attendance Tracker** - QR code check-in, attendance reports, export capabilities
- **Project Management** - Track projects, milestones, team members, and GitHub integration
- **Communication Tools** - Send announcements via email, Microsoft Teams, or in-app notifications
- **Inventory Management** - Track laptops, components, tools with checkout/return system
- **Analytics & Reporting** - Membership growth, attendance rates, budget tracking, popular resources
- **Permission Form Tracker** - Digital consent forms with expiry alerts
- **Mentor Matching** - Pair senior students with juniors for peer mentoring
- **Budget Tracker** - Category-based budgeting with expense approval workflow

### Technical Features
- **Microsoft 365 OAuth** - Single sign-on with school accounts
- **GitHub Integration** - Sync project repositories and activity
- **Google Calendar Sync** - Automatic event synchronization
- **Microsoft Teams Integration** - Post announcements to club channel
- **Email Notifications** - Resend API integration for newsletters and alerts
- **PWA Support** - Installable on mobile devices with offline capability
- **WCAG 2.1 Accessibility** - Keyboard navigation, screen reader support
- **Mobile Responsive** - Works on phones, tablets, and desktops

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Authentication**: Passport.js with Azure AD OAuth
- **Views**: EJS templating
- **Styling**: Custom CSS with CSS variables
- **Integrations**: Microsoft Graph, GitHub API, Google Calendar API, Resend

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager
- Git

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd C:\Users\jedidiah\prism-labs-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   - Microsoft 365 OAuth credentials (Azure AD app registration)
   - Resend API key for email
   - GitHub token for repo integration
   - Google Calendar credentials
   - Teams webhook URL

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The site will be available at `http://localhost:3000`

## Deployment

### Production Setup

1. **Set NODE_ENV to production**
   ```bash
   NODE_ENV=production
   ```

2. **Generate a strong session secret**
   ```bash
   # Use this in your .env
   SESSION_SECRET=<random 64-character string>
   ```

3. **Build and start**
   ```bash
   npm start
   ```

### Hosting Options

#### Option 1: School Server
- Deploy to ASDAH server infrastructure
- Requires IT department approval
- Use IIS with node-iis or run as Windows service

#### Option 2: Cloud Hosting (Recommended)
- **Railway.app** - Free tier, easy Node.js deployment
- **Render.com** - Free tier, automatic HTTPS
- **Heroku** - Student plan available
- **Vercel** - Free tier, but better for static sites

#### Option 3: GitHub Pages (Static Only)
- Not recommended for full app (needs backend)
- Could host static landing page only

### Microsoft 365 OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Name: `PRISM Labs`
5. Supported account types: **Single tenant**
6. Redirect URI: `http://localhost:3000/auth/microsoft/callback` (dev) or your production URL
7. After creation, go to **Certificates & secrets**
8. Click **New client secret**, copy the value (won't show again)
9. Go to **API permissions** → Add **Microsoft Graph** → User.Read, email, profile
10. Update `.env` with:
    - `AZURE_TENANT_ID` (from Overview page)
    - `AZURE_CLIENT_ID` (Application ID)
    - `AZURE_CLIENT_SECRET` (the secret you just created)

### Resend Email Setup

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Get API key from dashboard
4. Verify your sender domain (or use default `onboarding@resend.dev`)
5. Update `.env`:
   - `RESEND_API_KEY=re_xxxxx`
   - `FROM_EMAIL=onboarding@resend.dev`

### GitHub Integration

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate token with `repo` scope
3. Update `.env`:
   - `GITHUB_TOKEN=ghp_xxxxx`
   - `GITHUB_ORG=jvinzon`

### Google Calendar Integration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Download credentials JSON
6. Extract client ID and secret to `.env`

### Microsoft Teams Webhook

1. In your Teams channel, click **···** → **Connectors**
2. Find **Incoming Webhook**
3. Click **Configure** → Give it a name
4. Copy the webhook URL
5. Update `.env`: `TEAMS_WEBHOOK_URL=https://...`

## Database Schema

The SQLite database includes tables for:
- `users` - Member and admin accounts
- `badges` + `user_badges` - Achievement system
- `events` + `attendance` - Session tracking
- `resources` + `resource_bookmarks` - Learning materials
- `categories` + `posts` + `comments` + `votes` - Forum
- `projects` + `project_members` + `milestones` - Project management
- `inventory_items` + `inventory_transactions` - Equipment tracking
- `mentorships` - Peer mentoring pairs
- `budget_categories` + `expenses` - Financial tracking
- `permission_forms` - Consent form storage
- `communications` - Announcement log
- `analytics_events` - Usage tracking

## File Structure

```
prism-labs-website/
├── config/
│   └── passport.js          # OAuth configuration
├── data/
│   └── prism-labs.db        # SQLite database (created on init)
├── middleware/
│   ├── auth.js              # Authentication guards
│   └── analytics.js         # Usage tracking
├── public/
│   ├── css/
│   │   └── main.css         # Main stylesheet
│   ├── js/
│   │   └── main.js          # Client-side JavaScript
│   ├── images/              # Static images
│   └── manifest.json        # PWA manifest
├── routes/
│   ├── auth.js              # Login/logout routes
│   ├── member.js            # Member pages
│   ├── admin.js             # Admin dashboard
│   ├── api.js               # REST API
│   └── integrations.js      # External service hooks
├── scripts/
│   ├── init-db.js           # Database initialization
│   └── seed-data.js         # Sample data (optional)
├── uploads/                 # User-uploaded files
├── views/
│   ├── layouts/
│   │   └── main.ejs         # Base template
│   ├── members/             # Member pages
│   ├── admin/               # Admin pages
│   ├── index.ejs            # Home page
│   ├── about.ejs            # About page
│   └── ...
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Template for .env
├── .gitignore
├── db.js                    # Database connection
├── package.json
├── server.js                # Main application
└── README.md                # This file
```

## Default Admin Account

After running `npm run init-db`, create the first admin account manually:

```sql
-- Run this in SQLite browser or via node script
INSERT INTO users (id, email, name, role)
VALUES ('admin-001', 'jedidiah@asdah.school.nz', 'Jedidiah Vinzon', 'admin');
```

Or use the registration form and manually update the role in the database.

## Development Commands

```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Seed sample data (optional)
npm run seed
```

## API Endpoints

### Public
- `GET /api/resources` - List published resources
- `GET /api/events` - Upcoming events
- `GET /api/members` - Public member directory
- `GET /api/badges` - All badges
- `GET /api/posts` - Recent forum posts
- `GET /api/projects` - Active projects

### Protected (requires auth)
- Various endpoints in `/routes/api.js`

### Webhooks
- `POST /api/webhooks/github` - GitHub events
- `POST /api/webhooks/google` - Google Calendar events

## Security Considerations

1. **HTTPS** - Always use HTTPS in production
2. **Session Secret** - Generate a strong random secret
3. **Environment Variables** - Never commit `.env` to Git
4. **Input Validation** - All forms validated server-side
5. **SQL Injection** - Using parameterized queries (better-sqlite3)
6. **XSS Protection** - EJS auto-escapes output
7. **CSRF Protection** - Add csrf middleware for forms
8. **Rate Limiting** - Add express-rate-limit for API endpoints

## Accessibility (WCAG 2.1)

- ✅ Semantic HTML throughout
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Color contrast ratios meet AA standard
- ✅ Alt text on images
- ✅ Screen reader compatible

## Mobile Responsiveness

- Mobile-first CSS design
- Touch-friendly buttons and links
- Responsive grid layouts
- PWA installable on mobile
- Offline support for cached pages

## Troubleshooting

### Database locked error
```bash
# Close all Node processes
taskkill /F /IM node.exe
# Delete WAL files
del data\*.db-wal data\*.db-shm
```

### Port already in use
```bash
# Change PORT in .env or kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### OAuth callback error
- Check redirect URI matches exactly in Azure Portal
- Ensure AZURE_TENANT_ID is correct

### Email not sending
- Verify RESEND_API_KEY is valid
- Check FROM_EMAIL is verified domain

## Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] Advanced analytics dashboard with charts
- [ ] Automated backup system
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced search with filters
- [ ] Export reports to PDF/Excel
- [ ] Integration with school LMS
- [ ] Video conferencing integration
- [ ] Advanced permission system

## Contributing

This is a school project. Contact Jedidiah Vinzon for contribution guidelines.

## License

MIT License - See LICENSE file for details

## Contact

- **Email**: fine@asdah.school.nz
- **Location**: Computer Room (Room 7), ASDAH
- **Website**: https://jvinzon.github.io/prism-labs-website/ (when deployed)

---

Built with ❤️ for ASDAH PRISM Labs
