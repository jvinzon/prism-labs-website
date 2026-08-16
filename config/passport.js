const passport = require('passport');
const AzureADStrategy = require('passport-azure-ad').OIDCStrategy;
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Microsoft 365 OAuth Strategy
if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET) {
  passport.use(new AzureADStrategy({
    identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    responseType: 'code',
    responseMode: 'query',
    redirectUrl: process.env.AZURE_REDIRECT_URI,
    allowHttpForRedirectUrl: process.env.NODE_ENV === 'development',
    scope: ['openid', 'profile', 'email', 'User.Read']
  },
  async (iss, sub, profile, accessToken, refreshToken, done) => {
    try {
      let user = db.prepare('SELECT * FROM users WHERE microsoft_id = ?').get(profile.oid);
      
      if (!user) {
        user = db.prepare('SELECT * FROM users WHERE email = ?').get(profile.emails?.[0]?.value);
        
        if (user) {
          db.prepare('UPDATE users SET microsoft_id = ? WHERE id = ?').run(profile.oid, user.id);
        } else {
          const userId = uuidv4();
          const email = profile.emails?.[0]?.value;
          const isAsdahEmail = email?.endsWith('@asdah.school.nz');
          
          db.prepare(`
            INSERT INTO users (id, email, name, microsoft_id, role, year_level)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(userId, email, profile.displayName, profile.oid, isAsdahEmail ? 'admin' : 'member', null);
          
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        }
      }
      
      db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
}

module.exports = passport;
