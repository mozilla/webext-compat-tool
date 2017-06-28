const store = require('./store');
const cp = require('child_process');

const MAX_JOBS = process.env.MAX_JOBS || 1;
const MAX_RUN_TIME = process.env.MAX_RUN_TIME || 60 * 1000;

exports.addJob = function addJob(options) {
  store.enqueue('job', options);
  store.set(options.id, { state: 'waiting' });
};

let jobsInProgress = 0;

let workers = [];

function checkQueue() {
  if (jobsInProgress < MAX_JOBS) {
    let job = store.dequeue('job').then(function (job) {
      if (!job) return;

      let worker = cp.fork(`${__dirname}/linter.js`);
      let obj = {
        worker: worker,
        startTime: Date.now(),
        id: job.id
      };

      jobsInProgress++;
      workers.push(obj);
      worker.send(job);
      store.set(job.id, { state: 'running' });

      worker.on('exit', e => {
        obj.inactive = true;
        console.log('worker closed: ' + job.id);
      });

      worker.on('message', m => {
        if (job.inactive) return;
        if (m.status === 'success') {
          store.set(job.id, {
            state: 'complete',
            results: m.results
          });
          terminate(job);
        }
        if (m.status === 'error') {
          console.log(m.error);
          store.set(job.id, {
            state: 'error',
            error: m.error.message
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
  worker.kill();
}

function monitorHealth() {
  for (var i = 0; i < workers.length; i++) {
    let job = workers[i];
    if (Date.now() - job.startTime > MAX_RUN_TIME) {
      job.worker.kill();
      workers.splice(i, 1);
      i--;
      jobsInProgress--;
    }
  }
}

setInterval(monitorHealth, 10000);

setInterval(checkQueue, 1000);
