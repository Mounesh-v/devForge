require('dotenv').config();
const agenda = require('../../queues/animationQueue');
const AnimationJob = require('../../Model/AnimationJob');
const mongoose = require('../../config/db');
const textProcessor = require('../../services/textProcessor');
const sceneGenerator = require('../../services/sceneGenerator');
const { renderVideo } = require('../../services/videoRenderer');   

agenda.define('process-animation', async (job) => {
  const { jobId } = job.attrs.data;
  const anim = await AnimationJob.findById(jobId);
  if (!anim) throw new Error('AnimationJob not found');

  try {
    anim.status = 'processing';
    anim.progress = 5;
    await anim.save();

    const structured = await textProcessor.parse(anim.description, { title: anim.title });
    anim.structured = structured;
    anim.progress = 25;
    await anim.save();

    const scenes = await sceneGenerator.generate(structured);
    anim.scenes = scenes;
    anim.progress = 50;
    await anim.save();

    anim.status = 'rendering';
    anim.progress = 60;
    await anim.save();

    const resultPath = await renderVideo(jobId, scenes, { outputDir: 'storage/results' });

    anim.resultUrl = resultPath;
    anim.progress = 100;
    anim.status = 'completed';
    anim.logs.push('Rendered at ' + new Date().toISOString());
    await anim.save();

    return { resultPath };
  } catch (err) {
    console.error(err);
    anim.status = 'failed';
    anim.error = err.message;
    anim.logs.push(err.message);
    await anim.save();
    throw err;
  }
});

agenda.on('fail', async (err, job) => {
  console.error('Agenda job failed', job.attrs && job.attrs.name, err);
});

(async function startAgenda() {
  try {
    await agenda.start();
    console.log('Agenda animation worker started');
  } catch (err) {
    console.error('Failed to start Agenda', err);
  }
})();

['SIGTERM', 'SIGINT'].forEach((sig) => {
  process.on(sig, async () => {
    try {
      await agenda.stop();
      console.log('Agenda stopped (clean shutdown)');
      process.exit(0);
    } catch (err) {
      console.error('Error stopping Agenda', err);
      process.exit(1);
    }
  });
});
