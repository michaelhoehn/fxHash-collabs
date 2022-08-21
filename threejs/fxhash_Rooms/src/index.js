import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { genererFigures } from "./figures";

/** To Do 
 * Camera: 
 *  > Convert to Ortho camera
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
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("white");

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// TODO <---- Randomise the colour of the gradient texture
const gradientTexture = textureLoader.load('textures/gradients/5.jpg');
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;
console.log(gradientTexture);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.0);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.25);
directionalLight.position.set(-1.6,3,-0.4);
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
// Toon Material Tests
const material = new THREE.MeshToonMaterial();
material.gradientMap = gradientTexture;
material.side = THREE.DoubleSide;
material.dithering = true;

// Standard Tests
// const material = new THREE.MeshStandardMaterial( {
//   color: "white"
// });

/**
 * Helpers
 *
 * Description: Axes and grid helpers
 * TODO: Remove before publishing
 */

// Axes Helper
const axes = new THREE.AxesHelper(5);
//scene.add(axes);

// Grid Helper
const gridSize = 10;
const gridDivisions = 10;
const gridHelper = new THREE.GridHelper(
  gridSize,
  gridDivisions,
  "black",
  "pink"
);
//scene.add(gridHelper);

/**
 * Objects
 */

var gen = genererFigures(fxhash);

var figures = gen.figures;

//console.log(figures);

/// manufacture

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

  roomMeshOutlines = new THREE.LineSegments(new THREE.EdgesGeometry(roomMesh.geometry), new THREE.LineBasicMaterial({color:"black"}));
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
// manufacture end

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 * Remove the camera that will not be used in the preview
*/
// Orthographic Camera
const frustumSize = 80;
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
//orthoCam.zoom = -100;
orthoCam.position.x = 12.5; 
orthoCam.position.y = 25;
orthoCam.position.z = -12.5;

// Perspective Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);

// Perspective Camera Parameters
// camera.position.x = -5;
// camera.position.y = 3.2;
// camera.position.z = 5.5;

// Camera Target
// camera.lookAt(getCenterPoint(roomMesh));

scene.add(orthoCam);
//scene.add(camera);

// gui camera controls
gui.add(orthoCam.position, "x").min(-50).max(50).step(0.001);
gui.add(orthoCam.position, "y").min(-50).max(50).step(0.001);
gui.add(orthoCam.position, "z").min(-50).max(50).step(0.001);

const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
//scene.add(helper);

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.left = - frustumSize * aspect / 2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = - frustumSize / 2;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

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
