const TTL = 90 * 60; // 30 minutes

var client = require('redis').createClient(process.env.REDIS_URL);

exports.get = function get(key) {
  return new Promise((resolve, reject) => {
    client.get(key, function (err, replies) {
      resolve(replies);
    });
  }).then(v => JSON.parse(v));
}

exports.set = function set(key, value) {
  return new Promise((resolve, reject) => {
    client.set(key, JSON.stringify(value), 'EX', TTL);
    resolve();
  });
}
