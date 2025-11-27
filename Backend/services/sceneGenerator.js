// Backend/services/sceneGenerator.js
const { v4: uuidv4 } = require('uuid');

/**
 * Convert LLM script into a Three.js-friendly scene JSON.
 * This JSON is minimal and easy to consume by a client-side Three.js loader.
 */
function convertScriptToSceneJSON(script) {
  // Basic validation
  if (!script || !Array.isArray(script.scenes)) {
    throw new Error('Invalid script format');
  }

  // Build a scene collection
  const scenes = script.scenes.map((s, idx) => {
    const sceneId = s.id || uuidv4();
    return {
      id: sceneId,
      duration: s.duration || (script.duration / script.scenes.length) || 3,
      narration: s.narration || '',
      camera: s.camera || {
        type: 'static',
        keyframes: [{ t: 0, position: [0, 2, 5], lookAt: [0,0,0] }]
      },
      objects: (s.objects || []).map((o) => {
        return {
          id: o.id || uuidv4(),
          type: o.type || 'sphere',
          params: o.params || { radius: 0.3, color: '#ff0000' },
          keyframes: o.keyframes || [{ t: 0, position: [0,0,0], rotation: [0,0,0], scale: [1,1,1]}],
          physics: o.physics || null
        };
      }),
      events: s.events || []
    };
  });

  return {
    title: script.title || 'Untitled',
    duration: script.duration || scenes.reduce((a,c) => a+c.duration, 0),
    scenes
  };
}

module.exports = { convertScriptToSceneJSON };
