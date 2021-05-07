const TTL = process.env.REPORT_RETENTION || 30 * 60 // default to 30 minutes

var client = require('redis').createClient(
  process.env.REDIS_URL,
  {
    tls: {
        rejectUnauthorized: false
    }
  }
);

exports.get = function get(key, fallback) {
  return new Promise((resolve, reject) => {
    client.get(key, function (err, replies) {
      if (!replies) {
        if (typeof fallback !== 'undefined') {
          resolve(fallback);
        } else {
          reject();
        }
      } else {
        resolve(replies);
      }
    });
  }).then(v => JSON.parse(v));
}

exports.set = function set(key, value) {
  return new Promise((resolve, reject) => {
    client.set(key, JSON.stringify(value), 'EX', TTL);
    resolve();
  });
}

exports.getLast = function getLast(key, num) {
  return new Promise((resolve, reject) => {
    client.lrange(key, -num, -1, function (err, replies) {
      resolve(replies.map(JSON.parse));
    });
  });
}

exports.getKeys = function getKeys(pattern) {
  return new Promise((resolve, reject) => {
    client.keys(pattern, function (err, replies) {
      resolve(replies);
    });
  });
}

exports.enqueue = function enqueue(key, value) {
  return new Promise((resolve, reject) => {
    client.rpush(key, JSON.stringify(value));
    resolve();
  });
};

exports.dequeue = function dequeue(key) {
  return new Promise((resolve, reject) => {
    client.lpop(key, function (err, replies) {
      resolve(JSON.parse(replies));
    });
  });
};

exports.increment = function increment(key) {
  return new Promise((resolve, reject) => {
    client.INCR(key, resolve);
  });
};
