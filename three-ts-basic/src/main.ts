import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

// มุมกล้องแบบมองเมือง
camera.position.set(120, 120, 200);
camera.lookAt(0, 0, 0);

/* ======================
   RENDERER
====================== */
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

/* ======================
   CONTROLS
====================== */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

/* ======================
   LIGHTING
====================== */
// แสงทั่วฉาก
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// แสงเหมือนดวงอาทิตย์
const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(200, 300, 100);
scene.add(sunLight);

/* ======================
   GRID (ช่วยอ้างอิงตำแหน่ง)
====================== */
const grid = new THREE.GridHelper(1000, 50);
scene.add(grid);

/* ======================
   LOAD CITY MODEL
====================== */
const loader = new GLTFLoader();

loader.load(
  "/models/city.glb",
  (gltf: GLTF) => {
    const city = gltf.scene;

    // ปรับ scale ถ้าจำเป็น
    city.scale.set(1, 1, 1);
    city.position.set(0, 0, 0);

    // ตั้งค่า mesh ภายใน
    city.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    scene.add(city);
    console.log("City loaded ✅");
  },
  undefined,
  (error: unknown) => {
    console.error("Failed to load city.glb ❌", error);
  }
);

/* ======================
   RESIZE HANDLER
====================== */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ======================
   ANIMATION LOOP
====================== */
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
