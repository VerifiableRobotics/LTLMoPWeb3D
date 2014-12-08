spec = {}
automaton = {}
$sensor_list = []
$actuator_list = []
$customprop_list = []

$(document).ready () ->
  $spec_upload_file = $('#spec_upload_file')
  $spec_upload_button = $('#spec_upload_button')
  $automaton_upload_file = $('#automaton_upload_file')
  $automaton_upload_button = $('#automaton_upload_button')
  $regions_upload_file = $('#regions_upload_file')
  $regions_upload_button = $('#regions_upload_button')
  $executor_start_button = $('#executor_start_button')
  $sensor_list = $('#sensor_list')
  $actuator_list = $('#actuator_list')
  $customprop_list = $('#customprop_list')

  # $('#get_vel_theta').click(function(){
  #   # ajax call for velocity/theta
  #   var currentVelocity = 0; # stores current velocity
  #   var currentTheta = 0; # stores current theta

  #   console.log("clicked get_vel_theta");
  #   getVelocityTheta();
    
  #   # ajax call for velocity theta
  #   function getVelocityTheta() {
  #     var x = car.body.position.x;
  #     var y = car.body.position.z; # z-axis is the 'y-axis' in this case for simplicity
  #     console.log("car position x:" + x);
  #     console.log("car position z:" + y);
  #     $.ajax({
  #       url: '/simulator/getVelocityTheta',
  #       type: 'GET',
  #       datatype: "json",
  #       data: {x: x, y: y},
  #       success: function(data) {
  #         # z-axis motor, upper limit, lower limit, target velocity, maximum force
  #         car.wheel_bl_constraint.configureAngularMotor( 2, data.velocity, 0, data.velocity, 200000 );
  #         car.wheel_br_constraint.configureAngularMotor( 2, data.velocity, 0, data.velocity, 200000 );
  #         car.wheel_fl_constraint.configureAngularMotor( 2, data.velocity, 0, data.velocity, 200000 );
  #         car.wheel_fr_constraint.configureAngularMotor( 2, data.velocity, 0, data.velocity, 200000 );
  #         car.wheel_bl_constraint.enableAngularMotor( 2 ); # start z-axis motor
  #         car.wheel_br_constraint.enableAngularMotor( 2 ); # start z-axis motor
  #         car.wheel_fl_constraint.enableAngularMotor( 2 ); # start z-axis motor
  #         car.wheel_fr_constraint.enableAngularMotor( 2 ); # start z-axis motor

  #         # x-axis motor, upper limit, lower limit, target velocity, maximum force
  #         car.wheel_fl_constraint.configureAngularMotor( 1, data.theta, 0, data.theta, 200 );
  #         car.wheel_fr_constraint.configureAngularMotor( 1, data.theta, 0, data.theta, 200 );
  #         car.wheel_fl_constraint.enableAngularMotor( 1 ); # start x-axis motor
  #         car.wheel_fr_constraint.enableAngularMotor( 1 ); # start x-axis motor

  #         # set current velocity and theta in case of later error
  #         currentVelocity = data.velocity;
  #         currentTheta = data.theta;
  #         var newstr = "velocity: " + data.velocity.toString() + " , theta: " + data.theta.toString();
  #         console.log(newstr);
  #       },
  #       error: function(xhr, status) {
  #         # set motor to opposite to "brake" the car
  #         car.wheel_bl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 );
  #         car.wheel_br_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 );
  #         car.wheel_fl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 );
  #         car.wheel_fr_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 );
  #         car.wheel_bl_constraint.disableAngularMotor( 2 ); # stop z-axis motors
  #         car.wheel_br_constraint.disableAngularMotor( 2 ); 
  #         car.wheel_fl_constraint.disableAngularMotor( 2 ); 
  #         car.wheel_fr_constraint.disableAngularMotor( 2 ); 

  #         # set motor to opposite to move the wheels back to straight
  #         car.wheel_fl_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, -currentTheta, 200 );
  #         car.wheel_fr_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, -currentTheta, 200 );
  #         car.wheel_fl_constraint.disableAngularMotor( 1 ); # stop x-axis motors
  #         car.wheel_fr_constraint.disableAngularMotor( 1 ); 

  #         console.error("velocity theta ajax error");
  #       }
  #     }); # end ajax
  #   } # end func
  # }); # end click

    
  # create regions from JSON
  createRegionsFromJSON = (theList) ->
    # loop through the region array
    console.log(theList)
    for region in theList
      # get name
      name = region.name
      # skip boundary
      if name == 'boundary'
        continue
      # get rgb values
      red = region.color[0]
      green = region.color[1]
      blue = region.color[2]
      # get position
      xpos = region.position[0]
      ypos = region.position[1]
      # get size/bounding box
      width = region.size[0]
      height = region.size[1]
      # get holes
      holes = region.holeList

      # create the new ground material
      new_ground_material = Physijs.createMaterial(
        new THREE.MeshBasicMaterial(
          color: "rgb(" + red + "," + green + "," + blue + ")"
          side: THREE.DoubleSide
        ), 
        .5, # high friction
        0 # no restitution
      )
      # create the custom geometry from a 2D shape
      new_shape = new THREE.Shape()
      # add each point as a vertex of the new shape
      for point, index in region.points
        if index == 0
          new_shape.moveTo(point[0], point[1])
        else
          new_shape.lineTo(point[0], point[1])
      # end for
      new_geometry = new_shape.makeGeometry() # create 3D geometry out of 2D shape

      # create the new ground
      new_ground = new Physijs.ConvexMesh(
        new_geometry,
        new_ground_material,
        0 # mass
      )
      # set the position and rotation
      # note: makeGeometry creates shape on xy axis, this is putting it on xz
      new_ground.position.set(xpos, 0, -ypos)
      new_ground.rotation.x = -Math.PI/2
      
      # add the new_ground to the scene
      scene.add(new_ground)
    # end for each
  # end create regions from JSON


  $spec_upload_file.change () ->
    file = this.files[0];
    if file?
      nameSplit = file.name.split('.')
      extension = nameSplit[nameSplit.length - 1]
      # validation
      if extension != "spec"
        alert "This only accepts *.spec files!"
      else 
        reader = new FileReader()
        reader.onload = (ev) -> 
          spec = parseSpec(ev.target.result)
          console.log(spec)
          # enable uploading of automaton now
          $automaton_upload_file.prop('disabled', false)
          $automaton_upload_button.prop('disabled', false)
          addPropButtons(spec)
        # end onload
        reader.readAsText(file)
      # end else
    # end if
  # end change

  $automaton_upload_file.change () ->
    file = this.files[0]
    if file? 
      nameSplit = file.name.split('.')
      extension = nameSplit[nameSplit.length - 1]
      # validation
      if extension != "aut"
        alert "This only accepts *.aut files!"
      else
        reader = new FileReader()
        reader.onload = (ev) -> 
          automaton = parseAutomaton(ev.target.result, spec)
          console.log(automaton)
          # enable executor execution now
          $executor_start_button.prop('disabled', false)
        # end onload
        reader.readAsText(file)
      # end else
    # end if
  # end change

  # bind to change event, partly borrowed from olanod on SO
  $regions_upload_file.change () ->
    file = this.files[0]
    nameSplit = file.name.split('.')
    extension = nameSplit[nameSplit.length - 1]
    # validation
    if extension != "regions"
      alert("This only accepts *.regions files!")
    else # do upload
      formData = new FormData($('#regions_upload_form')[0])
      $.ajax
        url: '/simulator/uploadRegions'
        type: 'POST'
        # ajax callbacks 
        success: (data) ->
          createRegionsFromJSON(data.theList)
        error: (xhr, status) ->
          console.error("regions upload failed")
          alert("Uploading regions failed, please try again with a different regions file")
        # form data to send
        data: formData
        # options to tell jQuery not to process data or worry about content-type.
        cache: false
        contentType: false
        processData: false
      # end ajax
    # end else
  # end change
  
  $executor_start_button.click () ->
    execute(automaton, getProps) # start execution
    # disable buttons/uploads
    $executor_start_button.prop('disabled', true)
    $automaton_upload_file.prop('disabled', true)
    $automaton_upload_button.prop('disabled', true)
    $spec_upload_file.prop('disabled', true)
    $spec_upload_button.prop('disabled', true)



# add all prop buttons from the spec object
addPropButtons = (spec) ->
  # empty uls
  $sensor_list.empty()
  $actuator_list.empty()
  $customprop_list.empty()
  # add li/buttons to uls
  for sensorName, isActive of spec.Sensors
    className = if isActive then "green_sensor" else ""
    $sensor_list.append("<li><button type=\"button\" class=\"sensor_button " + className + "\">" + 
      sensorName + "</button></li>")
  for actuatorName, isActive of spec.Actions
    className = if isActive then "green_actuator" else ""
    $actuator_list.append("<li><button type=\"button\" class=\"actuator_button " + className + "\">" + 
      actuatorName + "</button></li>")
  # customs is just an array
  for custompropName in spec.Customs
    $customprop_list.append("<li><button type=\"button\" class=\"customprop_button\">" + 
      custompropName + "</button></li>")
  # attach click handlers to li/buttons
  $(".sensor_button").click (evt) ->
    $(evt.target).toggleClass("green_sensor")
  $(".actuator_button").click (evt) ->
    $(evt.target).toggleClass("green_actuator")
  $(".customprop_button").click (evt) ->
    $(evt.target).toggleClass("green_customprop")

getProps = () ->
  props = {}
  # get buttons
  $sensors = $sensor_list.find('.sensor_button')
  $actuators = $actuator_list.find('.actuator_button')
  $customprops = $customprop_list.find('.customprop_button')
  
  props['sensors'] = {}
  props['actuators'] = {}
  props['customprops'] = {}

  # set dictionaries
  for sensor in $sensors
    $sensor = $(sensor)
    props['sensors'][$sensor.text()] = $sensor.hasClass('green_sensor')
  for actuator in $actuators
    $actuator = $(actuator)
    props['actuators'][$actuator.text()] = $actuator.hasClass('green_actuator')
  for customprop in $customprops
    $customprop = $(customprop)
    props['customprops'][$customprop.text()] = $customprop.hasClass('green_customprop')

  props

getSensors = () ->
  sensors = {}
  # get buttons
  $sensors = $sensor_list.find('.sensor_button')
  
  # set dictionary
  for sensor in $sensors
    $sensor = $(sensor)
    sensors[$sensor.text()] = $sensor.hasClass('green_sensor')
  
  sensors

exports = {
  getSensors: getSensors
}