// largely borrowed from a physijs example
// plenty of refactoring done and some changes as well
'use strict';

// External Dependencies
var Physijs = require('physijs-webpack');
var THREE = require('three');
var TrackballControls = require('three-trackballcontrols');
var WindowResize = require('three-window-resize');

// Internal Dependencies
var createCar = require('./createCar.litcoffee').createCar

// declare objects
var controls, renderer, scene, camera, car = {};

// initialize the scene
var initScene = function() {
  // create the renderer
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  var viewportElem = document.getElementById('viewport')
  console.log(viewportElem.clientWidth)
  console.log(viewportElem.clientHeight)
  renderer.setSize(viewportElem.clientWidth, viewportElem.clientHeight)
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  viewportElem.appendChild(renderer.domElement)


  // create the scene and add gravity
  // also add the listener to drop the car down upon update
  scene = new Physijs.Scene;
  scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
  scene.addEventListener(
    'update',
    function() {
      scene.simulate( undefined, 2 );
    }
  );

  // create the camera
  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set( 60, 50, 60 );
  camera.lookAt( scene.position );
  scene.add( camera );

  // add trackball controls
  controls = new TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 1.2;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  controls.addEventListener( 'change', render );

  // create the lighting
  var light = new THREE.DirectionalLight( 0xFFFFFF );
  light.position.set( 20, 40, -15 );
  light.target.position.copy( scene.position );
  light.castShadow = true;
  light.shadowCameraLeft = -60;
  light.shadowCameraTop = -60;
  light.shadowCameraRight = 60;
  light.shadowCameraBottom = 60;
  light.shadowCameraNear = 20;
  light.shadowCameraFar = 200;
  light.shadowBias = -.0001
  light.shadowMapWidth = light.shadowMapHeight = 2048;
  light.shadowDarkness = .7;
  scene.add( light );

  // add window resizer
  WindowResize(renderer, camera, function () {
    return {width: viewportElem.clientWidth, height: viewportElem.clientHeight}
  });

  scene.simulate();
  animate();
}

var render = function() {
  renderer.render( scene, camera );
}

var animate = function() {
  requestAnimationFrame( animate );
  controls.update();
  render();
}

function createCarWrapper (startX, startY, startZ) {
  createCar(scene, car, startX, startY, startZ)
  // set camera position to point toward car
  controls.target.set(startX, startY, startZ)
  camera.position.set(startX + 60, startY + 50, startZ + 60)
}

// set the scene to initiliaze as soon as the window is loaded
window.onload = function() {
  initScene();
}

module.exports = {
  getScene: function () { return scene },
  getCar: function () { return car },
  createCar: createCarWrapper
}
