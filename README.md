# PRISM Labs Website

A modern, responsive static website for **PRISM Labs** — the technology club at Auckland Seventh-day Adventist High School (ASDAH).

## Overview

This is a single-page marketing website designed to:
- Showcase what PRISM Labs does
- Display Term 3, 2026 curriculum (Weeks 4-10)
- Highlight the four tracks: Programming, Refurbishing, Innovation, Systems Management
- Tease future projects
- Allow students to register via an email form

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **Form Backend**: Resend API (email delivery)
- **Hosting**: GitHub Pages (static files) + Vercel/Flask (API endpoint)
- **CDN/DNS**: Cloudflare (recommended)

## File Structure

```
prism-labs-website/
├── index.html              # Main single-page site
├── join.html               # Registration form page
├── styles.css              # All CSS styles
├── main.js                 # JavaScript interactions
├── api/
│   ├── submit.js           # Vercel serverless function (Node.js)
│   └── submit.py           # Flask endpoint (Python alternative)
├── assets/
│   ├── logo.svg            # PRISM Labs logo (Network variant)
│   └── sda-logo.svg        # ASDAH placeholder logo
├── README.md               # This file
└── .gitignore
```

## Local Development

### Option 1: Simple file opening
Just open `index.html` in your browser:
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Option 2: Local server (recommended)
For proper testing (especially the form), use a local server:

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx serve .
```

Then visit `http://localhost:8000` in your browser.

## Deployment

### 1. GitHub Pages (Static Files)

1. Create a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: PRISM Labs website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/prism-labs-website.git
   git push -u origin main
   ```

2. Go to your GitHub repo → Settings → Pages
3. Under "Source", select `main` branch and `/ (root)`
4. Click Save
5. Your site will be live at `https://YOUR_USERNAME.github.io/prism-labs-website/`

### 2. Form Backend Setup

You need to deploy the API endpoint to handle form submissions.

#### Option A: Vercel (Node.js)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create a `vercel.json` in the root:
   ```json
   {
     "functions": {
       "api/submit.js": {
         "memory": 1024,
         "maxDuration": 10
       }
     }
   }
   ```

3. Deploy:
   ```bash
   vercel login
   vercel --prod
   ```

4. Set environment variable in Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `RESEND_API_KEY` with your Resend API key

#### Option B: Flask (Python)

1. Create `requirements.txt`:
   ```
   flask==3.0.0
   requests==2.31.0
   ```

2. Deploy to a Python hosting service (Render, Railway, Heroku, etc.)

3. Set environment variable:
   ```bash
   export RESEND_API_KEY=your_api_key_here
   ```

4. Run:
   ```bash
   python api/submit.py
   ```

### 3. Update Form Endpoint

After deploying the API, update the form endpoint in `main.js`:

```javascript
// Change this line to your deployed API URL
const response = await fetch('https://your-api-url.vercel.app/api/submit', {
  method: 'POST',
  // ... rest of the config
});
```

Or for Flask:
```javascript
const response = await fetch('https://your-flask-app.com/api/submit', {
  // ...
});
```

## Environment Variables

### Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Set as `RESEND_API_KEY` environment variable

**Free tier limitations:**
- FROM address must be `onboarding@resend.dev` or your verified domain
- TO address can be any email
- 100 emails/day on free tier

## Customization

### Replace SDA Logo

The current `assets/sda-logo.svg` is a placeholder. To replace with the official school logo:

1. Get the official ASDAH logo (SVG or PNG)
2. Replace `assets/sda-logo.svg` with the official file
3. Update the alt text in both HTML files if needed

### Update Content

**Term curriculum:** Edit the timeline cards in `index.html` (lines ~80-140)

**Track descriptions:** Edit the track cards in `index.html` (lines ~150-200)

**Future projects:** Edit the project cards in `index.html` (lines ~210-270)

**Meeting times:** Edit the session cards in `index.html` (lines ~280-330)

**Contact email:** Search for `jedidiah@asdah.school.nz` and replace with updated email

### Styling

All CSS is in `styles.css`. Key customization points:

- **Colors:** Edit CSS variables at the top of `styles.css` (lines 10-20)
- **Fonts:** Change Google Fonts link in HTML `<head>` and update `font-family` in CSS
- **Spacing:** Adjust padding/margin values in section styles

## Accessibility

The site follows basic accessibility guidelines:
- Semantic HTML structure
- Alt text on all images
- Keyboard-navigable forms
- Sufficient color contrast
- ARIA labels on interactive elements

Test with:
- Browser DevTools Accessibility tab
- Screen readers (NVDA, VoiceOver)
- Keyboard-only navigation

## Browser Support

Tested on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This is a student-maintained project. Students should be able to:
- Edit content without breaking layout
- Add new sections following existing patterns
- Update styles via CSS variables

Guidelines:
1. Keep the no-framework approach
2. Test on mobile before committing
3. Don't add external dependencies without discussion

## License

This project is for ASDAH PRISM Labs use. Built by students, for students.

## Contact

- Teacher: Jedidiah Vinzon
- Email: jedidiah@asdah.school.nz
- School: [asdah.school.nz](https://asdah.school.nz)

---

**PRISM Labs** — Where curiosity becomes capability.
