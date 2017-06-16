const path = require("path");
const webextLinter = require("addons-linter");
const unzip = require("unzip-crx");
const fs = require('fs-extra');
const chalk = require('chalk');

exports.compatLint = function compatLint(packagePath, id) {

  let tempPath = path.join(".", ".temp", id);

  return fs.ensureDir(tempPath)
    .then(() => { console.log('unpacking extension...'); return unzip(packagePath, tempPath) })
    .then(function() {
      console.log('linting...');
      const linter = webextLinter.createInstance({
        config: {
          // This mimics the first command line argument from yargs,
          // which should be the directory to the extension.
          _: [packagePath],
          logLevel: process.env.VERBOSE ? "debug" : "fatal",
          stack: Boolean(process.env.VERBOSE),
          pretty: false,
          warningsAsErrors: false,
          metadata: false,
          output: "none",
          boring: false,
          selfHosted: false,
          shouldScanFile: fileName => true
        },
        runAsBinary: false
      });

      return linter.run();
    })
    .then((lint) => {
      const results = {
        compat: [],
        errors: [],
        notices: [],
        warnings: []
      }
      lint.warnings.forEach(w => {
        if (w.description === 'This API has not been implemented by Firefox.') {
          results.compat.push(w);
        } else if (w.code === 'MANIFEST_PERMISSIONS') {
          results.compat.push(w);
        } else {
          results.warnings.push(w);
        }
      });
      results.errors = lint.errors;
      results.notices = lint.notcies;

      fs.remove(tempPath);
      return results;
    })
    .catch(e => {
      fs.remove(tempPath);
      throw e;
    });

}
