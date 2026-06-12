const db = require('./db.json');
console.log(db.posts.slice(0, 5).map(p => p.mediaUrl));
