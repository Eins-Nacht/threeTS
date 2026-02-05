import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/* ======================
   SCENE
====================== */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaec6cf);

/* ======================
   CAMERA
====================== */
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.set(0.01, 0.10, 0.30);
camera.lookAt(0, 0, 0);

/* ======================
   RENDERER
====================== */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

/* ======================
   CAMERA INFO UI
====================== */
const cameraInfoDiv = document.createElement("div");
cameraInfoDiv.id = "camera-info";
cameraInfoDiv.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #00ff00;
  padding: 12px 16px;
  font-family: monospace;
  font-size: 14px;
  border: 1px solid #00ff00;
  border-radius: 4px;
  z-index: 999;
  line-height: 1.6;
`;
document.body.appendChild(cameraInfoDiv);

/* ======================
   FIRST PERSON CONTROLS
====================== */
const keys = { w: false, a: false, s: false, d: false };
const moveSpeed = 0.005;
const velocity = new THREE.Vector3();
const friction = 0.85;

// Mouse look
let isMouseDown = false;
const euler = new THREE.Euler(0, 0, 0, "YXZ");
const PI_2 = Math.PI / 2;
let lastX = 0;
let lastY = 0;

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "w") keys.w = true;
  if (e.key.toLowerCase() === "d") keys.a = true;
  if (e.key.toLowerCase() === "s") keys.s = true;
  if (e.key.toLowerCase() === "a") keys.d = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() === "w") keys.w = false;
  if (e.key.toLowerCase() === "a") keys.d = false;
  if (e.key.toLowerCase() === "s") keys.s = false;
  if (e.key.toLowerCase() === "d") keys.a = false;
});

renderer.domElement.addEventListener("mousedown", () => {
  isMouseDown = true;
});

document.addEventListener("mouseup", () => {
  isMouseDown = false;
});

document.addEventListener("mousemove", (e) => {
  if (!isMouseDown) {
    lastX = e.clientX;
    lastY = e.clientY;
    return;
  }
  
  const deltaX = e.clientX - lastX;
  const deltaY = e.clientY - lastY;
  
  lastX = e.clientX;
  lastY = e.clientY;
  
  euler.setFromQuaternion(camera.quaternion);
  // Euler doesn't have rotateX/rotateY methods in TypeScript; update components directly
  euler.y -= deltaX * 0.005;
  euler.x -= deltaY * 0.005;
  
  euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
  
  camera.quaternion.setFromEuler(euler);
});

function updateMovement() {
  const moveDir = new THREE.Vector3();
  
  // Get camera direction vectors
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  
  camera.getWorldDirection(forward);
  forward.y = 0; // Keep movement horizontal
  forward.normalize();
  
  right.crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();
  
  // Apply keyboard input
  if (keys.w) moveDir.addScaledVector(forward, moveSpeed);
  if (keys.s) moveDir.addScaledVector(forward, -moveSpeed);
  if (keys.d) moveDir.addScaledVector(right, moveSpeed);
  if (keys.a) moveDir.addScaledVector(right, -moveSpeed);
  
  // Smooth movement with velocity
  velocity.lerp(moveDir, 0.2);
  camera.position.add(velocity);
}

/* ======================
   WINDOW RESIZE HANDLER
====================== */
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
});

/* ======================
   LIGHT (ขั้นต่ำ)
====================== */
scene.add(new THREE.AmbientLight(0xffffff, 1));

/* ======================
   LOAD GLB
====================== */
const loader = new GLTFLoader();

loader.load(
  "/models/city.glb",
  (gltf) => {
    scene.add(gltf.scene);
    console.log("GLB loaded ✅");
  },
  undefined,
  (err) => {
    console.error("GLB load error ❌", err);
  }
);

/* ======================
   RENDER LOOP
====================== */
function animate() {
  requestAnimationFrame(animate);
  updateMovement();
  
  // Update camera info
  cameraInfoDiv.innerHTML = `
    <strong>Camera Position</strong><br>
    X: ${camera.position.x.toFixed(2)}<br>
    Y: ${camera.position.y.toFixed(2)}<br>
    Z: ${camera.position.z.toFixed(2)}<br>
    <br>
    <strong>Controls</strong><br>
    W/A/S/D: Walk<br>
    Mouse Drag: Look Around
  `;
  
  renderer.render(scene, camera);
}
animate();
