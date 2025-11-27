// Backend/controllers/animationController.js
const AnimationJob = require('../Model/AnimationJob');
const animationQueue = require('../queues/animationQueue');

async function createAnimation(req, res) {
  try {
    const { title, description } = req.body;
    const job = new AnimationJob({
      title,
      description,
      status: 'queued',
      progress: 0,
      scenes: [], // optional initial
      createdAt: new Date()
    });
    await job.save();

    // enqueue job id in your queue system (Bull, Bee-Queue, or custom)
    await animationQueue.addJob(job._id.toString());

    return res.status(201).json({ jobId: job._id, status: job.status });
  } catch (err) {
    console.error('createAnimation error', err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createAnimation };
