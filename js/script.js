import * as THREE from 'three';

import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

window.addEventListener('DOMContentLoaded', () => {

  console.log('SCRIPT RUNNING');

  const container = document.getElementById('threeContainer');

  // scene

  const scene = new THREE.Scene();
  window.scene = scene;

  const textureLoader = new THREE.TextureLoader();

  textureLoader.load('assets/space.jpg', (texture) => {
    scene.background = texture;
  });


  // camera

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    2000
  );

  camera.position.set(0, 1, 5);

  window.camera = camera;

 
  // audio
  
  const listener = new THREE.AudioListener();
  camera.add(listener);

  window.listener = listener;

 
  //renderer

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.setSize(
    container.clientWidth,
    container.clientHeight
  );

  container.appendChild(renderer.domElement);


  // controls

  const controls = new OrbitControls(
    camera,
    renderer.domElement
  );

  controls.enableDamping = true;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 1;

  window.controls = controls;


  // lights

  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.2
  );

  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    2
  );

  directionalLight.position.set(5, 10, 7);

  scene.add(directionalLight);

  
  //loader

  const loader = new GLTFLoader();

  
  // planet variables

  let sun;
  let mercury;
  let venus;
  let earth;
  let mars;
  let jupiter;
  let saturn;
  let uranus;
  let neptune;

  // planet data

  const planetData = [];
  const orbitGroups = [];

  let planetMotionEnabled = true;


  //black hole variables

  let blackHolePlane;
  let blackHoleMaterial;
  let blackHoleModel;

let wireframeEnabled = false;

  // rocket model

  loader.load(

    'models/rocket.glb',

    (gltf) => {

      const rocket = gltf.scene;

      rocket.position.set(0, 0, 0);

      rocket.scale.set(1, 1, 1);

      window.rocketModel = rocket;

      // rocket sound
      const sound = new THREE.PositionalAudio(listener);

      const audioLoader = new THREE.AudioLoader();

      audioLoader.load(
        'assets/rocket.mp3',

        (buffer) => {

          sound.setBuffer(buffer);
          sound.setLoop(true);
          sound.setVolume(0.5);

        }
      );

      rocket.add(sound);

      window.sound = sound;

      console.log('Rocket loaded');

    },

    (xhr) => {

      console.log(
        (xhr.loaded / xhr.total * 100).toFixed(0)
        + '% rocket loaded'
      );

    },

    (error) => {

      console.error(
        'Rocket loading error:',
        error
      );

    }

  );


// black hole

loader.load(

  'models/New_blackHole.glb',

  (gltf) => {

    blackHoleModel = gltf.scene;

    blackHoleModel.scale.set(
      2,
      2,
      2
    );

    blackHoleModel.visible = false;

    scene.add(blackHoleModel);

    console.log(
      'Black hole model loaded'
    );

  },

  undefined,

  (error) => {

    console.error(
      'Black hole model error:',
      error
    );

  }

);

  // solar system model

  loader.load(

    'models/solar_system.glb',

    (gltf) => {

      const solarSystem = gltf.scene;

      solarSystem.position.set(0, 0, 0);

      solarSystem.scale.set(2, 2, 2);

      window.solarSystemModel = solarSystem;

      console.log('Solar system loaded');

      // print object names
      solarSystem.traverse((child) => {
        console.log(child.name);
      });

      // get planets
   
      sun      = solarSystem.getObjectByName('sun');
      mercury  = solarSystem.getObjectByName('mercury');
      venus    = solarSystem.getObjectByName('venus');
      earth    = solarSystem.getObjectByName('earth');
      mars     = solarSystem.getObjectByName('mars');
      jupiter  = solarSystem.getObjectByName('jupiter');
      saturn   = solarSystem.getObjectByName('saturn');
      uranus   = solarSystem.getObjectByName('uranus');
      neptune  = solarSystem.getObjectByName('neptune');

  
      // setup planet function
      
      function setupPlanet(
        planet,
        orbitSpeed,
        rotationSpeed
      ) {

        if (!planet) return;

        const originalX = planet.position.x;
        const originalZ = planet.position.z;

        const orbitGroup = new THREE.Group();

        scene.add(orbitGroup);

        orbitGroup.visible = false;

        orbitGroup.add(planet);

        orbitGroups.push(orbitGroup);

        planet.position.set(
          originalX,
          0,
          originalZ
        );

        planetData.push({

          mesh: planet,
          orbitGroup: orbitGroup,
          orbitSpeed: orbitSpeed,
          rotationSpeed: rotationSpeed

        });

      }

//planet speed
      setupPlanet(mercury, 0.03, 0.06);
      setupPlanet(venus,   0.025, 0.05);
      setupPlanet(earth,   0.02, 0.04);
      setupPlanet(mars,    0.015, 0.035);
      setupPlanet(jupiter, 0.01, 0.03);
      setupPlanet(saturn,  0.007, 0.025);
      setupPlanet(uranus,  0.004, 0.02);
      setupPlanet(neptune, 0.002, 0.015);

    },

    (xhr) => {

      console.log(
        (xhr.loaded / xhr.total * 100).toFixed(0)
        + '% solar system loaded'
      );

    },

    (error) => {

      console.error(
        'Solar system loading error:',
        error
      );

    }

  );


  // black hole shader


  const galaxyTexture = textureLoader.load(
    'assets/blackHole.png'
  );

  blackHoleMaterial = new THREE.ShaderMaterial({

    uniforms: {

      uTexture: {
        value: galaxyTexture
      },

      uCenter: {
        value: new THREE.Vector2(0.5, 0.5)
      },

      uTime: {
        value: 0
      }

    },

    vertexShader: `

      varying vec2 vUv;

      void main() {

        vUv = uv;

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(position, 1.0);

      }

    `,

    fragmentShader: `

      uniform sampler2D uTexture;
      uniform vec2 uCenter;
      uniform float uTime;

      varying vec2 vUv;

      void main() {

        vec2 uv = vUv;

        vec2 dir = uv - uCenter;

        float dist = length(dir);

        float pull =
          0.4 / (dist + 0.15);

        float angle =
          pull * 3.0 +
          uTime * 0.5;

        float s = sin(angle);
        float c = cos(angle);

        mat2 rot = mat2(
          c, -s,
          s,  c
        );

        dir = rot * dir;

        uv =
          uCenter +
          dir * (1.0 - pull);

        vec4 color =
          texture2D(uTexture, uv);

        float fade =
          smoothstep(
            0.0,
            0.25,
            dist
          );

        color.rgb *= fade;

        gl_FragColor = color;

      }

    `,

    side: THREE.DoubleSide

  });

  blackHolePlane = new THREE.Mesh(

    new THREE.PlaneGeometry(15, 15),

    blackHoleMaterial

  );

  blackHolePlane.visible = false;

  scene.add(blackHolePlane);

  // mouse interaction
  window.addEventListener('mousemove', (e) => {

    const x =
      e.clientX / window.innerWidth;

    const y =
      1.0 - (
        e.clientY / window.innerHeight
      );

    blackHoleMaterial.uniforms
      .uCenter.value
      .set(x, y);

  });


  // switch models


  window.showRocket = function () {

    //hide black hole
    blackHolePlane.visible = false;

    //remove solar system
    if (window.solarSystemModel) {
      scene.remove(window.solarSystemModel);
    }

    //hide planet orbit
    orbitGroups.forEach((group) => {
      group.visible = false;
    });

    // show rocket
    if (window.rocketModel) {
      scene.add(window.rocketModel);
    }

    camera.position.set(0, 1, 5);

  };

  window.showSolarSystem = function () {

    // hide black hole
    blackHolePlane.visible = false;

    // remove rocket
    if (window.rocketModel) {
      scene.remove(window.rocketModel);
    }

    //show solar system
    if (window.solarSystemModel) {
      scene.add(window.solarSystemModel);
    }

    // show orbits
    orbitGroups.forEach((group) => {
      group.visible = true;
    });

    camera.position.set(0, 5, 20);

  };

  window.showBlackHole = function () {

    // remove rocket
    if (window.rocketModel) {
      scene.remove(window.rocketModel);
    }

    // remove solar system
    if (window.solarSystemModel) {
      scene.remove(window.solarSystemModel);
    }

    // HIDE ORBITS
    orbitGroups.forEach((group) => {
      group.visible = false;
    });

    // show black hole
    blackHolePlane.visible =
  !wireframeEnabled;

if (blackHoleModel) {

  blackHoleModel.visible =
    wireframeEnabled;

}

    camera.position.set(0, 0, 5);

  };


// toggle planet motion

window.togglePlanetMotion = function () {

  planetMotionEnabled =
    !planetMotionEnabled;

  console.log(
    'Planet Motion:',
    planetMotionEnabled
  );

};

// toggle wireframe

window.toggleWireframe = function () {

  wireframeEnabled = !wireframeEnabled;


  scene.traverse((child) => {

    if (child.isMesh && child.material) {

      // MULTIPLE MATERIALS
      if (Array.isArray(child.material)) {

        child.material.forEach((material) => {

          material.wireframe =
            wireframeEnabled;

        });

      } else {

        child.material.wireframe =
          wireframeEnabled;

      }

    }

  });



 
  if (blackHolePlane.visible || blackHoleModel.visible) {

    // normal mode
    if (!wireframeEnabled) {

      blackHolePlane.visible = true;

      if (blackHoleModel) {
        blackHoleModel.visible = false;
      }

    }

    // wireframe mode
    else {

      blackHolePlane.visible = false;

      if (blackHoleModel) {
        blackHoleModel.visible = true;
      }

    }

  }

  console.log(
    'Wireframe:',
    wireframeEnabled
  );

};

  // resize

  window.addEventListener('resize', () => {

    const width =
      container.clientWidth;

    const height =
      container.clientHeight;

    camera.aspect =
      width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

  });


  // animation
 

  function animate() {

    requestAnimationFrame(animate);

    controls.update();

    // sun spin
    if (sun) {

      sun.rotation.y += 0.003;

    }

   // planets
planetData.forEach((planet) => {

  if (planetMotionEnabled) {

    // orbit around the sun
    planet.orbitGroup.rotation.y +=
      planet.orbitSpeed;

    // spin on itself
    planet.mesh.rotation.y +=
      planet.rotationSpeed;

  }

});

    // black hole animation
    if (blackHoleMaterial) {

      blackHoleMaterial.uniforms
        .uTime.value += 0.016;

    }

    renderer.render(scene, camera);

  }

  animate();

});