import * as THREE from "three";
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import {
  genererFigures
} from "./figures";
import { color, forceX, select } from "d3";

/** To Do 
 * Scene: 
 *  > Background colors and probabilities
 *  > High contrast shadows in preview
 *  > Room counts and placements along with probabilities
 * Materials: 
 *  > Corresponding materials and probabilities
 * Testing:
 *  > Regularly test within Anaverse
*/

/**
 * Sizes
 */
 const sizes = {
  width: 2000,
  height: 2000,
};

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("black");

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// TODO <---- Randomise the colour of the gradient texture
const gradientTexture = textureLoader.load('textures/gradients/5.jpg');
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;
//console.log(gradientTexture);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.594);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.9);
directionalLight.position.set(
  -2.8,
  3.2,
  -2.85
);
gui.add(directionalLight, "intensity").min(0).max(5).step(0.001);
gui.add(directionalLight.position, "x").min(-50).max(50).step(0.001);
gui.add(directionalLight.position, "y").min(-50).max(50).step(0.001);
gui.add(directionalLight.position, "z").min(-50).max(50).step(0.001);
scene.add(directionalLight);
directionalLight.castShadow = true;
directionalLight.shadow.bias = 0;

directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.top = 200;
directionalLight.shadow.camera.bottom = -200;
directionalLight.shadow.camera.right = 200;
directionalLight.shadow.camera.left = -200;
directionalLight.shadow.camera.near = -200;
directionalLight.shadow.camera.far = 200;
// directionalLight.shadow.radius = 10

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);

/**
 * Materials
 */

/**
 * Colour palettes consist of 4 colors that can be picked at random
 * 0 - ground plane
 * 1 - grid lines
 * 2 - geometry 
 * 3 - geometry outlines 
 */

const palette0 = ["Master Steel", "#32363e", "#b2a268", "#e1cf93", "#acb1bd"];
const palette1 = ["Kambucha Black", "#0c0a0d", "#28211f", "#d9a665", "#e1c9b7"];
const palette2 = ["Peppy Aztec", "#161b1e", "#1c2a2a", "#60d2b7", "#a7d8d6"];
const palette3 = ["Cherry Viola", "#32292f", "#b28ca6", "#f4cce4", "#e6dbd9"];
const palette4 = ["Moon Periwinkle", "#333542", "#959ab8", "#ced3f2", "#d2d4e2"];
const palette5 = ["Rosy Rose", "#412e2f", "#b28b8e", "#e6b8bb", "#d0a8aa"];
const palette6 = ["Melanzane Sister", "#322931", "#b288af", "#edc9f2", "#cedde7"];
const palette7 = ["Kitten's Norway", "#352b27", "#ad7475", "#d9a89c", "#a4ba93"];
const palette8 = ["Secret Moonwalk", "#373334", "#b29f9f", "#e5d2d2", "#c2bec2"];
const palette9 = ["Silver Pines", "#292c16", "#8a9e38", "#cddf75", "#e1e0c2"];
const palette10 = ["Wild Casper", "#363535", "#9eaeb4", "#dae1e2", "#d9beb1"];
const palette11 = ["Garden Crow", "#2f2d29", "#777043", "#ada474", "#c7c4bf"];
const palette12 = ["Gallant Norway", "#303724", "#93ab66", "#c1dd8c", "#aec18f"];
const palette13 = ["Lava Lucerne", "#3e4559", "#719fb3", "#9cccdd", "#b7c0d2"];
const palette14 = ["Light Diesel", "#38302d", "#b5a285", "#f2d9bf", "#ddc7d1"];
const palette15 = ["Wolfram Kong", "#e8ecf4", "#adb1b8", "#59595a", "#191714"];
let selectedPalette = [];

// Color selection function
const colorPicker = fxrand();

if(colorPicker >= 0.9375){
  selectedPalette = palette0; 
} else if(colorPicker >= 0.875 && colorPicker < 0.9375) {
  selectedPalette = palette1;
} else if(colorPicker >= 0.8125 && colorPicker < 0.875) {
  selectedPalette = palette2;
} else if(colorPicker >= 0.75 && colorPicker < 0.8125) {
  selectedPalette = palette3;
} else if(colorPicker >= 0.6875 && colorPicker < 0.75) {
  selectedPalette = palette4;
} else if(colorPicker >= 0.625 && colorPicker < 0.6875) {
  selectedPalette = palette5;
} else if(colorPicker >= 0.5625 && colorPicker < 0.625) {
  selectedPalette = palette6;
} else if(colorPicker >= 0.50 && colorPicker < 0.5625) {
  selectedPalette = palette7;
} else if(colorPicker >= 0.4375 && colorPicker < 0.50) {
  selectedPalette = palette8;
} else if(colorPicker >= 0.375 && colorPicker < 0.4375) {
  selectedPalette = palette9;
} else if(colorPicker >= 0.3125 && colorPicker < 0.375) {
  selectedPalette = palette10;
} else if(colorPicker >= 0.25 && colorPicker < 0.3125) {
  selectedPalette = palette11;
} else if(colorPicker >= 0.1875 && colorPicker < 0.25) {
  selectedPalette = palette12;
} else if(colorPicker >= 0.125 && colorPicker < 0.1875) {
  selectedPalette = palette13;
} else if(colorPicker >= 0.0625 && colorPicker < 0.125) {
  selectedPalette = palette14;
} else {
  selectedPalette = palette15;
}

console.log("Color palette = " + selectedPalette[0]);

// Material Color Assignments
let randomGeoColor = Math.floor(fxrand() * 4) + 1;
let randomPlaneColor = Math.floor(fxrand() * 4) + 1;
let randomLineColor = Math.floor(fxrand() * 4) + 1;
let randomGridColor = Math.floor(fxrand() * 4) + 1;

console.log("random color is! " + randomGeoColor);

const material = new THREE.MeshStandardMaterial({
  color: selectedPalette[randomGeoColor]
});

const planeMaterial = new THREE.MeshStandardMaterial({
  color: selectedPalette[randomPlaneColor]
});

const lineOpacity = fxrand();
let opacity = 0.5;

if(lineOpacity >= 0.75){
  opacity = 1;
} else if(lineOpacity >= 0.5 && lineOpacity < 0.75){
  opacity = 0.5;
} else {
  opacity = 0.25;
}
const lineColor = new THREE.LineBasicMaterial({
  color: selectedPalette[randomLineColor],
  transparent: true,
  opacity: opacity
});

// Grid Helper
const gridSizeOptions = [20, 50, 100, 250, 500, 1000];
let gridOption;
const gridProbability = fxrand();
if(gridProbability >= 0.8334){
  gridOption = gridSizeOptions[0];
} else if(gridProbability >= 0.6668 && gridProbability < 0.8334){
  gridOption = gridSizeOptions[1];
} else if(gridProbability >= 0.5002 && gridProbability < 0.6668){
  gridOption = gridSizeOptions[2];
} else if(gridProbability >= 0.3336 && gridProbability < 0.5002){
  gridOption = gridSizeOptions[3];
} else if(gridProbability >= 0.1666 && gridProbability < 0.3336){
  gridOption = gridSizeOptions[4];
} else {
  gridOption = gridSizeOptions[5];
}

const gridSize = 1000;
const gridDivisions = gridOption;
const gridHelper = new THREE.GridHelper(
  gridSize,
  gridDivisions,
  selectedPalette[randomGridColor],
  selectedPalette[randomGridColor]
);
gridHelper.position.y = -1.8;
scene.add(gridHelper);

/**
 * Objects
 */

var gen = genererFigures(fxhash);

var figures = gen.figures;

for (let i = 0; i < figures.length; i++) {
  var roomMesh;
  var roomGeometry;
  var roomMeshOutlines;

  // check if it's an extrude geometry and hence needs special treatment
  if (figures[i].geometry.hasOwnProperty("extrudeSettings")) {
    var roomShape = new THREE.Shape();

    figures[i].geometry.shapeArgs.forEach((d) =>
      roomShape[d.draw](...d.drawArgs)
    );

    roomGeometry = new THREE.ExtrudeGeometry(
      roomShape,
      figures[0].extrudeSettings
    );
  } else {
    roomGeometry = new THREE[figures[i].geometry.type](
      ...figures[i].geometry.args
    );
  }

  roomMesh = new THREE.Mesh(roomGeometry, material);
  roomMesh.castShadow = true;
  roomMesh.receiveShadow = true;

  // translation of the mesh
  roomMesh.position.set(figures[i].pos.x, figures[i].pos.y, figures[i].pos.z);
  roomMesh.rotation.set(figures[i].rot.x, figures[i].rot.y, figures[i].rot.z);
  if (figures[i].hasOwnProperty("scale")) {
    roomMesh.scale.set(
      figures[i].scale.x,
      figures[i].scale.y,
      figures[i].scale.z
    );
  }

  roomMeshOutlines = new THREE.LineSegments(
    new THREE.EdgesGeometry(roomMesh.geometry),
    lineColor
  );

  roomMeshOutlines.position.set(figures[i].pos.x, figures[i].pos.y, figures[i].pos.z);
  roomMeshOutlines.rotation.set(figures[i].rot.x, figures[i].rot.y, figures[i].rot.z);
  if (figures[i].hasOwnProperty("scale")) {
    roomMeshOutlines.scale.set(
      figures[i].scale.x,
      figures[i].scale.y,
      figures[i].scale.z
    );
  }

  scene.add(roomMeshOutlines);
  scene.add(roomMesh);
}

// Ground plane
const groundPlane = new THREE.PlaneGeometry(1000, 1000);
const groundPlaneMesh = new THREE.Mesh(groundPlane, planeMaterial);
groundPlaneMesh.rotation.x = -Math.PI * 0.5;
groundPlaneMesh.position.y = -1.9;
groundPlaneMesh.receiveShadow = true;
scene.add(groundPlaneMesh);

/**
 * Camera
 * Remove the camera that will not be used in the preview
 */

// Orthographic Camera
const frustumSize = 100;
const aspect = sizes.width / sizes.height;
const orthoCam = new THREE.OrthographicCamera(
  frustumSize * aspect / -2,
  frustumSize * aspect / 2,
  frustumSize / 2,
  frustumSize / -2,
  -100,
  2000
);

// OrthoCam Position
orthoCam.position.x = 12;
orthoCam.position.y = 35;
orthoCam.position.z = -12;

// Camera target
const camTarget = new THREE.Vector3(
  0,
  20,
  0
);

scene.add(orthoCam);

// gui camera position controls
const folder0 = gui.addFolder("Camera Controls")

folder0.add(orthoCam.position, "x").min(-50).max(50).step(0.001).name("posX");
folder0.add(orthoCam.position, "y").min(-50).max(50).step(0.001).name("posY");
folder0.add(orthoCam.position, "z").min(-50).max(50).step(0.001).name("posZ");
folder0.add(camTarget, 'x').min(-50).max(50).step(0.001).name('targetX')
folder0.add(camTarget, 'y').min(-50).max(50).step(0.001).name('targetY')
folder0.add(camTarget, 'z').min(-50).max(50).step(0.001).name('targetZ')

const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
//scene.add(helper);

window.addEventListener("resize", () => {
  // Update camera
  orthoCam.left = -frustumSize * aspect / 2;
  orthoCam.right = frustumSize * aspect / 2;
  orthoCam.top = frustumSize / 2;
  orthoCam.bottom = -frustumSize / 2;
  orthoCam.aspect = sizes.width / sizes.height;
  orthoCam.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Controls
const controls = new OrbitControls(orthoCam, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
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

  // Update camera
  orthoCam.lookAt(camTarget);

  // Render
  renderer.render(scene, orthoCam);

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