  // largely borrowed from a physijs example
  // plenty of refactoring done and some changes as well


  'use strict';
  
  // set worker and ammo
  Physijs.scripts.worker = 'static/physijs_worker.js';
  Physijs.scripts.ammo = 'ammo.js';
  
  // declare objects
  var initScene, render,
    ground_material, car_material, wheel_material, wheel_geometry,
    projector, renderer, scene, ground_geometry, ground, light, camera,
    car = {};
  
  // initialize the scene
  initScene = function() {
    projector = new THREE.Projector;
    
    // create the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    var rendWidth = $('#viewport').width();
    var rendHeight = $('#viewport').height();
    console.log(rendHeight);
    renderer.setSize( rendWidth, rendHeight );
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    document.getElementById( 'viewport' ).appendChild( renderer.domElement );
    
    
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
    
    requestAnimationFrame( render );
    scene.simulate();
  };
  
  render = function() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
  };
  
  // set the scene to initiliaze as soon as the window is loaded
  window.onload = initScene;
  
  $( document ).ready(function() {
    $('#get_vel_theta').click(function(){
      // ajax call for velocity/theta
      var currentVelocity = 0; // stores current velocity
      var currentTheta = 0; // stores current theta

      console.log("clicked get_vel_theta");
      getVelocityTheta();
      
      // ajax call for velocity theta
      function getVelocityTheta() {
        var x = car.body.position.x;
        var y = car.body.position.z; // z-axis is the 'y-axis' in this case for simplicity
        console.log("car position x:" + x);
        console.log("car position z:" + y);
        $.ajax({
          url: '/simulator/getVelocityTheta',
          type: 'GET',
          datatype: "json",
          data: {x: x, y: y},
          success: function(data) {
            // z-axis motor, upper limit, lower limit, target velocity, maximum force
            car.wheel_bl_constraint.configureAngularMotor( 2, data.velocity, 0, data.velocity, 200000 );
            car.wheel_br_constraint.configureAngularMotor( 2, data.velocity, 0, data.velocity, 200000 );
            car.wheel_fl_constraint.configureAngularMotor( 2, data.velocity, 0, data.velocity, 200000 );
            car.wheel_fr_constraint.configureAngularMotor( 2, data.velocity, 0, data.velocity, 200000 );
            car.wheel_bl_constraint.enableAngularMotor( 2 ); // start z-axis motor
            car.wheel_br_constraint.enableAngularMotor( 2 ); // start z-axis motor
            car.wheel_fl_constraint.enableAngularMotor( 2 ); // start z-axis motor
            car.wheel_fr_constraint.enableAngularMotor( 2 ); // start z-axis motor

            // x-axis motor, upper limit, lower limit, target velocity, maximum force
            car.wheel_fl_constraint.configureAngularMotor( 1, data.theta, 0, data.theta, 200 );
            car.wheel_fr_constraint.configureAngularMotor( 1, data.theta, 0, data.theta, 200 );
            car.wheel_fl_constraint.enableAngularMotor( 1 ); // start x-axis motor
            car.wheel_fr_constraint.enableAngularMotor( 1 ); // start x-axis motor

            // set current velocity and theta in case of later error
            currentVelocity = data.velocity;
            currentTheta = data.theta;
            var newstr = "velocity: " + data.velocity.toString() + " , theta: " + data.theta.toString();
            console.log(newstr);
          },
          error: function(xhr, status) {
            // set motor to opposite to "brake" the car
            car.wheel_bl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 );
            car.wheel_br_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 );
            car.wheel_fl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 );
            car.wheel_fr_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 );
            car.wheel_bl_constraint.disableAngularMotor( 2 ); // stop z-axis motors
            car.wheel_br_constraint.disableAngularMotor( 2 ); 
            car.wheel_fl_constraint.disableAngularMotor( 2 ); 
            car.wheel_fr_constraint.disableAngularMotor( 2 ); 

            // set motor to opposite to move the wheels back to straight
            car.wheel_fl_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, -currentTheta, 200 );
            car.wheel_fr_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, -currentTheta, 200 );
            car.wheel_fl_constraint.disableAngularMotor( 1 ); // stop x-axis motors
            car.wheel_fr_constraint.disableAngularMotor( 1 ); 

            console.log("velocity theta ajax error");
          }
        }); // end ajax
      } // end func
    }); // end click

    $('#get_sensors').click(function() {
      // ajax call for sensor list

      console.log("clicked get_sensors");

      $.ajax({
        url: '/simulator/getSensorList',
        type: 'GET',
        datatype: "json",
        success: function(data) {
          $('#sensor_list').empty(); // empty ul
          // add li/buttons to ul
          for (var i = 0; i < data.sensorArray.length; i++) {
            $('#sensor_list').append("<li><button type=\"button\" class=\"sensor_button\">" + data.sensorArray[i] + "</button></li>");
          }
          $(".sensor_button").click(function(ev) {
            $(ev.target).toggleClass("green_sensor"); // toggle the clicked button's color
            // send ajax here
          });
        },
        error: function(xhr, status) {
          console.log("sensor ajax error");
        }
      }); // end ajax
    }); // end click

  // ------------------ the below in part borrowed from StackOverflow, thank you olanod! ----------------------
  // bind to change event
  $('#regions_upload_file').change(function(){
    var file = this.files[0];
    var name = file.name;
    var extension = name.split('.')[name.split('.').length - 1]
    // validation
    if(extension != "regions") {
      alert("This only accepts *.regions files!");
    }
    else { // do upload
      var formData = new FormData($('#regions_upload_form')[0]);
      $.ajax({
        url: '/simulator/uploadRegions',
        type: 'POST',
        // ajax callbacks 
        success: function(data) {
          createRegionsFromJSON(data.theList);
        },
        error: function(xhr, status) {
          console.log("regions upload failed")
        },
        // form data to send
        data: formData,
        // options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false
      }); // end ajax
    } // end else
  });
  // --------------------------- end borrowed from StackOverflow ---------------------
  
  // create regions from JSON
  function createRegionsFromJSON(theList) {
    // loop through the region array
    theList.forEach(function(region) {
      // get name
      var name = region.name;
      // get rgb values
      var red = region.color[0]; 
      var green = region.color[1];
      var blue = region.color[2];
      // get position
      var xpos = region.position[0];
      var ypos = region.position[1];
      // get size
      var width = region.size[0];
      var height = region.size[1];

      // create the new ground material
      var new_ground_material = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({color: "rgb(" + red + "," + green + "," + blue + ")"}),  // set color
        .5, // high friction
        0 // no restitution
      );
      // create the new ground
      var new_ground = new Physijs.BoxMesh(
        new THREE.CubeGeometry(width, 1, height), // set width and height
        new_ground_material,
        0 // mass
      );
      new_ground.position.set(xpos, 0, ypos); // set position
      
      // add the new_ground to the scene
      scene.add(new_ground);
      
    }) // end for each
  }
  
  // camera zooming and panning
  $(document).keyup(function(event) {
    console.log(event.which);
    var zoomIncrement = 1.2; // zoom constant
    var moveIncrement = 10; // move constant
    if(event.which == 109 || event.which == 189) { // minus keys
      camera.position.set(camera.position.x * zoomIncrement, camera.position.y * zoomIncrement, camera.position.z * zoomIncrement); // zoom out
    }
    else if(event.which == 107 || event.which == 187) { // plus keys
      camera.position.set(camera.position.x / zoomIncrement, camera.position.y / zoomIncrement, camera.position.z / zoomIncrement); // zoom in
    }
    else if(event.which == 40) { // down arrow
      camera.position.set(camera.position.x + moveIncrement, camera.position.y, camera.position.z + moveIncrement); // camera move back
    }
    else if(event.which == 38) { // up arrow
      camera.position.set(camera.position.x - moveIncrement, camera.position.y, camera.position.z - moveIncrement); // camera move forward
    }
    else if(event.which == 37) { // left key
      camera.position.set(camera.position.x - moveIncrement, camera.position.y, camera.position.z + moveIncrement); // pan left
    }
    else if(event.which == 39) { // right key
      camera.position.set(camera.position.x + moveIncrement, camera.position.y, camera.position.z - moveIncrement); // pan right
    }
  }); // end keypress

  // resize warning
  $(window).resize(function() {
    alert("The renderer has a fixed width, please refresh for simulator to have proper width and height");
  });
}); // end document ready
    