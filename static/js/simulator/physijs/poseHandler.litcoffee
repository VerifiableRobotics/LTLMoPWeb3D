Internal Dependencies
---------------------

    engine = require('./engine.litcoffee')
    regionInterface = require('../regionInterface.litcoffee')
    DriveHandler = require('./carDriveHandler.litcoffee')


Main Program
------------

Initial set up

    regionFile = {}
    driveHandler = new DriveHandler()

## Handler Functions

Create 3D regions from the region array

    create3DRegions = (regionsFile) ->
      regionFile = regionsFile
      engine.createRegions(regionFile.Regions)

Given region number, creates the car at its centroid

    createCar = (region_num) ->
      region = regionFile.Regions[region_num]
      centroid = regionInterface.getCentroid(region)
      engine.createCar(centroid[0], 0, centroid[1])

Gets the theta of the car

    getTheta = (car) ->
      # get proper car theta via transformations of euler angles
      carTheta = car.body.rotation.y
      if Math.abs(car.body.rotation.x) < Math.PI/2
        carTheta = -(carTheta + Math.PI)
      return carTheta

Gets the Pose data of the car

    getPose = () ->
      car = engine.getCar()
      xpos = car.body.position.x
      ypos = car.body.position.z
      theta = getTheta(car)
      return [xpos, ypos, theta]

Gets the current region of the car

    getCurrentRegion = () ->
      [xpos, ypos] = getPose()
      currentRegion = regionInterface.getRegion(regionFile, xpos, ypos)
      return currentRegion

Gets the target point to move to

    getTargetPoint = (region_num) ->
      targetRegion = regionFile.Regions[region_num]
      targetPosition = regionInterface.getTransition(regionFile,
        getCurrentRegion(), targetRegion)


Starts moving the car toward the destination

    plotCourse = (region_num, maxVelocity) ->
      [xpos, ypos, carTheta] = getPose()
      currentPosition = [xpos, ypos]
      targetPosition = getTargetPoint(region_num)
      targetTheta = Math.atan2(targetPosition[1] - currentPosition[1], targetPosition[0] - currentPosition[0])

      driveHandler.setVelocityTheta(maxVelocity, targetTheta, carTheta)


Export
------

    module.exports = {
      createRegions: create3DRegions,
      setInitialRegion: createCar
      getCurrentRegion,
      plotCourse,
      stop: driveHandler.stop
    }
