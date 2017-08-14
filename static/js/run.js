var id = location.toString().match(/test\/([a-fA-F0-9-]+)/)[1];

let finalStatus;

function checkStatus() {
  fetch('/status/' + id)
    .then(r => r.json())
    .then(status => {
      if (status.state === 'waiting') {
        document.querySelector('.status__message').innerHTML = 'Waiting in line for a linter to become available';
      } else if (status.state === 'running') {
        document.querySelector('.status__message').innerHTML = 'Uploading and evaluating your extension';
        document.querySelector('.status__notice').innerHTML = '(This may take a minute for larger extensions)';
      }

      if (status.state === 'complete') {
        document.querySelector('body').classList.add('complete');
        document.querySelector('.status').classList.add('is-complete');

        let results = Object.entries(status.results).reduce((result, [type, entries]) => {
          result[type] = Object.values(entries.reduce((result, entry) => {
            if (!result[entry.message]) {
              result[entry.message] = {
                message: entry.message,
                locations: []
              };
            }
            result[entry.message].locations.push({
              file: entry.file,
              line: entry.line
            });
            return result;
          }, {}));
          return result;
        }, {});

        finalStatus = results.compat.length ? 'notCompat' : 'compat';
        showReport(results);
      } else if (status.state === 'error') {
        document.querySelector('body').classList.add('complete');
        document.querySelector('.status').classList.add('is-complete');

        finalStatus = 'error';
        document.querySelector('body').classList.add('complete');
        showError(status.error);
      } else {
        setTimeout(checkStatus, 1000);
      }
    });
}

function showError(error) {
  let summary = document.querySelector('.report__summary');
  let result = d(
    d('h1', 'Error processing your package'),
    d('h2', error)
  );

  document.querySelector('.hero__result').append(result.toDom());
  document.querySelector(".hero__icon").classList.add("hero__icon--warning", "fa-exclamation-triangle");

  document.querySelector('.details__report').innerHTML = JSON.stringify(results, null, 2);
}

function showReport(results) {
  let summary = document.querySelector('.report__summary');
  let details = document.querySelector('.details__report');

  let report;
  if (results.compat.length) {
    document.querySelector('.hero__result').innerHTML = 'Your extension may not be compatible with Firefox. Read below to view possible compatibility issues and a full report.';
    document.querySelector(".hero__icon").classList.add("hero__icon--warning", "fa-exclamation-triangle");

    let reportTitle = `${results.compat.length} compatibility ${results.compat.length > 1 ? 'issues' : 'issue'} found:`
    document.querySelector(".report__title").innerHTML = reportTitle;

    report = d(
      d('ul',
        results.compat.map(m => d('li',
          d('h4', m.message),
          d('p', 'found in the following locations:'),
          d('ul', {'class': 'locations'},
            m.locations.map(l => d('li',
              l.file,
              (l.line ? ':' + l.line : '')
            ))
          )
        ))
      )
    );
  } else {
    finalStatus = 'compat';
    document.body.classList.add('result--compat');
    report = d();
    let result = d('h2', 'Great news! Your extension is compatible with Firefox.')
    document.querySelector('.hero__result').append(result.toDom());
    document.querySelector(".hero__icon").classList.add("hero__icon--check", "fa-check-circle");
  }

  summary.appendChild(report.toDom());

  details.innerHTML = JSON.stringify(results, null, 2);
}

checkStatus();
