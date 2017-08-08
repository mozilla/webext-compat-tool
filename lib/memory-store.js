const TTL = 30 * 60 * 1000; // 30 minutes

let store = Object.create(null);
let queue = [];

exports.get = function get(key, fallback) {
  return new Promise((resolve, reject) => {
    if (key in store) {
      resolve(store[key]);
    } else {
      if (typeof fallback !== 'undefined') {
        resolve(fallback);
      } else {
        reject('No entry found for key: ' + key);
      }
    }
  });
};

exports.set = function set(key, value) {
  return new Promise((resolve, reject) => {
    store[key] = value;
    store[key]._created = Date.now();
    resolve();
  });
};

exports.enqueue = function enqueue(key, value) {
  return new Promise((resolve, reject) => {
    queue.push(value);
    resolve();
  });
};

exports.dequeue = function dequeue(key) {
  return new Promise((resolve, reject) => {
    resolve(queue.shift());
  });
};

exports.increment = function increment(key) {
  return new Promise((resolve, reject) => {
    if (key in store) {
      store[key]++;
    } else {
      store[key] = 1;
    }
    resolve();
  });
};

setInterval(function () {
  const now = Date.now();
  Object.keys(store).forEach(function (key) {
    if (store[key] && now - store[key]._created > TTL) {
      delete store[key]
    }
  });
}, 60 * 1000);
