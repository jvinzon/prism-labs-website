
# PRISM Labs Member Portal - Complete Walkthrough

## THE COMPLETE MEMBER EXPERIENCE

This shows exactly what EACH student sees and experiences when they log in.

---

## QUICK START: What Students See

### 1. LOGIN (/members/auth/login)
- Enter school email
- Microsoft 365 authentication
- Redirects to personalized dashboard

### 2. DASHBOARD (/members/dashboard)
**Personalized for EACH student:**
- Their name in welcome message
- Their XP total and level
- Their team info and points
- Their stats (bookmarks, challenges, attendance, badges)
- Active challenges available
- Recommended resources (based on their level/track)
- Quick action buttons

### 3. RESOURCE LIBRARY (/members/resources)
**38 curated resources they can:**
- Browse by category, track, difficulty
- Filter for their level (Beginner/Intermediate/Advanced)
- Bookmark for later
- See view counts and related resources
- Suggest new resources

### 4. LEARNING PATHS (/members/paths)
**9 career pathways:**
- Software Developer, Data Scientist, IoT Engineer, etc.
- Track progress through milestones
- Get resource recommendations for each milestone
- Earn badges and XP for completions

### 5. GAMIFICATION (/members/gamification/*)
**Leaderboards:**
- Individual XP rankings (showing their rank highlighted)
- Team standings (their team's points)
- Full public rankings with real names

**PRISM Shop:**
- Spend XP on digital badges, privileges, physical items
- See purchase history
- Track delivery status

### 6. SOCIAL FEED (/members/social/feed)
**Twitter-like experience:**
- Post updates (500 chars)
- Share project progress
- Ask for help
- Like, retweet, reply
- Get notifications

### 7. BOOKINGS (/members/bookings)
**Book equipment and rooms:**
- Laptops, ESP32, sensors, 3D printer
- PRISM Labs room
- See booking status (approved/pending)
- QR code check-in

---

## EXAMPLE STUDENT JOURNEY

**Student:** Alex Chen, Year 11, Programming Track, Beginner

**3:00 PM** - Login
- Dashboard shows: "Welcome back, Alex!"
- Level 2 (Kaiako), 150 XP
- Programming Team: 450 pts

**3:05 PM** - Check challenges
- Sees 3 active challenges
- Joins "Attendance Ace" challenge

**3:10 PM** - Book equipment
- Books laptop for 2 hours
- Gets QR code

**3:15 PM** - Learning resources
- Filters: Programming, Beginner
- Bookmarks Codecademy Python course
- Starts learning

**4:00 PM** - Session complete
- Earns 10 XP for attendance
- Posts: "Finished Python lesson 5! 🐍"
- Earns 5 XP for post
- New total: 165 XP (15 XP to Level 3!)

---

## PERSONALIZATION FEATURES

**Every student sees:**
✅ Their name everywhere
✅ Their XP and level progress
✅ Their team and team points
✅ Their bookmarks and progress
✅ Their challenge completions
✅ Their attendance record
✅ Their badges earned
✅ Recommended resources (based on track/level)
✅ Quick actions for common tasks

**Privacy:**
- Bookmarks: Private to student
- XP history: Private
- Bookings: Private
- Leaderboard: Public (name, XP, level)
- Social posts: Public to members

---

## HOW TO ACCESS

1. Start server: node server-test.js
2. Visit: http://localhost:3000/members/dashboard
3. Each student logs in with their school email
4. They see THEIR personalized experience

---

**The portal is fully personalized for each unique member!**
