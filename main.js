import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js'
import { fetchDirections } from './directions';

import Map from './code/map';

let A = null;
let B = null;

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

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

// Define initial points for out line helper
const points = [];
points.push(new THREE.Vector3(-10, 0, 0));
points.push(new THREE.Vector3(10, 0, 2));

// Create the geometry and material
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 10 });

// Create the line object and add to scene
const line = new THREE.Line(geometry, material);
line.rotateY(Math.PI)
line.scale.multiplyScalar(.25);
line.visible = false;
scene.add(line);

// Map Controls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true
controls.dampingFactor = .25
controls.screenSpacePanning = true
controls.maxDistance = 1000

// Helpers
let gridHelper = new THREE.GridHelper(50, 30, new THREE.Color(0x555555), new THREE.Color(0x333333))
scene.add(gridHelper);

let axisHelper = new THREE.AxesHelper(10, 10);
scene.add(axisHelper);

// Init Light
let light0 = new THREE.AmbientLight(0xfafafa, 10.25)

let light1 = new THREE.PointLight(0xfafafa, 0.4)
light1.position.set(20, 30, 10)

scene.add(light0)
scene.add(light1)

// Our Map 
const map = new Map();
scene.add(map);

// Raycaster 
const raycast = new THREE.Raycaster();
raycast.params.Line.threshold = 3;

// Set up mouse events for raycasting
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('click', onMouseClick);

// Function to update line points
function updateLine(newStart, newEnd) {

  console.log(newStart, newEnd);
  const positions = line.geometry.attributes.position.array;
  positions[0] = newStart.x; // x of first point
  positions[1] = newStart.y; // y of first point
  positions[2] = newStart.z; // z of first point
  positions[3] = newEnd.x;   // x of second point
  positions[4] = newEnd.y;   // y of second point
  positions[5] = newEnd.z;   // z of second point
  line.geometry.attributes.position.array = positions;
  line.geometry.attributes.position.needsUpdate = true; // Required: update the geometry
  line.geometry.computeBoundingSphere(); // Recompute bounding sphere (if needed)
}

function onMouseClick(event) {
  console.log("clicked");

  if (map.buildings == null) { return } // Not ready yet

  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycast.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycast.intersectObjects(map.buildings.children, true);

  if (intersects.length > 0) {

    let object = intersects[0].object;

    if (object.userData.type == "building") {
      console.log("Building clicked", object.userData.info);
      if (A == null) {
        A = object;
        A.material.color.addScalar(.5);
        A.material.needsUpdate = true;
      } else if (A != null && B == null) {
        B = object;
        B.material.color.addScalar(.5);
        B.material.needsUpdate = true;

        updateLine(A.position, B.position);
        line.visible = true;
        fetchDirections(A, B);
      }
    } else {
      console.log("Route clicked", object.userData.info);
    }
  } else {
    // If user clicked nothing then reset A and B
    if (A) {
      A.material.color.addScalar(-.5);
      A.material.needsUpdate = true;
      A = null;
    }

    if (B) {
      B.material.color.addScalar(-.5);
      B.material.needsUpdate = true;
      B = null;
    }

    line.visible = false;
  }
}

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
