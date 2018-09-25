Internal Dependencies
---------------------

    DriveHandler = require('./carDriveHandler.litcoffee')
    regionInterface = require('../regionInterface.litcoffee')


Main Program
------------

Gets the target point to move to

    getTargetPoint = (regionFile, targetRegionNum, xpos, ypos) ->
      currentRegion = regionInterface.getRegion(regionFile, xpos, ypos)
      targetRegion = regionFile.Regions[targetRegionNum]
      # TODO: abstract out and add more pathfinding capabilities
      targetPosition = regionInterface.getTransition(regionFile,
        currentRegion, targetRegion)


Calculates the target theta to move to based on the current position and target position

    getTargetTheta = (regionFile, targetRegionNum, poseData) ->
      [xpos, ypos] = poseData
      currentPosition = [xpos, ypos]
      targetPosition = getTargetPoint(regionFile, targetRegionNum, xpos, ypos)
      targetTheta = Math.atan2(targetPosition[1] - currentPosition[1], targetPosition[0] - currentPosition[0])
      return targetTheta

Create the Handler

    class MotionHandler
      regionFile: null
      driveHandler: new DriveHandler()

      constructor: (regionFile) ->
        @regionFile = regionFile

      # starts moving the robot toward the destination
      plotCourse: (targetRegionNum, maxVelocity, poseData) =>
        targetTheta = getTargetTheta(@regionFile, targetRegionNum, poseData)
        @driveHandler.setVelocityTheta(maxVelocity, targetTheta, poseData)

      stop: () -> @driveHandler.stop()

Export
------

    module.exports = MotionHandler
