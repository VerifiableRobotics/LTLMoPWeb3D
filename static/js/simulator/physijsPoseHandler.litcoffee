Internal Dependencies
---------------------

    engine = require('./initializePhysics.js')

Main Program
------------

Initial set up

    currentVelocity = 0
    currentTheta = 0
    regionFile = {}

## Helpers

Given a region, get the centroid

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


Given a region, get the midpoint of the transition from the current region to it

    getTransition = (region) ->
      regionToName = region.name
      regionFromName = regionFile.Regions[getCurrentRegion()].name
      #console.log('regionFrom: ' + regionFromName + ' regionTo: ' + regionToName)
      # get correct transition array, could be ordered either way
      transition = if !regionFile.Transitions[regionFromName]? or !regionFile.Transitions[regionFromName][regionToName]?
        regionFile.Transitions[regionToName][regionFromName] 
      else regionFile.Transitions[regionFromName][regionToName]
      # return midpoint
      return [(transition[0][0] + transition[1][0]) / 2, (transition[0][1] + transition[1][1]) / 2]


## Handler Functions

Create 3D regions from the region array

    create3DRegions = (regionsFile) ->
      regionFile = regionsFile
      # loop through the region array
      for region in regionFile.Regions
        # skip boundary
        if region.name == 'boundary'
          continue
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
            color: 'rgb('+ region.color.join(',') + ')'
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
        engine.getScene().add(new_ground)     

      
Set the velocity and theta of the car

    setVelocityTheta = (velocity, theta) ->
      car = engine.getCar()
      #console.log('car position x:' + car.body.position.x)
      #console.log('car position y:' + car.body.position.z)
      # z-axis motor, upper limit, lower limit, target velocity, maximum force
      car.wheel_bl_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheel_br_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheel_fl_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheel_fr_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      # start z-axis motors
      car.wheel_bl_constraint.enableAngularMotor( 2 )
      car.wheel_br_constraint.enableAngularMotor( 2 )
      car.wheel_fl_constraint.enableAngularMotor( 2 )
      car.wheel_fr_constraint.enableAngularMotor( 2 )
      # x-axis motor, upper limit, lower limit, target velocity, maximum force
      car.wheel_fl_constraint.configureAngularMotor( 1, theta, 0, theta, 200 )
      car.wheel_fr_constraint.configureAngularMotor( 1, theta, 0, theta, 200 )
      # start x-axis motor
      car.wheel_fl_constraint.enableAngularMotor( 1 )
      car.wheel_fr_constraint.enableAngularMotor( 1 )

      # set current velocity and theta in case of later stop
      currentVelocity = velocity
      currentTheta = theta
      #console.log('velocity: ' + velocity)
      #console.log('car x: ' + car.body.quaternion._euler.x)
      #console.log('car y: ' + car.body.quaternion._euler.y)
      #console.log('car z: ' + car.body.quaternion._euler.z)
      #console.log('wheel theta: ' + theta)

    
Stop the velocity and theta of the car (reverse acceleration)

    stopVelocityTheta = () ->
      car = engine.getCar()
      # set motor to opposite to 'brake' the car
      car.wheel_bl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheel_br_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheel_fl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheel_fr_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      
      # set motor to opposite to move the wheels back to straight
      car.wheel_fl_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, 0, 200 )
      car.wheel_fr_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, 0, 200 )


Given region number, creates the car at its centroid

    createCar = (region_num) ->
      region = regionFile.Regions[region_num]
      xpos = region.position[0]
      ypos = region.position[1]
      centroid = getCentroid(region)
      engine.create3DCar(centroid[0], 0, centroid[1])


Starts moving the car toward the destination

    plotCourse = (region_num, maxVelocity) ->
      car = engine.getCar()
      target = regionFile.Regions[region_num]
      targetPosition = getTransition(target)
      currentPosition = [car.body.position.x, car.body.position.z]
      targetTheta = Math.atan2(targetPosition[1] - currentPosition[1], targetPosition[0] - currentPosition[0])
      #console.log('target theta: ' + targetTheta)
      # get proper car theta via transformations of euler angles
      carTheta = car.body.quaternion._euler.y
      if Math.abs(car.body.quaternion._euler.x) < Math.PI/2
        carTheta = -(carTheta + Math.PI)
      #console.log('car theta: ' + carTheta)
      # theta = diff b/t car body's theta and target theta
      wheelTheta = -(targetTheta - carTheta)
      # properly transform when angle is too big/too small
      if wheelTheta > Math.PI 
        wheelTheta = Math.PI - wheelTheta
      else if wheelTheta < -Math.PI 
        wheelTheta = 2*Math.PI + wheelTheta
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
      car = engine.getCar()
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


Export
------

    module.exports = {
      createRegions: create3DRegions,
      setInitialRegion: createCar
      getCurrentRegion,
      stop: stopVelocityTheta,
      plotCourse,
    }
