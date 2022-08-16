import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { genererFigures } from "./figures";
import {CSG} from "three-csg-ts";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(2, 2, -1);
gui.add(directionalLight, "intensity").min(0).max(1).step(0.001);
gui.add(directionalLight.position, "x").min(-50).max(50).step(0.001);
gui.add(directionalLight.position, "y").min(-50).max(50).step(0.001);
gui.add(directionalLight.position, "z").min(-50).max(50).step(0.001);
scene.add(directionalLight);
directionalLight.castShadow = true;

directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.near = -20;
directionalLight.shadow.camera.far = 8;
// directionalLight.shadow.radius = 10

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;
gui.add(material, "metalness").min(0).max(1).step(0.001);
gui.add(material, "roughness").min(0).max(1).step(0.001);

/**
 * Helpers
 * 
 * Description: Axes and grid helpers
 * TODO: Remove before publishing
*/

// Axes Helper 
const axes = new THREE.AxesHelper( 5 );
scene.add( axes );

// Grid Helper
const gridSize = 10;
const gridDivisions = 10;
const gridHelper = new THREE.GridHelper( gridSize, gridDivisions, 'black', 'pink' );
scene.add( gridHelper );

/**
 * Objects
*/

// Simple Closed Polygon Algorithm // Source: https://openprocessing.org/sketch/1626897 by Michael Hoehn
let resolution = Math.floor(4 + fxrand() * 11); 
let stepSize = 1 + fxrand() * 4; 
let radius = Math.floor(2 + fxrand() * 5); 
let x = [];
let y = []; 
let angle = (Math.PI / 180) * (360 / resolution);
const positions = [];

for ( let i = 0; i < resolution; i++ ) {
  x.push(Math.cos(angle * i) * radius);
  y.push(Math.sin(angle * i) * radius);
}

for ( let i = 0; i < resolution; i++ ) {
  const splinePts = new THREE.Vector2(
    x[i] += fxrand() * stepSize - (stepSize/2),
    y[i] += fxrand() * stepSize - (stepSize/2)
  )
  positions.push(splinePts);
}

const roomShape = new THREE.Shape();
const extrudeSettings = {
	steps: 1,
	depth: 0.2,
	bevelEnabled: false,
	bevelThickness: 0,
	bevelSize: 0,
	bevelOffset: 0,
	bevelSegments: 0
};
roomShape.setFromPoints( positions );

const roomExtrusionGeometry = new THREE.ExtrudeGeometry( roomShape, extrudeSettings );
const roomMaterial = new THREE.MeshBasicMaterial( { color: 'gray', wireframe: false } );
const roomMesh = new THREE.Mesh( roomExtrusionGeometry, material );
roomMesh.castShadow = true;
roomMesh.receiveShadow = true;

// Create the room outline using positions[]
const splineGeometry = new THREE.BufferGeometry().setFromPoints(positions);
const splineMaterial = new THREE.LineBasicMaterial( { color: 'black' } ); 
const splineObject = new THREE.Line( splineGeometry, splineMaterial );

scene.add(splineObject);
scene.add(roomMesh);

splineObject.rotation.x = -Math.PI * 0.5;
roomMesh.rotation.x = -Math.PI * 0.5;

/**
 * Anaver.se API examples (removed from scene)
 * Add objects using the figure map. Here they are added one by one but one could simply iterate over the figures array to add them all at once.
*/

const figures = genererFigures(fxhash).figures;

var figureMap = {};

// mapping them by name makes the easier to use
figures.forEach((fig) => (figureMap[fig.name] = fig));

// Box Geometry 
const box = new THREE.Mesh(
  new THREE[figureMap.box.geometry.type](...figureMap.box.geometry.args),
  material
);
box.position.set(figureMap.box.pos.x, figureMap.box.pos.y, figureMap.box.pos.z);
box.castShadow = true;
box.receiveShadow = true;

//scene.add(box);

// Plane Geometry
const plane = new THREE.Mesh(
  new THREE[figureMap.plane.geometry.type](...figureMap.plane.geometry.args),
  material
);
plane.rotation.x = figureMap.plane.rot.x;
plane.position.y = figureMap.plane.pos.y;

plane.receiveShadow = true;

//scene.add(plane);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);

camera.position.x = -5;
camera.position.y = 3.2;
camera.position.z = 5.5;
camera.lookAt(getCenterPoint(roomMesh));
scene.add(camera);

// gui camera controls
gui.add(camera.position, "x").min(-50).max(50).step(0.001);
gui.add(camera.position, "y").min(-50).max(50).step(0.001);
gui.add(camera.position, "z").min(-50).max(50).step(0.001);

const helper = new THREE.CameraHelper( directionalLight.shadow.camera );
scene.add( helper );

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; // enable for shadows ;)
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 *
 * Note here that anaverse doesn't support room animation.
 *
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // // animate the sphere
  // sphere.position.x = Math.cos(elapsedTime);
  // sphere.position.z = 1 + Math.sin(elapsedTime);
  // sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

/**
 * Additional Functions
*/

/**
 * Name: getCenterPoint();
 * Description: Get the center point from any mesh geometry using the boundingBox
*/
function getCenterPoint(mesh) {
  var geometry = mesh.geometry;
  geometry.computeBoundingBox();
  var center = new THREE.Vector3();
  geometry.boundingBox.getCenter( center );
  mesh.localToWorld( center );
  return center;
}