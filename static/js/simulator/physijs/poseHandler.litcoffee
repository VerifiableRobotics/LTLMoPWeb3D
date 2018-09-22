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

      # get proper car theta via transformations of euler angles
      carTheta = car.body.rotation.y
      if Math.abs(car.body.rotation.x) < Math.PI/2
        carTheta = -(carTheta + Math.PI)
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
