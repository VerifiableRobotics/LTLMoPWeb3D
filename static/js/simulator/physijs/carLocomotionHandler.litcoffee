Locomotion Handler for a PhysiJS car
------------------------------------

Set the velocity and theta of the car

    setVelocityTheta = (car, velocity, theta) ->
      # z-axis motor, upper limit, lower limit, target velocity, maximum force
      car.wheels.bl.constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheels.br.constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheels.fl.constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheels.fr.constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      # start z-axis motors
      car.wheels.bl.constraint.enableAngularMotor( 2 )
      car.wheels.br.constraint.enableAngularMotor( 2 )
      car.wheels.fl.constraint.enableAngularMotor( 2 )
      car.wheels.fr.constraint.enableAngularMotor( 2 )
      # x-axis motor, upper limit, lower limit, target velocity, maximum force
      car.wheels.fl.constraint.configureAngularMotor( 1, theta, 0, theta, 200 )
      car.wheels.fr.constraint.configureAngularMotor( 1, theta, 0, theta, 200 )
      # start x-axis motor
      car.wheels.fl.constraint.enableAngularMotor( 1 )
      car.wheels.fr.constraint.enableAngularMotor( 1 )

Stop the velocity and theta of the car (reverse acceleration)

    stopVelocityTheta = (car, currentVelocity, currentTheta) ->
      # set motor to opposite to 'brake' the car
      car.wheels.bl.constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheels.br.constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheels.fl.constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheels.fr.constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )

      # set motor to opposite to move the wheels back to straight
      car.wheels.fl.constraint.configureAngularMotor( 1, currentTheta, -currentTheta, 0, 200 )
      car.wheels.fr.constraint.configureAngularMotor( 1, currentTheta, -currentTheta, 0, 200 )


Export
------

    module.exports = {
      setVelocityTheta,
      stopVelocityTheta
    }
