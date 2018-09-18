External Dependencies
---------------------

    Physijs = require('physijs-webpack')
    THREE = require('three')


Helper to create each Wheel of the Car
--------------------------------------
Constants

    wheel_material = Physijs.createMaterial(
      new THREE.MeshLambertMaterial({color: 0x444444}),
      .5, # high friction
      0 # no restitution
    )
    wheel_geometry = new THREE.CylinderGeometry(2, 2, 1, 8)
    pidiv2 = Math.PI / 2 # hold var for less repeated computations

Create a Wheel

    createWheel = (scene, car, wheel, pos) ->
      car.wheels[wheel] = new Physijs.CylinderMesh(
        wheel_geometry,
        wheel_material,
        500
      )

      # set contraints and rotations for the wheel
      car.wheels[wheel].rotation.x = pidiv2
      car.wheels[wheel].position.set(pos.x, pos.y, pos.z)
      car.wheels[wheel].receiveShadow = true
      car.wheels[wheel].castShadow = true
      scene.add(car.wheels[wheel])
      car.wheels[wheel].constraint = new Physijs.DOFConstraint(
        car.wheels[wheel],
        car.body,
        new THREE.Vector3(pos.x, pos.y, pos.z)
      )
      scene.addConstraint(car.wheels[wheel].constraint)
      car.wheels[wheel].constraint.setAngularLowerLimit({x: 0, y: 0, z: 0})
      car.wheels[wheel].constraint.setAngularUpperLimit({x: 0, y: 0, z: 0})


Create the Car
--------------
Constants

    car_material = Physijs.createMaterial(
      new THREE.MeshLambertMaterial({color: 0xff6666}),
      .5, # high friction
      0 # no restitution
    )

Create it

    createCar = (scene, car, startX, startY, startZ) ->
      car.body = new Physijs.BoxMesh(
        new THREE.BoxGeometry(10, 5, 7),
        car_material,
        1000
      )
      car.body.receiveShadow = true
      car.body.castShadow = true
      car.body.position.set(startX, startY + 10, startZ)
      scene.add(car.body)

      # create the 4 wheels (front left, front right, back left, back right)
      car.wheels = {}
      positionFL = {x: startX - 3.5, y: startY + 6.5, z: startZ + 5}
      createWheel(scene, car, 'fl', positionFL)
      positionFR = {x: startX - 3.5, y: startY + 6.5, z: startZ - 5}
      createWheel(scene, car, 'fr', positionFR)
      positionBL = {x: startX + 3.5, y: startY + 6.5, z: startZ + 5}
      createWheel(scene, car, 'bl', positionBL)
      positionBR = {x: startX + 3.5, y: startY + 6.5, z: startZ - 5}
      createWheel(scene, car, 'br', positionBR)


Export
------

    module.exports = { createCar }
