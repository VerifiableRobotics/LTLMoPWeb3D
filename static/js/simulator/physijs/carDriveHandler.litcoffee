Internal Dependencies
---------------------

    CarLocomotionHandler = require('./carLocomotionHandler.litcoffee')


Main Program
------------
Converts the global target velocity, theta, and pose data (carTheta) to velocity and theta for the wheels of the car

    setVelocityTheta = (maxVelocity, targetTheta, carTheta, loco) ->
      # wheelTheta = diff b/t car body's theta and target theta
      wheelTheta = -(targetTheta - carTheta)
      # properly transform when angle is too big/too small
      if wheelTheta > Math.PI
        wheelTheta = Math.PI - wheelTheta
      else if wheelTheta < -Math.PI
        wheelTheta = 2*Math.PI + wheelTheta

      if maxVelocity <= 0 then maxVelocity = 8 # default

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

      setVelocityTheta: (maxVelocity, targetTheta, carTheta) =>
        setVelocityTheta(maxVelocity, targetTheta, carTheta, @loco)

      stop: () => @loco.stop()


Export
------

    module.exports = CarDriveHandler
