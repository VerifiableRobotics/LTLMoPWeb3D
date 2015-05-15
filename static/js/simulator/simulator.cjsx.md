External Dependencies
---------------------
    
    React = require('react')
    { Map, List } = require('immutable')

Internal Dependencies
---------------------

    RegionsParser = require('./regionsParser.litcoffee')
    SpecParser = require('./specParser.litcoffee')
    AutomatonParser = require('./automatonParser.litcoffee')
    Executor = require('./executor.litcoffee')
    Header = require('../header.cjsx.md')

Main Program
------------    

Initial set up

    spec = {}
    automaton = {}
    regionFile = {}
    currentVelocity = 0
    currentTheta = 0
    currentSimulator = {}

Create 3D regions from the region array

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

    
Stop the velocity and theta of the car (reverse acceleration)

    stopVelocityTheta = () ->
      # set motor to opposite to "brake" the car
      car.wheel_bl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheel_br_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheel_fl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheel_fr_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      
      # set motor to opposite to move the wheels back to straight
      car.wheel_fl_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, 0, 200 )
      car.wheel_fr_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, 0, 200 )
      

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
      regionFromName = regionFile.Regions[getCurrentRegion()].name
      console.log("regionFrom: " + regionFromName + " regionTo: " + regionToName)
      # get correct transition array, could be ordered either way
      transition = if !regionFile.Transitions[regionFromName]? or !regionFile.Transitions[regionFromName][regionToName]?
        regionFile.Transitions[regionToName][regionFromName] 
      else regionFile.Transitions[regionFromName][regionToName]
      # return midpoint
      return [(transition[0][0] + transition[1][0]) / 2, (transition[0][1] + transition[1][1]) / 2]


Given region number, creates the car at its centroid

    createCar = (region_num) ->
      region = regionFile.Regions[region_num]
      xpos = region.position[0]
      ypos = region.position[1]
      centroid = getCentroid(region)
      create3DCar(centroid[0], 0, centroid[1])


Starts moving the car toward the destination

    plotCourse = (region_num) ->
      target = regionFile.Regions[region_num]
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
      wheelTheta = -(targetTheta - carTheta)
      # properly transform when angle is too big/too small
      if wheelTheta > Math.PI 
        wheelTheta = Math.PI - wheelTheta
      else if wheelTheta < -Math.PI 
        wheelTheta = 2*Math.PI + wheelTheta
      maxVelocity = currentSimulator.state.velocity
      if maxVelocity <= 0 then maxVelocity = 8 # default
      # if theta > PI/4 or PI/2, then slower turn
      if wheelTheta > Math.PI/2 or wheelTheta < -Math.PI/2
        setVelocityTheta(maxVelocity / 4, wheelTheta)
      else if wheelTheta > Math.PI/4 or wheelTheta < -Math.PI/4
        setVelocityTheta(maxVelocity / 2, wheelTheta)
      else
        setVelocityTheta(maxVelocity, wheelTheta) 


Get the current region (number) the car is located in

    getCurrentRegion = () ->
      xpos = car.body.position.x
      ypos = car.body.position.z
      # loop through the region array
      for region, index in regionFile.Regions
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


Simulator Component
-------------------

    Simulator = React.createClass
      getInitialState: () ->
        return {disableAut: true, disableExec: true, 
        sensors: Map(), actuators: Map(), customs: Map(), regions: Map(),
        velocity: 8}
      
Helper function for uploading files, takes in the event, an extension, and the reader's callback'

      onUpload: (ev, ext, callback) ->
        file = ev.target.files[0]
        if file?
          nameSplit = file.name.split('.')
          extension = nameSplit[nameSplit.length - 1]
          # validation
          if extension != ext
            alert("This only accepts *." + ext + " files!")
          else
            reader = new FileReader()
            reader.onload = callback
            reader.readAsText(file)

When a *.regions file is uploaded; specifically the decomposed one

      onRegionsUpload: (ev) ->
        callback = (ev) => 
          regionFile = RegionsParser.parseRegions(ev.target.result)
          console.log("Regions Object: ")
          console.log(regionFile)
          create3DRegions(regionFile.Regions)
          @addRegionButtons(regionFile.Regions)
        @onUpload(ev, "regions", callback)

When a *.spec file is uploaded
      
      onSpecUpload: (ev) ->
        callback = (ev) => 
          spec = SpecParser.parseSpec(ev.target.result)
          console.log("Spec Object: ")
          console.log(spec)
          # enable uploading of automaton now
          @setState({disableAut: false})
          @addPropButtons(spec)
        @onUpload(ev, "spec", callback)

When a *.aut file is uploaded

      onAutUpload: (ev) ->
        callback = (ev) => 
          automaton = AutomatonParser.parseAutomaton(ev.target.result, spec)
          console.log("Automaton Object: ")
          console.log(automaton)
          # enable executor execution now
          @setState({disableExec: false})
        @onUpload(ev, "aut", callback)
      
Launch the executor

      startExecution: () ->
        executorInterval = 0 # timer ID

        # reset function in case initial props are invalid
        resetExecution = () =>
          @setEnabledProps(true, spec, regionFile.Regions) # re-enable all props
          @setState({disableExec: false})
          clearInterval(executorInterval)

        # initialize the execution loop        
        counter = 0
        executionLoop = () =>
          # if first execution
          if counter == 0
            # current region is the single active one
            currentRegion = @state.regions.find((values) -> values.get("active")).get("index")
            createCar(currentRegion)
            if Executor.execute(automaton, @getInitialProps(), null, currentRegion)
              @setEnabledProps(false, spec, regionFile.Regions) # disable all props
              counter = 1
            else
              resetExecution()
          else
            # get current region and set it
            currentRegion = getCurrentRegion()
            @setActiveRegion(currentRegion)
            # get actuators, customs, and next region from executor's current state
            [nextRegion, actuators, customs] = Executor.execute(automaton, null, @getSensors(), currentRegion)
            @setActiveProps(actuators, customs)
            # if there is a next region, move to it
            if nextRegion != null
              if nextRegion == currentRegion then stopVelocityTheta() else plotCourse(nextRegion)
            # if there isn't, stop moving
            else if nextRegion != false
              stopVelocityTheta()
            # if there isn't a current state, stop the execution loop
            else  
              resetExecution()
        # start the execution loop
        executorInterval = setInterval(executionLoop, 300)
        # disable buttons/uploads
        @setState({disableRegions: true, disableSpec: true, disableAut: true, disableExec: true})

Gets the initial props (all of sensors, actuators, and customs) for the executor to determine initial state  
Outputs a {sensors, actuators, customs} dict of prop -> 1 or 0 (active or not), excluding disabled props      

      getInitialProps: () ->
        sensors = actuators = customs = Map()
        @state.sensors.filter((values, name) -> !values.get("disabled")).forEach (values, name) ->
          sensors = sensors.set(name, if values.get("active") then 1 else 0)
        @state.actuators.filter((values, name) -> !values.get("disabled")).forEach (values, name) ->
          actuators = actuators.set(name, if values.get("active") then 1 else 0)
        @state.customs.forEach (values, name) ->
          customs = customs.set(name, if values.get("active") then 1 else 0)
        return {sensors: sensors.toJS(), actuators: actuators.toJS(), customs: customs.toJS()}

Gets sensor readings for the executor to determine next state  
Outputs a dict of prop -> 1 or 0 (active or not), excluding disabled props

      getSensors: () ->
        sensors = {}
        @state.sensors.filter((values, name) -> !values.get("disabled")).forEach (values, name) ->
          sensors[name] = if values.get("active") then 1 else 0
        return sensors

Add Region buttons based on regions in region file

      addRegionButtons: (regions_arr) ->
        regions = Map()
        # add names to map
        for region, index in regions_arr
          regions = regions.set(region.name, Map({index: index, disabled: false, active: false}))
        # arbitrarily turn first region as active region
        regions = regions.setIn([regions_arr[0].name, "active"], true)
        @setState({regions: regions})


Add Buttons/State based on props in spec
      
      addPropButtons: (spec) ->
        sensors = actuators = customs = Map()
        # add elements to maps
        for propName, isEnabled of spec.Sensors
          sensors = sensors.set(propName, Map({disabled: !isEnabled, active: false}))
        for propName, isEnabled of spec.Actions
          actuators = actuators.set(propName, Map({disabled: !isEnabled, active: false}))
        # customs is just an array, always enabled in spec
        for propName in spec.Customs
          customs = customs.set(propName, Map({disabled: false, active: false}))
        # set maps
        @setState({sensors: sensors, actuators: actuators, customs: customs})
      
Toggle for when a sensor is clicked

      toggleActiveSensors: (name) ->
        return () =>
          @setState((prev) -> {sensors: prev.sensors.updateIn([name, "active"], (val) -> !val)})

Toggle for when an actuator is clicked

      toggleActiveActuators: (name) ->
        return () =>
          @setState((prev) -> {actuators: prev.actuators.updateIn([name, "active"], (val) -> !val)})

Toggle for when an actuator is clicked

      toggleActiveCustoms: (name) ->
        return () =>
          @setState((prev) -> {customs: prev.customs.updateIn([name, "active"], (val) -> !val)})

Toggle the enabled state of all actuators, customs, and regions (unless it were disabled in spec to begin with)

      setEnabledProps: (enabled, spec, regions_arr) ->
        # do not set to true if it were disabled in spec
        actuators = @state.actuators.map((values, name) -> values.set("disabled", !enabled || spec.Actions[name] == 1))
        customs = @state.customs.map((values) -> values.set("disabled", !enabled))
        regions = @state.regions.map((values) -> values.set("disabled", !enabled))
        @setState({actuators: actuators, customs: customs, regions: regions})

Set which region is active

      setActiveRegion: (regionNum) ->
        # set all to false, find the one with the correct index, set it to true
        @setState({regions: @state.regions.map((values) -> values.set("active", false))
          .setIn([@state.regions.findKey((values) -> values.get("index") == regionNum), "active"], true)})

Set which actuators and customs are active based on [0, 1] dict from executor
    
      setActiveProps: (actDict, custDict) ->
        actuators = @state.actuators.map((values, name) -> values.set("active", actDict[name] == 1))
        customs = @state.customs.map((values, name) -> values.set("active", custDict[name] == 1))
        @setState({actuators: actuators, customs: customs})

Set the velocity of the car
      
      setVelocity: (ev) ->
        @setState({velocity: parseInt(ev.target.value)})

Increase Velocity

      increaseVelocity: () ->
        @setState((prev) -> {velocity: prev.velocity + 2})

Decrease Velocity
      
      decreaseVelocity: () ->
        decremented = @state.velocity - 2
        @setState({velocity: if decremented <= 0 then 1 else decremented})

Optimize component speed because we have immutability!

      shouldComponentUpdate: (nextProps, nextState) ->
        isEqual = true
        for k, v of nextState
          if v != @state[k] 
            isEqual = false
            break
        return !isEqual

Render the application

      render: () ->
        return <div>
          <Header />
          <div className="center_wrapper">
            <button type="button" onClick={@startExecution} disabled={@state.disableExec}>Start</button>
          </div>
          <div className="center_wrapper">
            <form className="upload_form">
              <input name="file" type="file" className="upload_file_overlay" onChange={@onRegionsUpload} 
                disabled={@state.disableRegions}/>
              <button type="button" disabled={@state.disableRegions}>Upload Regions</button>
            </form>
            <form className="upload_form">
              <input name="file" type="file" className="upload_file_overlay" onChange={@onSpecUpload} 
                disabled={@state.disableSpec}/>
              <button type="button" disabled={@state.disableSpec}>Upload Spec</button>
            </form>
            <form className="upload_form">
              <input name="file" type="file" className="upload_file_overlay" onChange={@onAutUpload}
                disabled={@state.disableAut} />
              <button type="button" disabled={@state.disableAut}>Upload Automaton</button>
            </form>
          </div>
          <div id="simulator_wrapper">
            <div className="right_wrapper">
              <div>Sensors</div>
              <ul className="simulator_lists">
                {@state.sensors.map((values, name) =>
                  <li>
                    <button type="button" className={if values.get("active") then "prop_button_green" else "prop_button"} 
                      onClick={@toggleActiveSensors(name)} disabled={values.get("disabled")}>{name}</button>
                  </li>).toSeq()
                }
              </ul>
              <div>Actuators</div>
              <ul className="simulator_lists">
                {@state.actuators.map((values, name) =>
                  <li>
                    <button type="button" className={if values.get("active") then "prop_button_green" else "prop_button"} 
                      onClick={@toggleActiveActuators(name)} disabled={values.get("disabled")}>{name}</button>
                  </li>).toSeq()
                }
              </ul>
              <div>Custom Propositions</div>
              <ul className="simulator_lists">
                {@state.customs.map((values, name) =>
                  <li>
                    <button type="button" className={if values.get("active") then "prop_button_green" else "prop_button"}
                      onClick={@toggleActiveCustoms(name)} disabled={values.get("disabled")}>{name}</button>
                  </li>).toSeq()
                }
              </ul>
              <div>Regions</div>
              <ul className="simulator_lists">
                {@state.regions.map((values, name) =>
                  <li>
                    <button type="button" className={if values.get("active") then "prop_button_green" else "prop_button"}
                      onClick={() => @setActiveRegion(values.get("index"))} 
                      disabled={values.get("disabled")}>{name}</button>
                  </li>).toSeq()
                }
              </ul>
              <div>Maximum Velocity</div>
              <input type="text" value={@state.velocity} onChange={@setVelocity} /> <br />
              <button type="button" onClick={@increaseVelocity}>Increase</button>
              <button type="button" onClick={@decreaseVelocity}>Decrease</button>
            </div>
          </div>
        </div>


And render!

    currentSimulator = React.render(<Simulator />, document.getElementById('simulator_body'))