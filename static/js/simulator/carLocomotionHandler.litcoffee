Locomotion Handler for a PhysiJS car
------------------------------------

Set the velocity and theta of the car

    setVelocityTheta = (car, velocity, theta) ->
      # z-axis motor, upper limit, lower limit, target velocity, maximum force
      car.wheel_bl_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheel_br_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheel_fl_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      car.wheel_fr_constraint.configureAngularMotor( 2, velocity, 0, velocity, 200000 )
      # start z-axis motors
      car.wheel_bl_constraint.enableAngularMotor( 2 )
      car.wheel_br_constraint.enableAngularMotor( 2 )
      car.wheel_fl_constraint.enableAngularMotor( 2 )
      car.wheel_fr_constraint.enableAngularMotor( 2 )
      # x-axis motor, upper limit, lower limit, target velocity, maximum force
      car.wheel_fl_constraint.configureAngularMotor( 1, theta, 0, theta, 200 )
      car.wheel_fr_constraint.configureAngularMotor( 1, theta, 0, theta, 200 )
      # start x-axis motor
      car.wheel_fl_constraint.enableAngularMotor( 1 )
      car.wheel_fr_constraint.enableAngularMotor( 1 )

Stop the velocity and theta of the car (reverse acceleration)

    stopVelocityTheta = (car, currentVelocity, currentTheta) ->
      # set motor to opposite to 'brake' the car
      car.wheel_bl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheel_br_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheel_fl_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )
      car.wheel_fr_constraint.configureAngularMotor( 2, currentVelocity, -currentVelocity, 0, 200000 )

      # set motor to opposite to move the wheels back to straight
      car.wheel_fl_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, 0, 200 )
      car.wheel_fr_constraint.configureAngularMotor( 1, currentTheta, -currentTheta, 0, 200 )


Export
------

    module.exports = {
      setVelocityTheta,
      stopVelocityTheta
    }
