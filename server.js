const path = require('path');

const express = require('express');
const app = express();
const fs = require('fs-extra');

const TEMP_DIR = path.join(__dirname, '.temp');
const port = process.env.PORT || 8080;

function sendPage(res, file) {
  return Promise.all([
    fs
      .readFile(path.join(__dirname, 'views', file))
      .then((s) => s.toString('utf8')),
    fs
      .readFile(path.join(__dirname, 'views', 'footer.html'))
      .then((s) => s.toString('utf8')),
  ])
    .then(([content, footer]) => {
      res.type('html');
      res.end(
        content
          .toString('utf8')
          .replace('<!-- FOOTER -->', footer.toString('utf8')),
      );
    })
    .catch((e) => {
      res.end('an error occurred.');
    });
}

if (!process.env.DEVELOPMENT) {
  app.use((req, res, next) => {
    if (req.path.startsWith('/.well-known/acme-challenge/')) {
      next();
    } else {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
      } else {
        res.header(
          'Content-Security-Policy',
          "default-src 'none'; connect-src 'self' www.google-analytics.com; img-src 'self' www.google-analytics.com; script-src 'self' use.fontawesome.com 'unsafe-eval' cdn.fontawesome.com www.google-analytics.com; style-src 'self' code.cdn.mozilla.net use.fontawesome.com; font-src code.cdn.mozilla.net use.fontawesome.com"
        );
        // res.header('Strict-Transport-Security', 'max-age=63072000');
        next();
      }
    }
  });
}

app.use(function (req, res, next) {
  res.header('X-Frame-Options', 'DENY');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.static('static'));

app.get('/', function (req, res) {
  sendPage(res, 'index.html');
});

app.listen(port, function () {
  console.log(`Listening on localhost:${port}`);
});
