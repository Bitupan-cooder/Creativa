const db = require('./db.json');
const urls = [...new Set(db.posts.map(p => p.mediaUrl))];
const https = require('https');

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ url, error: e.message });
    });
  });
}

async function run() {
  console.log(`Checking ${urls.length} distinct urls...`);
  let bad = 0;
  for (const u of urls) {
    const res = await checkUrl(u);
    if (res.status >= 400 || res.error) {
      console.log(`FAIL: ${res.status || res.error} - ${res.url}`);
      bad++;
    }
  }
  console.log(`Done. ${bad} bad URLs.`);
}
run();
