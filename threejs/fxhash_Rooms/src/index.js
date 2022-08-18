import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { genererFigures } from "./figures";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("white");

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
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.near = -20;
directionalLight.shadow.camera.far = 20;
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
const axes = new THREE.AxesHelper(5);
scene.add(axes);

// Grid Helper
const gridSize = 10;
const gridDivisions = 10;
const gridHelper = new THREE.GridHelper(
  gridSize,
  gridDivisions,
  "black",
  "pink"
);
scene.add(gridHelper);

/**
 * Objects
*/

// Anaglypic: this can be removed. only a placeholder until can be added to the figures.js
//
// // The ground plane 
// const ground = new THREE.PlaneGeometry(50, 50);
// const groundMesh = new THREE.Mesh(ground, material);
// groundMesh.position.y = -5;
// groundMesh.rotation.x = -Math.PI / 2;
// scene.add(groundMesh);

const roomMaterial = new THREE.MeshBasicMaterial({
  color: "gray",
  wireframe: false,
});

var gen = genererFigures(fxhash);

var figures = gen.figures;

//console.log(figures);

/// manufacture

for (let i = 0; i < figures.length; i++) {
  var roomMesh;
  var roomGeomery;

  // check if it's an extrude geometry and hence needs special treatment
  if (figures[i].geometry.hasOwnProperty("extrudeSettings")) {
    var roomShape = new THREE.Shape();

    figures[i].geometry.shapeArgs.forEach((d) =>
      roomShape[d.draw](...d.drawArgs)
    );

    roomGeomery = new THREE.ExtrudeGeometry(
      roomShape,
      figures[0].extrudeSettings
    );
  } else {
    //else, if not the case
    roomGeomery = new THREE[figures[i].geometry.type](
      ...figures[i].geometry.args
    );
  }

  roomMesh = new THREE.Mesh(roomGeomery, material);
  roomMesh.castShadow = true;
  roomMesh.receiveShadow = true;

  roomMesh.position.set(figures[i].pos.x, figures[i].pos.y, figures[i].pos.z);
  roomMesh.rotation.set(figures[i].rot.x, figures[i].rot.y, figures[i].rot.z);
  roomMesh.scale.set(
    figures[i].scale.x,
    figures[i].scale.y,
    figures[i].scale.z
  );

  scene.add(roomMesh);
}
// manufacture end

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
 * TODO: Change to Orthographic Camera
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

const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
//scene.add(helper);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
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
  geometry.boundingBox.getCenter(center);
  mesh.localToWorld(center);
  return center;
}
