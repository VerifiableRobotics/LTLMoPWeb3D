Internal Dependencies
---------------------

    engine = require('./engine.litcoffee')
    regionInterface = require('../regionInterface.litcoffee')


Main Program
------------

Create 3D regions from the region array

    create3DRegions = (regionFile) ->
      engine.createRegions(regionFile.Regions)

Given region number, creates the car at its centroid

    createCar = (regionFile, regionNum) ->
      region = regionFile.Regions[regionNum]
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


Export
------

    module.exports = {
      createRegions: create3DRegions,
      setInitialRegion: createCar
      getPose
    }
