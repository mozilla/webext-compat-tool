const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs-extra');
const path = require("path");
const queue = require('./lib/queue');
const uuid = require("uuid/v1");

const TEMP_DIR = path.join(__dirname, ".temp");

const store = require('./lib/store');

app.use(function(req, res, next) {
  res.header('Content-Security-Policy', "default-src 'none'; connect-src 'self'; img-src 'self'; script-src 'self' use.fontawesome.com 'unsafe-eval' cdn.fontawesome.com; style-src 'self' code.cdn.mozilla.net use.fontawesome.com; font-src code.cdn.mozilla.net use.fontawesome.com");
  res.header('X-Frame-Options', 'DENY');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// default options
app.use(fileUpload());

app.use(express.static('static'));

app.get('/', function(req, res) {
  res.redirect('/index.html');
});

app.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.package;

  let id = uuid();

  store.set(id, { state: 'created' })
    .then(fs.ensureDir(TEMP_DIR))
    .then(function () {
      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(path.join(TEMP_DIR, sampleFile.name), function(err) {
        if (err) {
          console.log(err, 'mv error');
          return res.status(500).send(err);
        }

        res.redirect('/test/' + id);

        queue.addJob({
          id: id,
          packagePath: path.join(TEMP_DIR, sampleFile.name)
        });

      });
    });
});

app.get('/test/:id', function(req, res) {
  const id = req.params.id;
  store.get(id)
    .then(function (r) {
      return fs.readFile(path.join(__dirname, 'run.html'));
    })
    .then(res.end.bind(res))
    .catch(e => {
      fs.readFile(path.join(__dirname, '404.html'))
        .then(res.end.bind(res))
        .catch(e => res.end(e));
    });
});

app.get('/status/:id', function (req, res) {
  store.get(req.params.id)
    .then(r => JSON.stringify(r))
    .then(res.end.bind(res))
});

port = process.env.PORT || 8080;

app.listen(port, function () {
  console.log(`Listening on localhost:${port}`);
})
