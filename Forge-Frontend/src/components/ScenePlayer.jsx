import { useEffect, useRef } from "react";
import { loadAndPlayScene } from "../three/loadSceneJSON";

export default function ScenePlayer({ jobId }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    const sceneUrl = `http://localhost:5000/results/${jobId}.scene.json`;

    loadAndPlayScene(sceneUrl, canvasRef.current)
      .catch((err) => console.error("Scene error:", err));
  }, [jobId]);

  return (
    <div>
      <h2>Animation Preview</h2>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "500px", background: "#000" }}
      />
    </div>
  );
}
