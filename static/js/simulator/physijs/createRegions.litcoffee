External Dependencies
---------------------

    Physijs = require('physijs-webpack')
    THREE = require('three')


Create a Region
-----------------

    createRegion = (scene, region) ->
      # create the ground material
      ground_material = Physijs.createMaterial(
        new THREE.MeshBasicMaterial(
          color: 'rgb('+ region.color.join(',') + ')'
          side: THREE.DoubleSide
        ),
        .5, # high friction
        0 # no restitution
      )

      # create the custom geometry from a 2D shape
      shape = new THREE.Shape()
      # add each point as a vertex of the new shape
      for point, pointIndex in region.points
        if pointIndex == 0
          shape.moveTo(point[0], point[1])
        else
          shape.lineTo(point[0], point[1])

      # create 3D geometry out of 2D shape
      geometry = shape.makeGeometry()

      # create the new ground
      ground = new Physijs.ConvexMesh(
        geometry,
        ground_material,
        0 # mass
      )
      # set the position and rotation
      # note: makeGeometry creates shape on xy axis, this is putting it on xz
      [xpos, ypos] = region.position
      ground.position.set(xpos, 0, ypos)
      ground.rotation.x = Math.PI/2
      ground.receiveShadow = true
      # add the new ground to the scene
      scene.add(ground)


Create each Region
------------------

    createRegions = (scene, regions) ->
      # loop through the region array
      for region in regions
        # skip boundary for now
        if region.name == 'boundary'
          continue
        createRegion(scene, region)


Export
------

    module.exports = { createRegions }
