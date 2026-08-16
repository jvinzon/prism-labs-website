# Switching to sql.js (Pure JavaScript SQLite)

## Why?
- better-sqlite3 requires compilation (fails with Node v24)
- sql.js is pure JavaScript - works immediately!
- No build tools needed

## Steps:

### 1. Install sql.js
```cmd
npm uninstall better-sqlite3
npm install sql.js
```

### 2. Update package.json
✅ Already done! (sql.js added, better-sqlite3 removed)

### 3. Update db.js
✅ Already done! (new sql.js wrapper created)

### 4. Initialize database
```cmd
node scripts/init-db-simple.js
```

This creates a simple test database.

### 5. For full schema
Run the full initialization script (I'll create this next):
```cmd
npm run init-db
```

## API Differences

sql.js has a slightly different API than better-sqlite3:

**better-sqlite3:**
```javascript
const db = new Database('./data.db');
db.prepare('SELECT * FROM users').all();
```

**sql.js wrapper:**
```javascript
const db = await createDatabase();
db.prepare('SELECT * FROM users').all();
```

Note the `await` - sql.js is async!

## Next Steps

I'll update all your route files to use the async sql.js API.
This requires adding `async/await` to database calls.

Shall I proceed with updating all the route files?
