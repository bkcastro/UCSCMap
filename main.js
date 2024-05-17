import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js'
import Map from './code/map';

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom

document.body.appendChild(stats.dom)

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

// Position the camera
camera.position.y = 10;
//camera.position.x = 10;
camera.position.z = 5;
camera.updateProjectionMatrix();

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setClearColor("white");
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("app").appendChild(renderer.domElement);

// Map Controls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true
controls.dampingFactor = .25
controls.screenSpacePanning = true
controls.maxDistance = 1000

// Mouse 
const mouse = new THREE.Vector2();

// Helpers
let gridHelper = new THREE.GridHelper(50, 30, new THREE.Color(0x555555), new THREE.Color(0x333333))
//scene.add(gridHelper);

let axisHelper = new THREE.AxesHelper(10, 10);
//scene.add(axisHelper);

// Init Light
let light0 = new THREE.AmbientLight(0xfafafa, 10.25)

let light1 = new THREE.PointLight(0xfafafa, 0.4)
light1.position.set(20, 30, 10)

scene.add(light0)
scene.add(light1)

// Raycaster 
const raycast = new THREE.Raycaster();

// Our Map 
const map = new Map(scene);

// Bug if the user clicks to many times then the map crashes 

renderer.domElement.addEventListener('click', (event) => {
  console.log("clicked");

  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycast.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycast.intersectObjects(map.buildings.children, true); // Note this only checks if we clicked buildings

  if (intersects.length > 0) {
    map.checkIntersectedBuildings(intersects[0].object)
  }

});

document.getElementById('calcRoute').addEventListener('click', () => {
  map.generateDirections();
});

document.getElementById('clearRoute').addEventListener('click', () => {
  map.clearRoutes();
})

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

// Animation loop
const animate = function () {
  requestAnimationFrame(animate);

  stats.begin()

  controls.update()

  renderer.render(scene, camera);

  stats.end();
};

animate();
