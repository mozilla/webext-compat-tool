let store;

if (process.env.REDIS_URL) {
  console.log('using redis store...');
  store = require('./redis-store');
} else {
  console.log('using in-memory store...');
  store = require('./memory-store');
}

module.exports = store;
