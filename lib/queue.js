const store = require('./store');
const cp = require('child_process');

const MAX_JOBS = process.env.MAX_JOBS || 1;
const MAX_RUN_TIME = process.env.MAX_RUN_TIME || 60 * 1000;

exports.addJob = function addJob(options) {
  store.enqueue('job', options);
  store.set(options.id, { state: 'waiting' });
};

let jobsInProgress = 0;

let jobs = [];

function checkQueue() {
  if (jobsInProgress < MAX_JOBS) {
    store.dequeue('job').then(function (jobOptions) {
      if (!jobOptions) return;

      let worker = cp.fork(`${__dirname}/linter.js`);
      let job = {
        worker: worker,
        startTime: Date.now(),
        id: jobOptions.id,
        status: 'running'
      };

      jobsInProgress++;
      jobs.push(job);
      worker.send(jobOptions);
      store.set(job.id, { state: 'running' });

      worker.on('exit', e => {
        console.log('exit message:', e);
        if (job.status !== 'complete') {
          store.increment('tests_run');
          store.increment('tests_errored');
          store.set(job.id, {
            state: 'error',
            error: 'An unexpected error occurred.'
          });
        }
        job.inactive = true;
        console.log('worker closed: ' + job.id);
      });

      worker.on('message', m => {
        if (job.inactive) return;
        job.status = 'complete';
        store.increment('tests_run');
        if (m.status === 'success') {
          if (m.results.compat.length) {
            store.increment('tests_failed');
          } else {
            store.increment('tests_passed');
          }
          store.set(job.id, {
            state: 'complete',
            results: m.results
          });
          terminate(job);
        } else {
          store.increment('tests_errored');
          store.set(job.id, {
            state: 'error',
            error: m.error ? m.error.message : m
          });
          terminate(job);
        }
      });
    });
  }
}

function terminate(job) {
  job.inactive = true;
  jobsInProgress--;
  job.worker.kill();
}

function monitorHealth() {
  for (var i = 0; i < jobs.length; i++) {
    let job = jobs[i];
    if (Date.now() - job.startTime > MAX_RUN_TIME) {
      job.worker.kill();
      jobs.splice(i, 1);
      i--;
      jobsInProgress--;
    }
  }
}

setInterval(monitorHealth, 10000);

setInterval(checkQueue, 1000);
