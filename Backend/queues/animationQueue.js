const { processAnimationJob } = require('../src/workers/animationWorker');

const queue = [];
let processing = false;

function addJob(jobId) {
  queue.push(jobId);
  processQueue();
}

async function processQueue() {
  if (processing) return;
  processing = true;

  while (queue.length) {
    const jobId = queue.shift();
    try {
      await processAnimationJob(jobId);
      console.log("Job completed:", jobId);
    } catch (err) {
      console.error("Job failed:", jobId, err);
    }
  }

  processing = false;
}

module.exports = { addJob };
