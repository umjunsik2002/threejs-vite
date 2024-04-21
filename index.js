import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 90;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x404040);

  {
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(- 1, 2, 4);
    scene.add(light);
  }

  const textureLoader = new THREE.TextureLoader();
  const glassWindowTextures = {
    map: textureLoader.load('./textures/glass_window/Glass_Window_004_basecolor.jpg'),
    aoMap: textureLoader.load('./textures/glass_window/Glass_Window_004_ambientOcclusion.jpg'),
    normalMap: textureLoader.load('./textures/glass_window/Glass_Window_004_normal.jpg'),
    displacementMap: textureLoader.load('./textures/glass_window/Glass_Window_004_height.jpg'),
    metalnessMap: textureLoader.load('./textures/glass_window/Glass_Window_004_metallic.jpg'),
    roughnessMap: textureLoader.load('./textures/glass_window/Glass_Window_004_roughness.jpg'),
    transparent: true,
    alphaMap: textureLoader.load('./textures/glass_window/Glass_Window_004_opacity.jpg'),
  };
  const scuffedGoldTextures = {
    map: textureLoader.load('./textures/scuffed_gold/gold-scuffed_basecolor-boosted.png'),
    normalMap: textureLoader.load('./textures/scuffed_gold/gold-scuffed_normal.png'),
    metalnessMap: textureLoader.load('./textures/scuffed_gold/gold-scuffed_metallic.png'),
    roughnessMap: textureLoader.load('./textures/scuffed_gold/gold-scuffed_roughness.png'),
  };

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const radius = 0.5;
  const widthSegments = 32;
  const heightSegments = 32;
  const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

  function makeInstance(geometry, textures, x) {
    const material = new THREE.MeshStandardMaterial(textures);
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);
    shape.position.x = x;
    return shape;
  }

  const shapes = [
    makeInstance(boxGeometry, scuffedGoldTextures, -2),
    makeInstance(sphereGeometry, glassWindowTextures, 0),
  ];

  const objLoader = new OBJLoader();
  const mtlLoader = new MTLLoader();
  mtlLoader.load(
    './models/bugatti/bugatti.mtl',
    function (materials) {
      materials.preload();
      objLoader.setMaterials(materials);

      objLoader.load(
        './models/bugatti/bugatti.obj',
        function (object) {
          object.scale.set(0.15, 0.15, 0.15);
          scene.add(object);
          object.position.set(2, 0, 0);
          shapes.push(object);
        },
        function (xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        function (error) {
          console.error('Failed to load OBJ model:', error);
        }
      );
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    function (error) {
      console.error('Failed to load MTL file:', error);
    }
  );

  function render(time) {
    time *= 0.001;
    shapes.forEach((cube, ndx) => {
      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
