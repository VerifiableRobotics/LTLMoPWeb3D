	// largely borrowed from a physijs example
	// plenty of refactoring done and some changes as well


	'use strict';
	
	// set worker and ammo
    Physijs.scripts.worker = 'static/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';
	
	// declare objects
	var initScene, render,
		ground_material, car_material, wheel_material, wheel_geometry,
		projector, renderer, render_stats, physics_stats, scene, ground_geometry, ground, light, camera,
		car = {};
	
	// initialize the scene
	initScene = function() {
		projector = new THREE.Projector;
		
      	// create the renderer
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;
		document.getElementById( 'viewport' ).appendChild( renderer.domElement );
		
      	// create the fps statistics
		render_stats = new Stats();
		render_stats.domElement.style.position = 'absolute';
		render_stats.domElement.style.top = '0px';
		render_stats.domElement.style.zIndex = 100;
		document.getElementById( 'viewport' ).appendChild( render_stats.domElement );
		physics_stats = new Stats();
		physics_stats.domElement.style.position = 'absolute';
		physics_stats.domElement.style.top = '50px';
		physics_stats.domElement.style.zIndex = 100;
		document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );
		
      	// create the scene and add gravity
      	// also add the listener to drop the car down upon update
		scene = new Physijs.Scene;
		scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
		scene.addEventListener(
			'update',
			function() {
				scene.simulate( undefined, 2 );
				physics_stats.update();
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
			.8, // high friction
			.4 // low restitution
		);
		
		// create the ground
		ground = new Physijs.BoxMesh(
			new THREE.CubeGeometry(100, 1, 100),
			ground_material,
			0 // mass
		);
		ground.receiveShadow = true;
		scene.add( ground );
		
		
		// create the car
		car_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ color: 0xff6666 }),
			.8, // high friction
			.2 // low restitution
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
			.8, // high friction
			.5 // medium restitution
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
      
      	// set contraints and rotations for the wheels
		car.wheel_fl.rotation.x = Math.PI / 2;
		car.wheel_fl.position.set( -3.5, 6.5, 5 );
		car.wheel_fl.receiveShadow = car.wheel_fl.castShadow = true;
		scene.add( car.wheel_fl );
		car.wheel_fl_constraint = new Physijs.DOFConstraint(
			car.wheel_fl, car.body, new THREE.Vector3( -3.5, 6.5, 5 )
		);
		scene.addConstraint( car.wheel_fl_constraint );
		car.wheel_fl_constraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 8, z: 1 });
		car.wheel_fl_constraint.setAngularUpperLimit({ x: 0, y: Math.PI / 8, z: 0 });
		
		car.wheel_fr.rotation.x = Math.PI / 2;
		car.wheel_fr.position.set( -3.5, 6.5, -5 );
		car.wheel_fr.receiveShadow = car.wheel_fr.castShadow = true;
		scene.add( car.wheel_fr );
		car.wheel_fr_constraint = new Physijs.DOFConstraint(
			car.wheel_fr, car.body, new THREE.Vector3( -3.5, 6.5, -5 )
		);
		scene.addConstraint( car.wheel_fr_constraint );
		car.wheel_fr_constraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 8, z: 1 });
		car.wheel_fr_constraint.setAngularUpperLimit({ x: 0, y: Math.PI / 8, z: 0 });
		
		car.wheel_bl.rotation.x = Math.PI / 2;
		car.wheel_bl.position.set( 3.5, 6.5, 5 );
		car.wheel_bl.receiveShadow = car.wheel_bl.castShadow = true;
		scene.add( car.wheel_bl );
		car.wheel_bl_constraint = new Physijs.DOFConstraint(
			car.wheel_bl, car.body, new THREE.Vector3( 3.5, 6.5, 5 )
		);
		scene.addConstraint( car.wheel_bl_constraint );
		car.wheel_bl_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
		car.wheel_bl_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });
		
		car.wheel_br.rotation.x = Math.PI / 2;
		car.wheel_br.position.set( 3.5, 6.5, -5 );
		car.wheel_br.receiveShadow = car.wheel_br.castShadow = true;
		scene.add( car.wheel_br );
		car.wheel_br_constraint = new Physijs.DOFConstraint(
			car.wheel_br, car.body, new THREE.Vector3( 3.5, 6.5, -5 )
		);
		scene.addConstraint( car.wheel_br_constraint );
		car.wheel_br_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
		car.wheel_br_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });
		
      
      	// add the key listeners to move the car with
		document.addEventListener(
			'keydown',
			function( ev ) {
				switch( ev.keyCode ) {
					case 37:
						// Left
						car.wheel_fl_constraint.configureAngularMotor( 1, -Math.PI / 2, Math.PI / 2, 1, 200 );
						car.wheel_fr_constraint.configureAngularMotor( 1, -Math.PI / 2, Math.PI / 2, 1, 200 );
						car.wheel_fl_constraint.enableAngularMotor( 1 );
						car.wheel_fr_constraint.enableAngularMotor( 1 );
						break;
					
					case 39:
						// Right
						car.wheel_fl_constraint.configureAngularMotor( 1, -Math.PI / 2, Math.PI / 2, -1, 200 );
						car.wheel_fr_constraint.configureAngularMotor( 1, -Math.PI / 2, Math.PI / 2, -1, 200 );
						car.wheel_fl_constraint.enableAngularMotor( 1 );
						car.wheel_fr_constraint.enableAngularMotor( 1 );
						break;
					
					case 38:
						// Up
						car.wheel_bl_constraint.configureAngularMotor( 2, 1, 0, 5, 2000 );
						car.wheel_br_constraint.configureAngularMotor( 2, 1, 0, 5, 2000 );
						car.wheel_bl_constraint.enableAngularMotor( 2 );
						car.wheel_br_constraint.enableAngularMotor( 2 );
						break;
					
					case 40:
						// Down
						car.wheel_bl_constraint.configureAngularMotor( 2, 1, 0, -5, 2000 );
						car.wheel_br_constraint.configureAngularMotor( 2, 1, 0, -5, 2000 );
						car.wheel_bl_constraint.enableAngularMotor( 2 );
						//car.wheel_br_constraint.enableAngularMotor( 2 );
						break;
				}
			}
		);
		document.addEventListener(
			'keyup',
			function( ev ) {
				switch( ev.keyCode ) {
					case 37:
						// Left
						car.wheel_fl_constraint.disableAngularMotor( 1 );
						car.wheel_fr_constraint.disableAngularMotor( 1 );
						break;
					
					case 39:
						// Right
						car.wheel_fl_constraint.disableAngularMotor( 1 );
						car.wheel_fr_constraint.disableAngularMotor( 1 );
						break;
					
					case 38:
						// Up
						car.wheel_bl_constraint.disableAngularMotor( 2 );
						car.wheel_br_constraint.disableAngularMotor( 2 );
						break;
					
					case 40:
						// Down
						car.wheel_bl_constraint.disableAngularMotor( 2 );
						car.wheel_br_constraint.disableAngularMotor( 2 );
						break;
				}
			}
		);
		
		
		requestAnimationFrame( render );
		scene.simulate();
	};
	
	render = function() {
		requestAnimationFrame( render );
		renderer.render( scene, camera );
		render_stats.update();
	};
	
	// set the scene to initiliaze as soon as the window is loaded
	window.onload = initScene;
	