require('dotenv').config();
const AnimationJob = require('../../Model/AnimationJob');
const textProcessor = require('../../services/textProcessor');
const sceneGenerator = require('../../services/sceneGenerator');
const { renderVideo } = require('../../services/videoRenderer');

async function processAnimationJob(jobId) {
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
}

module.exports = { processAnimationJob };
