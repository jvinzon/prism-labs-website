const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './data/prism-labs.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('Creating database schema...');

// Users & Auth
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    year_level INTEGER,
    role TEXT DEFAULT 'member' CHECK(role IN ('member', 'admin', 'superadmin')),
    microsoft_id TEXT UNIQUE,
    github_username TEXT,
    avatar_url TEXT,
    bio TEXT,
    interests TEXT,
    skills TEXT,
    join_date TEXT DEFAULT (datetime('now')),
    last_login TEXT,
    is_active INTEGER DEFAULT 1,
    consent_form_signed INTEGER DEFAULT 0,
    consent_form_date TEXT,
    parent_email TEXT,
    parent_phone TEXT,
    privacy_settings TEXT DEFAULT '{"show_email": false, "show_year": true, "show_projects": true}'
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Badges
db.exec(`
  CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#2563EB',
    category TEXT CHECK(category IN ('attendance', 'project', 'community', 'skill', 'special')),
    points INTEGER DEFAULT 10,
    rarity TEXT DEFAULT 'common' CHECK(rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_badges (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    badge_id TEXT NOT NULL,
    earned_date TEXT DEFAULT (datetime('now')),
    context TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE(user_id, badge_id)
  )
`);

// Events & Attendance
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT CHECK(event_type IN ('session', 'workshop', 'competition', 'showcase', 'other')),
    track TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    location TEXT,
    max_attendees INTEGER,
    is_recurring INTEGER DEFAULT 0,
    recurrence_pattern TEXT,
    google_event_id TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    check_in_time TEXT DEFAULT (datetime('now')),
    check_out_time TEXT,
    qr_code TEXT,
    status TEXT DEFAULT 'present' CHECK(status IN ('present', 'late', 'excused', 'absent')),
    notes TEXT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(event_id, user_id)
  )
`);

// Resources
db.exec(`
  CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    resource_type TEXT CHECK(resource_type IN ('tutorial', 'cheatsheet', 'template', 'video', 'article', 'book', 'tool')),
    track TEXT,
    difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
    tags TEXT,
    file_path TEXT,
    external_url TEXT,
    author_id TEXT,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 0,
    published_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (author_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS resource_bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    UNIQUE(user_id, resource_id)
  )
`);

// Forum
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_locked INTEGER DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0,
    is_locked INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    parent_id TEXT,
    content TEXT NOT NULL,
    is_accepted INTEGER DEFAULT 0,
    votes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    comment_id TEXT,
    post_id TEXT,
    vote_type INTEGER CHECK(vote_type IN (-1, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(user_id, comment_id, post_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS post_tags (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(post_id, tag)
  )
`);

// Projects
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    track TEXT NOT NULL,
    status TEXT DEFAULT 'planning' CHECK(status IN ('planning', 'active', 'on_hold', 'completed', 'archived')),
    github_repo TEXT,
    team_lead_id TEXT,
    start_date TEXT,
    end_date TEXT,
    budget REAL DEFAULT 0,
    budget_spent REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (team_lead_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS project_members (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(project_id, user_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    completed_at TEXT,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )
`);

// Inventory
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK(category IN ('laptop', 'component', 'tool', 'consumable', 'other')),
    quantity INTEGER DEFAULT 1,
    unit TEXT DEFAULT 'unit',
    location TEXT,
    condition TEXT CHECK(condition IN ('new', 'good', 'fair', 'poor', 'broken')),
    value REAL DEFAULT 0,
    purchase_date TEXT,
    supplier TEXT,
    warranty_until TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS inventory_transactions (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    user_id TEXT,
    transaction_type TEXT CHECK(transaction_type IN ('checkout', 'return', 'add', 'remove', 'repair', 'dispose')),
    quantity INTEGER NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Mentorship
db.exec(`
  CREATE TABLE IF NOT EXISTS mentorships (
    id TEXT PRIMARY KEY,
    mentor_id TEXT NOT NULL,
    mentee_id TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'inactive')),
    goals TEXT,
    meeting_frequency TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (mentor_id) REFERENCES users(id),
    FOREIGN KEY (mentee_id) REFERENCES users(id)
  )
`);

// Budget
db.exec(`
  CREATE TABLE IF NOT EXISTS budget_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    allocated REAL DEFAULT 0,
    term TEXT NOT NULL,
    year INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    user_id TEXT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    expense_date TEXT NOT NULL,
    receipt_path TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'reimbursed')),
    approved_by TEXT,
    approved_at TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES budget_categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
  )
`);

// Permission Forms
db.exec(`
  CREATE TABLE IF NOT EXISTS permission_forms (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT,
    emergency_contact TEXT,
    medical_info TEXT,
    photo_consent INTEGER DEFAULT 0,
    data_consent INTEGER DEFAULT 0,
    activity_consent INTEGER DEFAULT 0,
    signed_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    is_valid INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Communications
db.exec(`
  CREATE TABLE IF NOT EXISTS communications (
    id TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('email', 'teams', 'sms', 'announcement')),
    subject TEXT,
    content TEXT,
    recipients TEXT,
    sent_by TEXT,
    sent_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'sent',
    teams_message_id TEXT,
    FOREIGN KEY (sent_by) REFERENCES users(id)
  )
`);

// Analytics
db.exec(`
  CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT,
    resource_id TEXT,
    post_id TEXT,
    project_id TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Integrations
db.exec(`
  CREATE TABLE IF NOT EXISTS integration_config (
    id TEXT PRIMARY KEY,
    service TEXT UNIQUE NOT NULL,
    config TEXT,
    last_sync TEXT,
    is_enabled INTEGER DEFAULT 1
  )
`);


// ============ SOCIAL MEDIA FEED ============
db.exec(`
  CREATE TABLE IF NOT EXISTS social_posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    character_count INTEGER DEFAULT 0,
    parent_id TEXT, -- For replies
    is_retweet INTEGER DEFAULT 0,
    original_post_id TEXT,
    media_urls TEXT, -- JSON array
    hashtags TEXT, -- JSON array
    mentions TEXT, -- JSON array
    likes_count INTEGER DEFAULT 0,
    retweets_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_edited INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES social_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (original_post_id) REFERENCES social_posts(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS post_likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES social_posts(id) ON DELETE CASCADE,
    UNIQUE(user_id, post_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS post_retweets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES social_posts(id) ON DELETE CASCADE,
    UNIQUE(user_id, post_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS post_bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES social_posts(id) ON DELETE CASCADE,
    UNIQUE(user_id, post_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS follows (
    id TEXT PRIMARY KEY,
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(follower_id, following_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('like', 'retweet', 'reply', 'follow', 'mention')),
    actor_id TEXT NOT NULL,
    post_id TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES social_posts(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS trending_topics (
    id TEXT PRIMARY KEY,
    hashtag TEXT NOT NULL UNIQUE,
    post_count INTEGER DEFAULT 0,
    last_used TEXT,
    category TEXT DEFAULT 'general'
  )
`);



// ============ PUBLIC PROJECT SHOWCASE ============
db.exec(`
  CREATE TABLE IF NOT EXISTS project_showcase (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    track TEXT CHECK(track IN ('Programming', 'Refurbishing', 'Innovation', 'Systems')),
    team_members TEXT, -- JSON array of user IDs
    lead_student_id TEXT,
    status TEXT CHECK(status IN ('planning', 'in_progress', 'completed', 'showcased')),
    github_repo TEXT,
    demo_url TEXT,
    screenshots TEXT, -- JSON array of image URLs
    technologies TEXT, -- JSON array
    skills_developed TEXT, -- JSON array
    term TEXT, -- e.g., "2026-T3"
    year INTEGER,
    is_public INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (lead_student_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS showcase_likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES project_showcase(id) ON DELETE CASCADE,
    UNIQUE(user_id, project_id)
  )
`);

// ============ LEARNING PATHS & CAREER PROGRESSION ============
db.exec(`
  CREATE TABLE IF NOT EXISTS learning_paths (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "Software Engineer Path"
    track TEXT CHECK(track IN ('Programming', 'Refurbishing', 'Innovation', 'Systems')),
    description TEXT,
    career_outcomes TEXT, -- JSON array of careers
    estimated_duration TEXT, -- e.g., "2-3 years"
    difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS path_milestones (
    id TEXT PRIMARY KEY,
    path_id TEXT NOT NULL,
    name TEXT NOT NULL, -- e.g., "Learn Python Basics"
    description TEXT,
    milestone_type TEXT CHECK(milestone_type IN ('skill', 'project', 'certification', 'competition')),
    order_in_path INTEGER DEFAULT 0,
    estimated_hours INTEGER,
    resources TEXT, -- JSON array of resource IDs
    prerequisites TEXT, -- JSON array of milestone IDs
    badge_id TEXT,
    is_completed INTEGER DEFAULT 0,
    FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_path_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    path_id TEXT NOT NULL,
    milestone_id TEXT,
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    progress_percentage INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (milestone_id) REFERENCES path_milestones(id),
    UNIQUE(user_id, path_id, milestone_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS career_outcomes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL, -- e.g., "Software Engineer"
    industry TEXT, -- e.g., "Technology"
    description TEXT,
    avg_salary_nzd TEXT, -- e.g., "$70,000 - $120,000"
    required_skills TEXT, -- JSON array
    related_paths TEXT, -- JSON array of path IDs
    study_pathways TEXT, -- JSON array (e.g., "Computer Science degree", "Bootcamp")
    job_outlook TEXT, -- e.g., "High demand"
    is_active INTEGER DEFAULT 1
  )
`);

// ============ EQUIPMENT & ROOM BOOKING + RESOURCE REQUESTS ============
db.exec(`
  CREATE TABLE IF NOT EXISTS bookable_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "Dell Laptop #5", "Computer Room", "ESP32 Kit"
    item_type TEXT CHECK(item_type IN ('laptop', 'component', 'tool', 'room', 'other')),
    category TEXT,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    available_quantity INTEGER DEFAULT 1,
    booking_unit TEXT DEFAULT 'hour', -- hour, day, session
    max_booking_duration INTEGER DEFAULT 4, -- max hours per booking
    requires_approval INTEGER DEFAULT 0,
    approval_role TEXT DEFAULT 'admin',
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    purpose TEXT, -- Why they need it
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    approved_by TEXT,
    approved_at TEXT,
    rejected_reason TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES bookable_items(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS resource_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    request_type TEXT CHECK(request_type IN ('component', 'equipment', 'software', 'book', 'other')),
    item_name TEXT NOT NULL,
    description TEXT,
    justification TEXT, -- Why they need it
    estimated_cost REAL,
    quantity INTEGER DEFAULT 1,
    project_id TEXT, -- Related project
    status TEXT CHECK(status IN ('pending', 'approved', 'ordered', 'received', 'rejected')),
    approved_by TEXT,
    approved_at TEXT,
    ordered_at TEXT,
    received_at TEXT,
    rejected_reason TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
  )
`);

// ============ BLOG / NEWS SECTION ============
db.exec(`
  CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL, -- Markdown
    excerpt TEXT,
    author_id TEXT,
    post_type TEXT CHECK(post_type IN ('news', 'lesson_recap', 'project_spotlight', 'announcement', 'tutorial')),
    track TEXT,
    tags TEXT, -- JSON array
    featured_image TEXT,
    is_published INTEGER DEFAULT 0,
    published_at TEXT,
    views_count INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    allow_comments INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (author_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS blog_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_id TEXT,
    is_approved INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES blog_comments(id) ON DELETE CASCADE
  )
`);

// ============ THEME PREFERENCES ============
db.exec(`
  CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    theme TEXT CHECK(theme IN ('light', 'dark', 'prism', 'ocean', 'forest')) DEFAULT 'light',
    accent_color TEXT DEFAULT '#2563EB',
    font_size TEXT CHECK(font_size IN ('small', 'medium', 'large')) DEFAULT 'medium',
    email_notifications INTEGER DEFAULT 1,
    sms_notifications INTEGER DEFAULT 0,
    weekly_digest INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// ============ AUTOMATED REMINDERS ============
db.exec(`
  CREATE TABLE IF NOT EXISTS reminder_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "Session Reminder"
    type TEXT CHECK(type IN ('email', 'sms', 'teams')),
    subject TEXT,
    content TEXT, -- With placeholders like {name}, {event_time}, {location}
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS scheduled_reminders (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    recipient_type TEXT CHECK(recipient_type IN ('all', 'members', 'admins', 'specific')),
    recipient_ids TEXT, -- JSON array if specific
    related_event_id TEXT,
    related_booking_id TEXT,
    send_at TEXT NOT NULL,
    sent_at TEXT,
    status TEXT CHECK(status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (template_id) REFERENCES reminder_templates(id),
    FOREIGN KEY (related_event_id) REFERENCES events(id),
    FOREIGN KEY (related_booking_id) REFERENCES bookings(id)
  )
`);

console.log('New tables created for: Projects, Learning Paths, Bookings, Blog, Themes, Reminders');


console.log('Inserting default data...');

// Default badges
const badges = [
  ['badge_first_session', 'First Steps', 'Attended your first PRISM Labs session', '🎯', '#2563EB', 'attendance', 10, 'common'],
  ['badge_5_sessions', 'Regular', 'Attended 5 sessions', '⭐', '#3B82F6', 'attendance', 25, 'common'],
  ['badge_10_sessions', 'Committed', 'Attended 10 sessions', '🔥', '#10B981', 'attendance', 50, 'uncommon'],
  ['badge_perfect_term', 'Perfect Attendance', 'Attended every session in a term', '👑', '#F97316', 'attendance', 100, 'rare'],
  ['badge_first_project', 'Project Starter', 'Started your first project', '🚀', '#8B5CF6', 'project', 25, 'common'],
  ['badge_project_completed', 'Finisher', 'Completed a project', '🏆', '#10B981', 'project', 50, 'uncommon'],
  ['badge_team_lead', 'Team Lead', 'Led a project team', '🎖️', '#F59E0B', 'project', 75, 'rare'],
  ['badge_innovation', 'Innovator', 'Created something truly unique', '💡', '#EC4899', 'project', 100, 'epic'],
  ['badge_helper', 'Helper', 'Answered 5 forum questions', '🤝', '#06B6D4', 'community', 30, 'common'],
  ['badge_mentor', 'Mentor', 'Mentored a junior member', '🧭', '#8B5CF6', 'community', 75, 'rare'],
  ['badge_contributor', 'Contributor', 'Shared a resource with the community', '📚', '#14B8A6', 'community', 40, 'uncommon'],
  ['badge_python', 'Python Developer', 'Completed Python track tutorials', '🐍', '#3B82F6', 'skill', 50, 'uncommon'],
  ['badge_web', 'Web Wizard', 'Built a web application', '🌐', '#F97316', 'skill', 50, 'uncommon'],
  ['badge_hardware', 'Hardware Hacker', 'Completed a hardware project', '🔧', '#6366F1', 'skill', 50, 'uncommon'],
  ['badge_ai', 'AI Explorer', 'Built an AI/ML project', '🤖', '#10B981', 'skill', 75, 'rare'],
  ['badge_founder', 'Founder', 'Original PRISM Labs member (2026)', '🌟', '#FBBF24', 'special', 200, 'legendary'],
  ['badge_ambassador', 'Ambassador', 'Represented PRISM Labs at an event', '🎤', '#EC4899', 'special', 100, 'epic'],
];

const insertBadge = db.prepare(`INSERT OR IGNORE INTO badges (id, name, description, icon, color, category, points, rarity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
badges.forEach(b => insertBadge.run(...b));

// Default categories
const categories = [
  ['cat_general', 'General Discussion', 'Anything and everything PRISM Labs', '💬', '#2563EB', 1],
  ['cat_programming', 'Programming', 'Python, web dev, algorithms, code help', '💻', '#3B82F6', 2],
  ['cat_hardware', 'Hardware & Electronics', 'ESP32, sensors, circuits, refurbishment', '🔌', '#8B5CF6', 3],
  ['cat_projects', 'Project Showcase', 'Share your work and get feedback', '🚀', '#10B981', 4],
  ['cat_help', 'Help & Questions', 'Stuck on something? Ask here!', '❓', '#F97316', 5],
  ['cat_offtopic', 'Off-Topic', 'Non-tech discussions, memes, fun stuff', '🎮', '#EC4899', 6],
];

const insertCat = db.prepare(`INSERT OR IGNORE INTO categories (id, name, description, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)`);
categories.forEach(c => insertCat.run(...c));

// Default integrations
const integrations = [
  ['microsoft', 'microsoft', '{"enabled": false}', 0],
  ['github', 'github', '{"enabled": false}', 0],
  ['google_calendar', 'google_calendar', '{"enabled": false}', 0],
  ['teams', 'teams', '{"enabled": false}', 0],
  ['resend', 'resend', '{"enabled": false}', 0],
];

const insertInt = db.prepare(`INSERT OR IGNORE INTO integration_config (id, service, config, is_enabled) VALUES (?, ?, ?, ?)`);
integrations.forEach(i => insertInt.run(...i));

console.log('Database initialized successfully!');
console.log(`Database location: ${dbPath}`);

db.close();
