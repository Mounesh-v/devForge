import * as THREE from 'three';

export async function loadAndPlayScene(sceneUrl, canvas) {
  const resp = await fetch(sceneUrl);
  if (!resp.ok) throw new Error("Scene file not found");

  const sceneJSON = await resp.json();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  // Objects
  for (const s of sceneJSON.scenes) {
    for (const o of s.objects) {
      let mesh;
      if (o.type === "sphere") {
        const geom = new THREE.SphereGeometry(o.params.radius || 0.3, 32, 32);
        const mat = new THREE.MeshStandardMaterial({
          color: o.params.color || "#ff0000",
        });
        mesh = new THREE.Mesh(geom, mat);
      } else if (o.type === "plane" || o.type === "box") {
        const geom = new THREE.BoxGeometry(
          o.params.width || 1,
          o.params.height || 1,
          o.params.depth || 0.1
        );
        const mat = new THREE.MeshStandardMaterial({
          color: o.params.color || "#888888",
        });
        mesh = new THREE.Mesh(geom, mat);
      } else {
        const geom = new THREE.BoxGeometry(1, 1, 1);
        mesh = new THREE.Mesh(
          geom,
          new THREE.MeshStandardMaterial({ color: "#00ff00" })
        );
      }

      const k = (o.keyframes && o.keyframes[0]) || {};
      const pos = k.position || [0, 0, 0];
      mesh.position.set(...pos);
      scene.add(mesh);
    }
  }

  // Camera
  const camKey = sceneJSON.scenes[0].camera.keyframes[0];
  camera.position.set(...(camKey.position || [0, 2, 5]));
  camera.lookAt(...(camKey.lookAt || [0, 0, 0]));

  // Loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  return { scene, camera, renderer };
}
