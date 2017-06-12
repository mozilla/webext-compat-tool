const TTL = 30 * 60 * 1000; // 30 minutes

let store = Object.create(null);

exports.get = function get(key) {
  return new Promise((resolve, reject) => {
    if (key in store) {
      resolve(store[key]);
    } else {
      reject('No entry found for key: ' + key);
    }
  });
}

exports.set = function set(key, value) {
  return new Promise((resolve, reject) => {
    store[key] = value;
    store[key]._created = Date.now();
    resolve();
  });
}

setInterval(function () {
  const now = Date.now();
  Object.keys(store).forEach(function (key) {
    if (store[key] && now - store[key]._created > TTL) {
      delete store[key]
    }
  });
}, 60 * 1000);
