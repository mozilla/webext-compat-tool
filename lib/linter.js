const webextLinter = require("addons-linter");

const COMPAT_DESCRIPTIONS = [
  'This API has been deprecated by Chrome and has not been implemented by Firefox.',
  'This API has not been implemented by Firefox.'
];

console.log('lint worker started');

process.on('message', (m) => {
  console.log('linting ' + m.packagePath);
  compatLint(m.packagePath, m.id);
});

function compatLint(packagePath, id) {

    console.log(`[${id}] linting....`);
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
        langpack: false
      },
      runAsBinary: false
    });

    linter.run().then((lint) => {
      const results = {
        compat: [],
        errors: [],
        notices: [],
        warnings: []
      }
      lint.warnings.forEach(w => {
        if (COMPAT_DESCRIPTIONS.includes(w.description)) {
          results.compat.push(w);
        } else if (w.code === 'MANIFEST_PERMISSIONS') {
          results.compat.push(w);
        } else {
          results.warnings.push(w);
        }
      });
      results.errors = lint.errors;
      results.notices = lint.notcies;

      process.send({
        status: 'success',
        results: results
      });
      console.log(`[${id}] linting complete.`);
    })
    .catch(e => {
      console.log(`[${id}] linter error:`, e);
      process.send({
        status: 'error',
        error: e
      });
    });
}
