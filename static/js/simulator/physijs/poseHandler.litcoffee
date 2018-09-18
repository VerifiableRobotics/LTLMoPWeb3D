Internal Dependencies
---------------------

    engine = require('./engine.js')
    regionInterface = require('../regionInterface.litcoffee')
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
      engine.createRegions(regionFile.Regions)

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
      #console.log('car x: ' + car.body.rotation.x)
      #console.log('car y: ' + car.body.rotation.y)
      #console.log('car z: ' + car.body.rotation.z)
      #console.log('wheel theta: ' + theta)


Stop the velocity and theta (reverse acceleration)

    stopVelocityTheta = () ->
      car = engine.getCar()
      locomotionHandler.stopVelocityTheta(car, currentVelocity, currentTheta)

Given region number, creates the car at its centroid

    createCar = (region_num) ->
      region = regionFile.Regions[region_num]
      centroid = regionInterface.getCentroid(region)
      engine.createCar(centroid[0], 0, centroid[1])

Gets the current region of the car

    getCurrentRegion = () ->
      car = engine.getCar()
      xpos = car.body.position.x
      ypos = car.body.position.z
      currentRegion = regionInterface.getRegion(regionFile, xpos, ypos)
      return currentRegion

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
      carTheta = car.body.rotation.y
      if Math.abs(car.body.rotation.x) < Math.PI/2
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
