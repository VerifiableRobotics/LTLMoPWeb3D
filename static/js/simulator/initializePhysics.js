// largely borrowed from a physijs example
// plenty of refactoring done and some changes as well
'use strict';

// set worker and ammo
Physijs.scripts.worker = 'static/plugins/physijs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

// declare objects
var initScene, render, animate,
  ground_material, car_material, wheel_material, wheel_geometry, controls,
  projector, renderer, scene, ground_geometry, ground, light, camera,
  car = {};

// initialize the scene
initScene = function() {
  projector = new THREE.Projector;
  
  // create the renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  var $viewport = $('#viewport')
  var rendWidth = $viewport.width();
  var rendHeight = $viewport.height();
  console.log(rendHeight);
  renderer.setSize(rendWidth, rendHeight);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  $viewport.append(renderer.domElement);
  
  
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
    1000
  );
  camera.position.set( 60, 50, 60 );
  camera.lookAt( scene.position );
  scene.add( camera );

  // add trackball controls
  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  //controls.keys = [ 65, 83, 68 ];
  controls.addEventListener( 'change', render );
  
  // create the lighting
  light = new THREE.DirectionalLight( 0xFFFFFF );
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
  
  // create the ground material
  ground_material = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({color: 0x00ff00}),  // just some green
    .5, // high friction
    0 // no restitution
  );
  // create the ground
  ground = new Physijs.BoxMesh(
    new THREE.CubeGeometry(100, 1, 100),
    ground_material,
    0 // mass
  );
  ground.receiveShadow = true;
  // use ground.position.set to set 3D location of obj before adding to scene
  scene.add( ground );
  
  
  // create the car
  car_material = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({ color: 0xff6666 }),
    .5, // high friction
    0 // no restitution
  );
  car.body = new Physijs.BoxMesh(
    new THREE.CubeGeometry( 10, 5, 7 ),
    car_material,
    1000
  );
  car.body.position.y = 10;
  car.body.receiveShadow = car.body.castShadow = true;
  scene.add( car.body );
  
  
  // create the 4 wheels
  wheel_material = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({ color: 0x444444 }),
    .5, // high friction
    0 // no restitution
  );
  wheel_geometry = new THREE.CylinderGeometry( 2, 2, 1, 8 );
  car.wheel_fl = new Physijs.CylinderMesh(
    wheel_geometry,
    wheel_material,
    500
  );
  car.wheel_fr = new Physijs.CylinderMesh(
    wheel_geometry,
    wheel_material,
    500
  );
  car.wheel_bl = new Physijs.CylinderMesh(
    wheel_geometry,
    wheel_material,
    500
  );
  car.wheel_br = new Physijs.CylinderMesh(
    wheel_geometry,
    wheel_material,
    500
  );
    
  // hold var for less repeated computations
  var pidiv2 = Math.PI / 2;
  // set contraints and rotations for the wheels
  // front left wheel
  car.wheel_fl.rotation.x = pidiv2;
  car.wheel_fl.position.set( -3.5, 6.5, 5 );
  car.wheel_fl.receiveShadow = car.wheel_fl.castShadow = true;
  scene.add( car.wheel_fl );
  car.wheel_fl_constraint = new Physijs.DOFConstraint(
    car.wheel_fl, car.body, new THREE.Vector3( -3.5, 6.5, 5 )
  );
  scene.addConstraint( car.wheel_fl_constraint );
  car.wheel_fl_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
  car.wheel_fl_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });
  // front right wheel
  car.wheel_fr.rotation.x = pidiv2;
  car.wheel_fr.position.set( -3.5, 6.5, -5 );
  car.wheel_fr.receiveShadow = car.wheel_fr.castShadow = true;
  scene.add( car.wheel_fr );
  car.wheel_fr_constraint = new Physijs.DOFConstraint(
    car.wheel_fr, car.body, new THREE.Vector3( -3.5, 6.5, -5 )
  );
  scene.addConstraint( car.wheel_fr_constraint );
  car.wheel_fr_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
  car.wheel_fr_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });
  // back left wheel
  car.wheel_bl.rotation.x = pidiv2;
  car.wheel_bl.position.set( 3.5, 6.5, 5 );
  car.wheel_bl.receiveShadow = car.wheel_bl.castShadow = true;
  scene.add( car.wheel_bl );
  car.wheel_bl_constraint = new Physijs.DOFConstraint(
    car.wheel_bl, car.body, new THREE.Vector3( 3.5, 6.5, 5 )
  );
  scene.addConstraint( car.wheel_bl_constraint );
  car.wheel_bl_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
  car.wheel_bl_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });
  // back right wheel
  car.wheel_br.rotation.x = pidiv2;
  car.wheel_br.position.set( 3.5, 6.5, -5 );
  car.wheel_br.receiveShadow = car.wheel_br.castShadow = true;
  scene.add( car.wheel_br );
  car.wheel_br_constraint = new Physijs.DOFConstraint(
    car.wheel_br, car.body, new THREE.Vector3( 3.5, 6.5, -5 )
  );
  scene.addConstraint( car.wheel_br_constraint );
  car.wheel_br_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
  car.wheel_br_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });    
  
  scene.simulate();
};
// end initScene

render = function() {
  renderer.render( scene, camera );
};

animate = function() {
  requestAnimationFrame( animate );
  controls.update();
  render();
};

// set the scene to initiliaze as soon as the window is loaded
window.onload = function() {
  initScene();
  animate();
}


// set some basic event handlers
$(document).ready(function() {
  // resize warning
  $(window).resize(function() {
    alert("The renderer has a fixed width, please refresh for simulator to have proper width and height");
  });
}); // end document ready