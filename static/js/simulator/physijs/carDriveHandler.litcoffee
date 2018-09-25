Internal Dependencies
---------------------

    CarLocomotionHandler = require('./carLocomotionHandler.litcoffee')


Main Program
------------
Gets the target wheel theta from the target theta and the car's current theta

    getWheelTheta = (targetTheta, poseData) ->
      carTheta = poseData[2]

      # target wheelTheta = diff b/t car body's theta and target theta
      wheelTheta = -(targetTheta - carTheta)

      # properly transform when angle is too big/too small
      if wheelTheta > Math.PI
        wheelTheta = Math.PI - wheelTheta
      else if wheelTheta < -Math.PI
        wheelTheta = 2*Math.PI + wheelTheta

      return wheelTheta


Converts the global target velocity, theta, and pose data (carTheta) to velocity and theta for the wheels of the car

    setVelocityTheta = (maxVelocity, targetTheta, poseData, loco) ->
      if maxVelocity <= 0 then maxVelocity = 8 # default

      wheelTheta = getWheelTheta(targetTheta, poseData)

      # if theta > PI/4 or PI/2, then slower turn
      if wheelTheta > Math.PI/2 or wheelTheta < -Math.PI/2
        loco.setVelocityTheta(maxVelocity / 4, wheelTheta)
      else if wheelTheta > Math.PI/4 or wheelTheta < -Math.PI/4
        loco.setVelocityTheta(maxVelocity / 2, wheelTheta)
      else
        loco.setVelocityTheta(maxVelocity, wheelTheta)

Create the Handler

    class CarDriveHandler
      loco: new CarLocomotionHandler()

      setVelocityTheta: (maxVelocity, targetTheta, poseData) =>
        setVelocityTheta(maxVelocity, targetTheta, poseData, @loco)

      stop: () => @loco.stop()


Export
------

    module.exports = CarDriveHandler
