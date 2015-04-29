Dependencies
------------

    RegionsParser = require('./regionsParser.litcoffee')
    SpecParser = require('./specParser.litcoffee')
    AutomatonParser = require('./automatonParser.litcoffee')
    Executor = require('./executor.litcoffee')

Main Program
------------    

    spec = {}
    automaton = {}
    regions = {}
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

        
      # create 3D regions from the region array
      create3DRegions = (regions_arr) ->
        # loop through the region array
        for region in regions_arr
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
          for point, pointIndex in region.points
            if pointIndex == 0
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
          new_ground.position.set(xpos, 0, ypos)
          new_ground.rotation.x = Math.PI/2
          new_ground.receiveShadow = true
          # add the new_ground to the scene
          scene.add(new_ground)

        # end for each
      # end create 3D regions      

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
              spec = SpecParser.parseSpec(ev.target.result)
              console.log("Spec Object: ")
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
              automaton = AutomatonParser.parseAutomaton(ev.target.result, spec)
              console.log("Automaton Object: ")
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
        else
          reader = new FileReader()
          reader.onload = (ev) -> 
            regions = RegionsParser.parseRegions(ev.target.result)
            console.log("Regions Object: ")
            console.log(regions)
            create3DRegions(regions.Regions)
          # end onload
          reader.readAsText(file)
        # end else
      # end change
      
      $executor_start_button.click () ->
        # initialize the execution loop        
        counter = 0
        executorInterval = 0

        executionLoop = () ->
          # if first execution
          if counter == 0
            initialRegion = Executor.execute(automaton, getInitialProps(), null, null)
            createCar(initialRegion)
            counter = 1
          else
            currentRegion = getCurrentRegion()
            nextRegion = Executor.execute(automaton, null, getSensors(), currentRegion)
            # if there is a next region, move to it
            if nextRegion != null
              if nextRegion == currentRegion then stopVelocityTheta() else plotCourse(nextRegion)
            # if there isn't, stop moving
            else if nextRegion != false
              stopVelocityTheta()
            # if there isn't a current state, stop the execution loop
            else  
              clearInterval(executorInterval)
        
        # start the execution loop
        executorInterval = setInterval(executionLoop, 300)

        # disable buttons/uploads
        $executor_start_button.prop('disabled', true)
        $automaton_upload_file.prop('disabled', true)
        $automaton_upload_button.prop('disabled', true)
        $spec_upload_file.prop('disabled', true)
        $spec_upload_button.prop('disabled', true)

    currentVelocity = 0
    currentTheta = 0

      
Set the velocity and theta of the car

    setVelocityTheta = (velocity, theta) ->
      console.log("car position x:" + car.body.position.x)
      console.log("car position y:" + car.body.position.z)
      # z-axis motor, upper limit, lower limit, target velocity, maximum force
      car.wheel_bl_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheel_br_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheel_fl_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheel_fr_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheel_bl_constraint.enableAngularMotor( 2 ) # start z-axis motor
      car.wheel_br_constraint.enableAngularMotor( 2 ) # start z-axis motor
      car.wheel_fl_constraint.enableAngularMotor( 2 ) # start z-axis motor
      car.wheel_fr_constraint.enableAngularMotor( 2 ) # start z-axis motor
      # x-axis motor, upper limit, lower limit, target velocity, maximum force
      car.wheel_fl_constraint.configureAngularMotor( 1, theta, 0, theta, 200 )
      car.wheel_fr_constraint.configureAngularMotor( 1, theta, 0, theta, 200 )
      car.wheel_fl_constraint.enableAngularMotor( 1 ) # start x-axis motor
      car.wheel_fr_constraint.enableAngularMotor( 1 ) # start x-axis motor

      # set current velocity and theta in case of later stop
      currentVelocity = velocity
      currentTheta = theta
      console.log("velocity: " + velocity)
      console.log("car x: " + car.body.quaternion._euler.x)
      console.log("car y: " + car.body.quaternion._euler.y)
      console.log("car z: " + car.body.quaternion._euler.z)
      console.log("wheel theta: " + theta)

    
Stop the velocity and theta of the car (reverse acceleration?)

    stopVelocityTheta = () ->
      # set motor to opposite to "brake" the car
      car.wheel_bl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 )
      car.wheel_br_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 )
      car.wheel_fl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 )
      car.wheel_fr_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, -currentVelocity, 200000 )
      car.wheel_bl_constraint.disableAngularMotor( 2 ) # stop z-axis motors
      car.wheel_br_constraint.disableAngularMotor( 2 ) 
      car.wheel_fl_constraint.disableAngularMotor( 2 ) 
      car.wheel_fr_constraint.disableAngularMotor( 2 )

      # set motor to opposite to move the wheels back to straight
      car.wheel_fl_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, -currentTheta, 200 )
      car.wheel_fr_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, -currentTheta, 200 )
      car.wheel_fl_constraint.disableAngularMotor( 1 ) # stop x-axis motors
      car.wheel_fr_constraint.disableAngularMotor( 1 )


Given region object, get the centroid

    getCentroid = (region) ->
      # vars for getting centroid of region
      regionX = 0
      regionY = 0
      numPoints = region.points.length
      position = region.position
      for point in region.points
        regionX += point[0]
        regionY += point[1]

      return [position[0] + regionX / numPoints, position[1] + regionY / numPoints]

Given region object, get the midpoint of the transition from the current region to it

    getTransition = (region) ->
      regionToName = region.name
      regionFromName = regions.Regions[getCurrentRegion()].name
      console.log("regionFrom: " + regionFromName + " regionTo: " + regionToName)
      # get correct transition array, could be ordered either way
      transition = if !regions.Transitions[regionFromName]? 
        transition = regions.Transitions[regionToName][regionFromName] 
      else regions.Transitions[regionFromName][regionToName]
      # return midpoint
      return [(transition[0][0] + transition[1][0]) / 2, (transition[0][1] + transition[1][1]) / 2]


Given region number, creates the car at its centroid

    createCar = (region_num) ->
      region = regions.Regions[region_num]
      xpos = region.position[0]
      ypos = region.position[1]
      centroid = getCentroid(region)
      create3DCar(centroid[0], 0, centroid[1])


Starts moving the car toward the destination

    plotCourse = (region_num) ->
      target = regions.Regions[region_num]
      targetPosition = getTransition(target)
      currentPosition = [car.body.position.x, car.body.position.z]
      targetTheta = Math.atan2(targetPosition[1] - currentPosition[1], targetPosition[0] - currentPosition[0])
      console.log("target theta: " + targetTheta)
      # get proper car theta via transformations of euler angles
      carTheta = car.body.quaternion._euler.y
      if Math.abs(car.body.quaternion._euler.x) < Math.PI/2
        carTheta = -(carTheta + Math.PI)
      console.log("car theta: " + carTheta)
      # theta = diff b/t car body's theta and target theta
      setVelocityTheta(5, -(targetTheta - carTheta)) 


Get the current region (number) the car is located in

    getCurrentRegion = () ->
      xpos = car.body.position.x
      ypos = car.body.position.z
      # loop through the region array
      for region, index in regions.Regions
        left = region.position[0]
        right = region.position[0] + region.size[0]
        bottom = region.position[1]
        top = region.position[1] + region.size[1]
        # check if inside bounding box
        if xpos >= left and xpos <= right and ypos >= bottom and ypos <= top
          # if in bounding box, check if inside polygon
          points = region.points
          pos = region.position
          j = points.length - 1
          result = false
          # check if in polygon (counting edges using ray method)
          for point, i in points
            if (points[i][1] + pos[1] > ypos) != (points[j][1] + pos[1] > ypos) and 
            (xpos < (points[j][0] - points[i][0]) * (ypos - points[i][1] + pos[1]) / (points[j][1] - points[i][1]) + points[i][0] + pos[0])
              result = !result
            j = i
          # if in polygon, return the region's index
          if result
            return index
      # not in a region currently    
      return null


Add all prop buttons from the spec object

    addPropButtons = (spec) ->
      # empty uls
      $sensor_list.empty()
      $actuator_list.empty()
      $customprop_list.empty()
      # add li/buttons to uls
      for sensorName, isActive of spec.Sensors
        disabledText = if isActive then "" else "disabled"
        $sensor_list.append("<li><button " + disabledText + " type=\"button\" class=\"sensor_button\">" + 
          sensorName + "</button></li>")
      for actuatorName, isActive of spec.Actions
        disabledText = if isActive then "" else "disabled"
        $actuator_list.append("<li><button " + disabledText + " type=\"button\" class=\"actuator_button\">" + 
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

    getInitialProps = () ->
      props = {}
      # get buttons
      $sensors = $sensor_list.find('.sensor_button:not([disabled])')
      $actuators = $actuator_list.find('.actuator_button:not([disabled])')
      $customprops = $customprop_list.find('.customprop_button:not([disabled])')
      
      props['sensors'] = {}
      props['actuators'] = {}
      props['customprops'] = {}

      # set dictionaries
      for sensor in $sensors
        $sensor = $(sensor)
        props['sensors'][$sensor.text()] = if $sensor.hasClass('green_sensor') then 1 else 0
      for actuator in $actuators
        $actuator = $(actuator)
        props['actuators'][$actuator.text()] = if $actuator.hasClass('green_actuator') then 1 else 0
      for customprop in $customprops
        $customprop = $(customprop)
        props['customprops'][$customprop.text()] = if $customprop.hasClass('green_customprop') then 1 else 0

      props

    getSensors = () ->
      sensors = {}
      # get buttons
      $sensors = $sensor_list.find('.sensor_button:not([disabled])')
      
      # set dictionary
      for sensor in $sensors
        $sensor = $(sensor)
        sensors[$sensor.text()] = if $sensor.hasClass('green_sensor') then 1 else 0
      
      sensors