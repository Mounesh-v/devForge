// Backend/services/videoRenderer.js
const fs = require('fs');
const path = require('path');

const RESULTS_DIR = process.env.RESULTS_DIR || './Backend/storage/results';

async function saveSceneJSON(jobId, sceneJSON) {
  const outPath = path.join(RESULTS_DIR, `${jobId}.scene.json`);
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
  await fs.promises.writeFile(outPath, JSON.stringify(sceneJSON, null, 2), 'utf8');
  return outPath;
}

/**
 * Optional: Render server-side into .mp4 using headless three + ffmpeg
 * This is complex so we provide a placeholder that saves JSON for client rendering.
 */
async function renderSceneToVideo(jobId, sceneJSON) {
  // For now: save JSON and return path. Implement headless render later.
  const scenePath = await saveSceneJSON(jobId, sceneJSON);
  // Placeholder: no video produced yet.
  return {
    scenePath,
    videoPath: null
  };
}

module.exports = { saveSceneJSON, renderSceneToVideo };
