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

// ตำแหน่งคงที่ (ไม่เดิน)
camera.position.set(0.01, 0.10, 0.30);

/* ======================
   RENDERER
====================== */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

/* ======================
   LIGHT
====================== */
scene.add(new THREE.AmbientLight(0xffffff, 1));

/* ======================
   LOAD GLB
====================== */
const loader = new GLTFLoader();
loader.load("/models/city.glb", (gltf) => {
  scene.add(gltf.scene);
  console.log("GLB loaded ✅");
});

/* ======================
   GYRO / DEVICE ORIENTATION
====================== */

// ขอ permission (จำเป็นมากสำหรับ iOS)
function requestGyroPermission() {
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    // @ts-ignore
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    // iOS
    // @ts-ignore
    DeviceOrientationEvent.requestPermission().then((state: string) => {
      if (state === "granted") {
        window.addEventListener("deviceorientation", onDeviceOrientation);
        console.log("Gyro permission granted ✅");
      }
    });
  } else {
    // Android / Desktop
    window.addEventListener("deviceorientation", onDeviceOrientation);
    console.log("Gyro permission auto-enabled ✅");
  }
}

const euler = new THREE.Euler(0, 0, 0, "YXZ");

function onDeviceOrientation(event: DeviceOrientationEvent) {
  if (
    event.alpha === null ||
    event.beta === null ||
    event.gamma === null
  ) {
    return;
  }

  const alpha = THREE.MathUtils.degToRad(event.alpha); // compass
  const beta = THREE.MathUtils.degToRad(event.beta);   // front-back
  const gamma = THREE.MathUtils.degToRad(event.gamma); // left-right

  // ปรับแกนให้เหมาะกับ Three.js
  euler.set(beta, alpha, -gamma);
  camera.quaternion.setFromEuler(euler);
}

// ต้องให้ user interaction สักครั้ง
window.addEventListener("click", requestGyroPermission, { once: true });

/* ======================
   RESIZE
====================== */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ======================
   RENDER LOOP
====================== */
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
