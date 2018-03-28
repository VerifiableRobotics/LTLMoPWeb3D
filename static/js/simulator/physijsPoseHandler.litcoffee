Internal Dependencies
---------------------

    engine = require('./initializePhysics.js')
    regionInterface = require('./regionInterface.litcoffee')
    locomotionHandler = require('./carLocomotionHandler.litcoffee')

Main Program
------------

Initial set up

    currentVelocity = 0
    currentTheta = 0
    regionFile = {}

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


Set the velocity and theta

    setVelocityTheta = (velocity, theta) ->
      car = engine.getCar()
      #console.log('car position x:' + car.body.position.x)
      #console.log('car position y:' + car.body.position.z)
      locomotionHandler.setVelocityTheta(car, velocity, theta)

      # set current velocity and theta in case of later stop
      currentVelocity = velocity
      currentTheta = theta
      #console.log('velocity: ' + velocity)
      #console.log('car x: ' + car.body.quaternion._euler.x)
      #console.log('car y: ' + car.body.quaternion._euler.y)
      #console.log('car z: ' + car.body.quaternion._euler.z)
      #console.log('wheel theta: ' + theta)


Stop the velocity and theta (reverse acceleration)

    stopVelocityTheta = () ->
      car = engine.getCar()
      locomotionHandler.stopVelocityTheta(car, currentVelocity, currentTheta)

Given region number, creates the car at its centroid

    createCar = (region_num) ->
      region = regionFile.Regions[region_num]
      centroid = regionInterface.getCentroid(region)
      engine.create3DCar(centroid[0], 0, centroid[1])

Gets the current region of the car

    getCurrentRegion = () ->
      car = engine.getCar()
      xpos = car.body.position.x
      ypos = car.body.position.z
      currentRegion = regionInterface.getRegion(regionFile, xpos, ypos)
      return currentPosition

Gets the target point to move to

    getTargetPoint = (region_num) ->
      targetRegion = regionFile.Regions[region_num]
      targetPosition = regionInterface.getTransition(regionFile,
        getCurrentRegion(), targetRegion)


Starts moving the car toward the destination

    plotCourse = (region_num, maxVelocity) ->
      car = engine.getCar()
      targetPosition = getTargetPoint(region_num)
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


Export
------

    module.exports = {
      createRegions: create3DRegions,
      setInitialRegion: createCar
      getCurrentRegion,
      stop: stopVelocityTheta,
      plotCourse,
    }
