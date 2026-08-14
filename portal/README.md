# PRISM Labs Members Portal — Teacher Guide

## Overview

The Members Portal is a **password-protected area** for PRISM Labs members to access:
- Week-by-week lesson resources (slides, code, challenges)
- Club announcements
- Meeting schedule
- Project opportunities
- Quick links to learning resources

This is **Phase 1 (MVP)** — simple, static, and easy to maintain. Future phases will add individual student accounts, progress tracking, and project collaboration features.

---

## Quick Start

### 1. Access Code

The default access code is: **`prismlabs2026`**

Students enter this code on the portal login page to gain access. The code is stored in `portal/resources.json`.

**To change the access code:**
1. Open `portal/resources.json`
2. Find `"accessCode": "prismlabs2026"`
3. Replace with your new code
4. Save and commit

**To share with students:**
- Announce it at the first session
- Add it to your Microsoft Teams channel
- Email it to registered members
- Write it on the board in Room 7

---

### 2. Uploading Resources (Weekly)

Resources are managed in `portal/resources.json`. Each week has:
- `status`: `"unlocked"` (visible) or `"locked"` (hidden content)
- `resources`: Array of slides, code examples, challenges

**To unlock Week 5 resources:**

1. Open `portal/resources.json`
2. Find Week 5:
   ```json
   {
     "week": 5,
     "theme": "How AI Works & Why It Fails",
     "status": "locked",
     ...
   }
   ```
3. Change `"status": "locked"` to `"status": "unlocked"`
4. Update the resource URLs (see below)
5. Save and commit

**To add resource links:**

After uploading files to Google Drive or GitHub, update the `url` fields:

```json
"resources": [
  {
    "type": "slides",
    "title": "Lesson Slides",
    "url": "https://drive.google.com/...",
    "note": ""
  },
  {
    "type": "code",
    "title": "Code Examples",
    "url": "https://github.com/...",
    "note": ""
  }
]
```

**Resource types:**
- `slides` → 📊 Lesson presentations
- `code` → 💻 Code examples, starter files
- `challenge` → 🎯 Weekly challenges
- `reading` → 📖 Articles, documentation
- `template` → 📝 Templates (prompts, project plans)
- `guide` → 📘 Setup guides, tutorials

---

### 3. Posting Announcements

Announcements are in `portal/announcements.json`.

**To add a new announcement:**

1. Open `portal/announcements.json`
2. Add to the top of the `announcements` array:
   ```json
   {
     "id": 4,
     "title": "Your Announcement Title",
     "date": "2026-08-20",
     "priority": "high",
     "content": "Your message here...",
     "author": "Mr. Vinzon"
   }
   ```
3. Save and commit

**Priority levels:**
- `"high"` → Orange border, highlighted background (urgent)
- `"normal"` → Blue border (regular updates)

---

### 4. File Storage Strategy

**Recommended setup:**

| Content Type | Storage | Why |
|--------------|---------|-----|
| Lesson slides | Google Drive | Easy to update, students can copy |
| Code examples | GitHub repo | Students learn Git, version control |
| Challenges | Google Docs/Forms | Easy to distribute and collect |
| Large files | Google Drive | Free 15GB, familiar interface |

**Google Drive folder structure:**
```
PRISM Labs 2026/
├── Term 3/
│   ├── Week 4 - AI Literacy/
│   │   ├── Slides.pdf
│   │   ├── Code Examples/
│   │   └── Challenge.docx
│   ├── Week 5 - How AI Works/
│   └── ...
├── Projects/
└── Resources/
```

**GitHub repo structure:**
```
prism-labs-code/
├── week-04-ai-literacy/
│   ├── examples/
│   └── challenges/
├── week-05-how-ai-works/
└── README.md
```

---

## Deployment

### Option A: GitHub Pages (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add members portal"
   git push
   ```

2. **Enable GitHub Pages:**
   - Go to repo → Settings → Pages
   - Source: `main` branch, `/ (root)`
   - Save

3. **Site is live at:** `https://YOUR_USERNAME.github.io/prism-labs-website/`

4. **Portal URL:** `https://YOUR_USERNAME.github.io/prism-labs-website/portal/`

### Option B: Local Testing

```bash
# From the prism-labs-website directory
python -m http.server 8000
```

Visit:
- Main site: `http://localhost:8000`
- Portal: `http://localhost:8000/portal/`

---

## Updating Content

### Weekly Checklist

Every week (before Thursday session):

- [ ] Upload slides to Google Drive
- [ ] Upload code examples to GitHub/Drive
- [ ] Create challenge document
- [ ] Update `portal/resources.json`:
  - [ ] Change week status to `"unlocked"`
  - [ ] Add resource URLs
  - [ ] Clear the `note` fields
- [ ] Post announcement if needed
- [ ] Commit and push changes

### Example Weekly Update

```bash
# Edit files
# Commit
git add portal/resources.json
git commit -m "Unlock Week 5 resources"
git push
```

That's it! Students will see the new content immediately.

---

## Student Access Flow

1. Student visits `yoursite.com/portal/`
2. Sees login page with access code field
3. Enters code: `prismlabs2026`
4. JavaScript validates against `resources.json`
5. If correct, dashboard loads with all resources
6. Authentication stored in browser localStorage
7. Student stays logged in until they click "Sign Out"

**Security note:** This is **not secure authentication** — it's a simple gate to keep resources off public search results. Determined students could bypass it by viewing the source. For Phase 1, this is acceptable. Phase 2 will add proper authentication.

---

## Customization

### Change Portal Colors

Edit `portal/styles.css` CSS variables:

```css
:root {
  --blue: #2563EB;      /* Primary color */
  --green: #10B981;     /* Secondary color */
  --orange: #F97316;    /* High priority accent */
  /* ... */
}
```

### Add New Resource Types

1. Add icon mapping in `portal/main.js`:
   ```javascript
   function getResourceIcon(type) {
     const icons = {
       slides: '📊',
       code: '💻',
       // Add your type: '🆕',
       ...
     };
   }
   ```

2. Update the type in `resources.json`

### Modify Layout

Edit `portal/styles.css`:
- `.resources-grid` → Grid layout for week cards
- `.announcement-card` → Announcement styling
- `.stat-card` → Stats section

---

## Troubleshooting

### Portal won't load
- Check browser console (F12) for errors
- Ensure `resources.json` is valid JSON (use jsonlint.com)
- Verify file paths are correct

### Access code not working
- Check for typos in `resources.json`
- Ensure no extra spaces in the code
- Clear browser cache and try again

### Resources not showing
- Check `status` is `"unlocked"` for that week
- Verify JSON syntax (missing comma, bracket, etc.)
- Check browser console for fetch errors

---

## Next Steps (Phase 2)

When ready to upgrade:

1. **Individual student accounts**
   - GitHub OAuth or email magic links
   - Track individual progress

2. **Project collaboration**
   - Team formation
   - Project pages with milestones
   - GitHub integration

3. **Progress tracking**
   - Badge system
   - Skills checklist
   - Attendance records

4. **Communication**
   - Discussion forum
   - Mentor booking system
   - Project Q&A

---

## Support

**Contact:** jedidiah@asdah.school.nz

**Documentation:** See main `README.md` for overall site deployment

**Student issues:** Direct students to email you or ask in person on Thursday/Tuesday sessions

---

**PRISM Labs** — Where curiosity becomes capability.
