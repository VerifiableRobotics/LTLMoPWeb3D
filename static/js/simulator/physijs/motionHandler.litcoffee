Internal Dependencies
---------------------

    DriveHandler = require('./carDriveHandler.litcoffee')
    regionInterface = require('../regionInterface.litcoffee')


Main Program
------------
Globals

    driveHandler = new DriveHandler()

## Handler Functions

Gets the target point to move to

    getTargetPoint = (regionFile, targetRegionNum, xpos, ypos) ->
      currentRegion = regionInterface.getRegion(regionFile, xpos, ypos)
      targetRegion = regionFile.Regions[targetRegionNum]
      # TODO: abstract out and add more pathfinding capabilities
      targetPosition = regionInterface.getTransition(regionFile,
        currentRegion, targetRegion)


Starts moving the car toward the destination

    plotCourse = (regionFile, targetRegionNum, maxVelocity, poseData) ->
      [xpos, ypos, carTheta] = poseData
      currentPosition = [xpos, ypos]
      targetPosition = getTargetPoint(regionFile, targetRegionNum, xpos, ypos)
      targetTheta = Math.atan2(targetPosition[1] - currentPosition[1], targetPosition[0] - currentPosition[0])

      driveHandler.setVelocityTheta(maxVelocity, targetTheta, poseData)


Export
------

    module.exports = {
      plotCourse,
      stop: driveHandler.stop
    }
