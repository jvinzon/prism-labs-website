const { createDatabase } = require('../db');

async function seedResources() {
  console.log('Seeding comprehensive learning resources...');
  
  const db = await createDatabase();
  
  // Comprehensive resource library organized by category and track
  const resources = [
    // ==================== CODING PLATFORMS ====================
    {
      category: 'Interactive Learning',
      track: 'programming',
      title: 'Codecademy',
      url: 'https://www.codecademy.com',
      description: 'Interactive coding lessons with instant feedback. Learn Python, JavaScript, HTML/CSS, SQL, and more through hands-on exercises.',
      difficulty: 'beginner',
      is_free: false,
      free_tier: true,
      sort_order: 1,
      tags: ['interactive', 'python', 'javascript', 'web-dev']
    },
    {
      category: 'Interactive Learning',
      track: 'programming',
      title: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org',
      description: '100% free coding curriculum with certifications. Build real projects while learning web development, data science, and more.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 2,
      tags: ['free', 'certifications', 'projects', 'web-dev']
    },
    {
      category: 'Interactive Learning',
      track: 'programming',
      title: 'W3Schools',
      url: 'https://www.w3schools.com',
      description: 'Comprehensive web development tutorials with examples and quizzes. Perfect reference for HTML, CSS, JavaScript, Python, SQL, and more.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 3,
      tags: ['free', 'reference', 'tutorials', 'web-dev']
    },
    {
      category: 'Interactive Learning',
      track: 'programming',
      title: 'SoloLearn',
      url: 'https://www.sololearn.com',
      description: 'Mobile-friendly coding lessons with community challenges. Learn Python, Java, C++, JavaScript, and 10+ other languages.',
      difficulty: 'beginner',
      is_free: true,
      free_tier: true,
      sort_order: 4,
      tags: ['mobile', 'community', 'multiple-languages']
    },
    {
      category: 'Interactive Learning',
      track: 'programming',
      title: 'LeetCode',
      url: 'https://leetcode.com',
      description: 'Practice coding interview questions with 3000+ problems. Prepare for technical interviews with company-specific questions.',
      difficulty: 'intermediate',
      is_free: true,
      free_tier: true,
      sort_order: 5,
      tags: ['interviews', 'algorithms', 'practice']
    },
    {
      category: 'Interactive Learning',
      track: 'programming',
      title: 'HackerRank',
      url: 'https://www.hackerrank.com',
      description: 'Coding challenges and competitions. Practice algorithms, data structures, SQL, and prepare for job interviews.',
      difficulty: 'intermediate',
      is_free: true,
      sort_order: 6,
      tags: ['challenges', 'competitions', 'interviews']
    },
    
    // ==================== VIDEO TUTORIALS ====================
    {
      category: 'Video Courses',
      track: 'programming',
      title: 'CS50: Introduction to Computer Science',
      url: 'https://cs50.harvard.edu/x/',
      description: "Harvard's legendary intro to CS. Free online with lectures, problem sets, and final project. Covers C, Python, SQL, JavaScript, CSS, HTML.",
      difficulty: 'beginner',
      is_free: true,
      sort_order: 7,
      tags: ['harvard', 'computer-science', 'comprehensive']
    },
    {
      category: 'Video Courses',
      track: 'programming',
      title: 'The Odin Project',
      url: 'https://www.theodinproject.com',
      description: 'Free full-stack web development curriculum. Build real projects while learning Ruby, JavaScript, HTML/CSS, Git, and databases.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 8,
      tags: ['full-stack', 'projects', 'web-dev', 'free']
    },
    {
      category: 'Video Courses',
      track: 'programming',
      title: 'Udemy - Web Development Bootcamp',
      url: 'https://www.udemy.com/course/the-web-developer-bootcamp/',
      description: "Colt Steele's comprehensive bootcamp. HTML, CSS, JavaScript, Node, Python, SQL, React. Often on sale for $15-20.",
      difficulty: 'beginner',
      is_free: false,
      sort_order: 9,
      tags: ['bootcamp', 'full-stack', 'paid']
    },
    {
      category: 'Video Courses',
      track: 'programming',
      title: 'Traversy Media (YouTube)',
      url: 'https://www.youtube.com/c/TraversyMedia',
      description: 'Practical web development tutorials. Crash courses, project builds, and modern frameworks. Free high-quality content.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 10,
      tags: ['youtube', 'free', 'projects', 'web-dev']
    },
    {
      category: 'Video Courses',
      track: 'programming',
      title: 'freeCodeCamp YouTube',
      url: 'https://www.youtube.com/c/Freecodecamp',
      description: '4-12 hour full courses on every programming topic. Completely free with project-based learning.',
      difficulty: 'all-levels',
      is_free: true,
      sort_order: 11,
      tags: ['youtube', 'free', 'long-form']
    },
    
    // ==================== DOCUMENTATION & REFERENCE ====================
    {
      category: 'Documentation',
      track: 'programming',
      title: 'MDN Web Docs',
      url: 'https://developer.mozilla.org',
      description: 'The definitive resource for web technologies. Mozilla-maintained documentation for HTML, CSS, JavaScript, and web APIs.',
      difficulty: 'all-levels',
      is_free: true,
      sort_order: 12,
      tags: ['reference', 'web-dev', 'official']
    },
    {
      category: 'Documentation',
      track: 'programming',
      title: 'Python Documentation',
      url: 'https://docs.python.org/3/',
      description: 'Official Python docs with tutorials, library reference, and language reference. Essential for Python developers.',
      difficulty: 'all-levels',
      is_free: true,
      sort_order: 13,
      tags: ['python', 'official', 'reference']
    },
    {
      category: 'Documentation',
      track: 'programming',
      title: 'DevDocs',
      url: 'https://devdocs.io',
      description: 'Fast, offline-capable API documentation browser. Combines docs from 100+ APIs in one interface.',
      difficulty: 'all-levels',
      is_free: true,
      sort_order: 14,
      tags: ['reference', 'offline', 'multiple-apis']
    },
    
    // ==================== PRACTICE PROJECTS ====================
    {
      category: 'Practice Projects',
      track: 'programming',
      title: 'Frontend Mentor',
      url: 'https://www.frontendmentor.io',
      description: 'Real-world frontend projects with designs provided. Build your portfolio while practicing HTML, CSS, JavaScript, React.',
      difficulty: 'intermediate',
      is_free: true,
      free_tier: true,
      sort_order: 15,
      tags: ['frontend', 'projects', 'portfolio']
    },
    {
      category: 'Practice Projects',
      track: 'programming',
      title: 'JavaScript30',
      url: 'https://javascript30.com',
      description: "Wes Bos's 30-day vanilla JavaScript challenge. Build 30 projects in 30 days without frameworks.",
      difficulty: 'intermediate',
      is_free: true,
      sort_order: 16,
      tags: ['javascript', 'challenge', 'projects']
    },
    {
      category: 'Practice Projects',
      track: 'programming',
      title: '100 Days of Code',
      url: 'https://www.100daysofcode.com',
      description: 'Code for 1 hour every day for 100 days. Join the community, share progress, build consistency.',
      difficulty: 'all-levels',
      is_free: true,
      sort_order: 17,
      tags: ['challenge', 'community', 'consistency']
    },
    
    // ==================== IOT & SYSTEMS ====================
    {
      category: 'Tutorials',
      track: 'systems',
      title: 'Arduino Tutorial Hub',
      url: 'https://www.arduino.cc/en/Tutorial/HomePage',
      description: 'Official Arduino tutorials from basics to advanced. Learn electronics, sensors, motors, and IoT projects.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 18,
      tags: ['arduino', 'iot', 'electronics', 'official']
    },
    {
      category: 'Tutorials',
      track: 'systems',
      title: 'Raspberry Pi Projects',
      url: 'https://projects.raspberrypi.org',
      description: 'Free step-by-step projects for Raspberry Pi. From simple LED circuits to complex IoT systems.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 19,
      tags: ['raspberry-pi', 'iot', 'projects', 'free']
    },
    {
      category: 'Tutorials',
      track: 'systems',
      title: 'ESP32/ESP8266 Guide',
      url: 'https://randomnerdtutorials.com',
      description: 'Comprehensive ESP32 and ESP8266 tutorials. WiFi, Bluetooth, sensors, web servers, home automation.',
      difficulty: 'intermediate',
      is_free: true,
      sort_order: 20,
      tags: ['esp32', 'esp8266', 'iot', 'wifi']
    },
    {
      category: 'Tutorials',
      track: 'systems',
      title: 'Tinkercad Circuits',
      url: 'https://www.tinkercad.com/circuits',
      description: 'Free online circuit simulator. Design and simulate Arduino circuits before building physically.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 21,
      tags: ['simulator', 'arduino', 'free', 'beginner']
    },
    
    // ==================== INNOVATION & DESIGN ====================
    {
      category: 'Design Tools',
      track: 'innovation',
      title: 'Figma Tutorial Hub',
      url: 'https://www.figma.com/resource-library/',
      description: 'Official Figma tutorials and resources. Learn UI/UX design, prototyping, and collaborative design.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 22,
      tags: ['figma', 'design', 'ui-ux', 'free']
    },
    {
      category: 'Design Tools',
      track: 'innovation',
      title: 'Canva Design School',
      url: 'https://www.canva.com/designschool/',
      description: 'Free graphic design courses. Learn design principles, color theory, typography, and layout.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 23,
      tags: ['canva', 'design', 'graphics', 'free']
    },
    {
      category: '3D Design',
      track: 'innovation',
      title: 'Tinkercad',
      url: 'https://www.tinkercad.com',
      description: 'Free 3D design tool from Autodesk. Perfect for beginners to learn 3D modeling for 3D printing.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 24,
      tags: ['3d', 'cad', 'free', 'beginner']
    },
    {
      category: '3D Design',
      track: 'innovation',
      title: 'Fusion 360 for Beginners',
      url: 'https://www.autodesk.com/products/fusion-360/learn',
      description: 'Professional CAD software with free tutorials. Advanced 3D modeling for product design.',
      difficulty: 'intermediate',
      is_free: true,
      free_tier: true,
      sort_order: 25,
      tags: ['3d', 'cad', 'professional']
    },
    
    // ==================== MEDIA & CONTENT CREATION ====================
    {
      category: 'Video Editing',
      track: 'media',
      title: 'DaVinci Resolve Training',
      url: 'https://www.blackmagicdesign.com/products/davinciresolve/training',
      description: 'Professional video editing software with free training. Hollywood-grade color correction and editing.',
      difficulty: 'intermediate',
      is_free: true,
      sort_order: 26,
      tags: ['video', 'editing', 'professional', 'free']
    },
    {
      category: 'Video Editing',
      track: 'media',
      title: 'Adobe Premiere Pro Tutorials',
      url: 'https://helpx.adobe.com/premiere-pro/tutorials.html',
      description: 'Official Adobe tutorials for Premiere Pro. Learn professional video editing techniques.',
      difficulty: 'intermediate',
      is_free: true,
      sort_order: 27,
      tags: ['adobe', 'video', 'editing']
    },
    {
      category: 'Graphic Design',
      track: 'media',
      title: 'Adobe Creative Cloud Tutorials',
      url: 'https://www.adobe.com/creativecloud/learn.html',
      description: 'Free tutorials for Photoshop, Illustrator, After Effects. Learn from Adobe experts.',
      difficulty: 'all-levels',
      is_free: true,
      sort_order: 28,
      tags: ['adobe', 'photoshop', 'illustrator', 'free']
    },
    {
      category: 'Audio Production',
      track: 'media',
      title: 'Audacity Manual',
      url: 'https://manual.audacityteam.org',
      description: 'Free audio editing software documentation. Learn podcast editing, music production, sound design.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 29,
      tags: ['audio', 'podcast', 'free', 'editing']
    },
    {
      category: 'Streaming',
      track: 'media',
      title: 'OBS Studio Guides',
      url: 'https://obsproject.com/wiki',
      description: 'Free streaming and recording software guides. Learn live streaming, screen recording, production.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 30,
      tags: ['streaming', 'obs', 'free', 'live']
    },
    
    // ==================== REFURBISHING & HARDWARE ====================
    {
      category: 'Hardware Repair',
      track: 'refurbishing',
      title: 'iFixit Guides',
      url: 'https://www.ifixit.com/Guide',
      description: 'Free repair guides for thousands of devices. Learn to repair phones, laptops, tablets, and more.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 31,
      tags: ['repair', 'hardware', 'guides', 'free']
    },
    {
      category: 'Hardware Repair',
      track: 'refurbishing',
      title: 'Louis Rossmann YouTube',
      url: 'https://www.youtube.com/c/LouisRossmann',
      description: 'Advanced electronics repair tutorials. Learn board-level repair, soldering, and diagnostics.',
      difficulty: 'advanced',
      is_free: true,
      sort_order: 32,
      tags: ['repair', 'electronics', 'youtube', 'advanced']
    },
    {
      category: 'Soldering',
      track: 'refurbishing',
      title: 'EEVblog Soldering Tutorial',
      url: 'https://www.eevblog.com/2011/06/04/eevblog-179-soldering-tutorial/',
      description: 'Comprehensive soldering tutorial from basics to advanced techniques. Essential for hardware work.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 33,
      tags: ['soldering', 'electronics', 'tutorial']
    },
    
    // ==================== COMPUTER SCIENCE FUNDAMENTALS ====================
    {
      category: 'Computer Science',
      track: 'programming',
      title: 'Khan Academy - Computer Science',
      url: 'https://www.khanacademy.org/computing',
      description: 'Free CS fundamentals: algorithms, cryptography, information theory. Great for beginners.',
      difficulty: 'beginner',
      is_free: true,
      sort_order: 34,
      tags: ['cs', 'algorithms', 'free', 'khan']
    },
    {
      category: 'Computer Science',
      track: 'programming',
      title: 'MIT OpenCourseWare',
      url: 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/',
      description: 'Free MIT CS courses online. Advanced topics in algorithms, AI, systems, and theory.',
      difficulty: 'advanced',
      is_free: true,
      sort_order: 35,
      tags: ['mit', 'cs', 'advanced', 'free']
    },
    
    // ==================== CAREER & PROFESSIONAL ====================
    {
      category: 'Career Development',
      track: 'programming',
      title: 'LinkedIn Learning',
      url: 'https://www.linkedin.com/learning',
      description: 'Professional development courses. Many libraries offer free access. Tech, business, creative skills.',
      difficulty: 'all-levels',
      is_free: false,
      free_tier: true,
      sort_order: 36,
      tags: ['career', 'professional', 'linkedin']
    },
    {
      category: 'Career Development',
      track: 'all',
      title: 'Coursera',
      url: 'https://www.coursera.org',
      description: 'University courses online. Many free to audit. Degrees and certificates from top universities.',
      difficulty: 'all-levels',
      is_free: true,
      free_tier: true,
      sort_order: 37,
      tags: ['university', 'certificates', 'career']
    },
    {
      category: 'Career Development',
      track: 'all',
      title: 'edX',
      url: 'https://www.edx.org',
      description: 'University-level courses from Harvard, MIT, and more. Free to audit, paid certificates.',
      difficulty: 'all-levels',
      is_free: true,
      free_tier: true,
      sort_order: 38,
      tags: ['university', 'harvard', 'mit', 'free']
    }
  ];
  
  // Create table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS learning_resources (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      track TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      difficulty TEXT DEFAULT 'beginner',
      is_free INTEGER DEFAULT 1,
      free_tier INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      tags TEXT,
      views_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS resource_bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (resource_id) REFERENCES learning_resources(id)
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS resource_suggestions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category TEXT,
      track TEXT,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  console.log('Tables created. Inserting resources...');
  
  // Insert resources
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO learning_resources 
    (id, category, track, title, url, description, difficulty, is_free, free_tier, sort_order, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  let inserted = 0;
  resources.forEach(resource => {
    const id = `res-${inserted + 1}`;
    insertStmt.run(
      id,
      resource.category,
      resource.track,
      resource.title,
      resource.url,
      resource.description,
      resource.difficulty,
      resource.is_free ? 1 : 0,
      resource.free_tier ? 1 : 0,
      resource.sort_order,
      JSON.stringify(resource.tags || [])
    );
    inserted++;
  });
  
  db.close();
  
  console.log(`✅ Seeded ${inserted} learning resources!`);
  console.log('\nResources organized by:');
  console.log('  - Category (Interactive, Video, Documentation, Projects, etc.)');
  console.log('  - Track (Programming, Systems, Innovation, Media, Refurbishing)');
  console.log('  - Difficulty (Beginner, Intermediate, Advanced, All Levels)');
  console.log('  - Free vs Paid');
  console.log('\nFeatures:');
  console.log('  - Bookmarking system');
  console.log('  - Resource suggestions');
  console.log('  - View tracking');
  console.log('  - Related resources');
}

seedResources().catch(err => {
  console.error('Error seeding resources:', err);
  process.exit(1);
});
