This was originally borrowed from a physijs example.
Plenty of refactoring and changes have been made over time but some things are still similar.

External Dependencies
---------------------

    Physijs = require('physijs-webpack')
    THREE = require('three')
    TrackballControls = require('three-trackballcontrols')
    WindowResize = require('three-window-resize')


Internal Dependencies
---------------------

    { createCar } = require('./createCar.litcoffee')
    { createRegions } = require('./createRegions.litcoffee')


Main Program
------------

Initial set up

    controls = undefined
    renderer = undefined
    scene = undefined
    camera = undefined
    car = {}

Initialize the scene

    initScene = () ->
      # create the renderer
      renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
      viewportElem = document.getElementById('viewport')
      console.log(viewportElem.clientWidth)
      console.log(viewportElem.clientHeight)
      renderer.setSize(viewportElem.clientWidth, viewportElem.clientHeight)
      renderer.shadowMap.enabled = true
      renderer.shadowMapSoft = true
      viewportElem.appendChild(renderer.domElement)

      # create the scene and add gravity
      scene = new Physijs.Scene()
      scene.setGravity(new THREE.Vector3(0, -30, 0))
      # add the listener to drop the car down upon update
      scene.addEventListener('update', () -> scene.simulate(undefined, 2))

      # create the camera
      camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        10000
      )
      camera.position.set(60, 50, 60)
      camera.lookAt(scene.position)
      scene.add(camera)

      # add trackball controls
      controls = new TrackballControls(camera)
      controls.rotateSpeed = 1.0
      controls.zoomSpeed = 1.2
      controls.panSpeed = 1.2
      controls.noZoom = false
      controls.noPan = false
      controls.staticMoving = true
      controls.dynamicDampingFactor = 0.3
      controls.addEventListener('change', render)

      # create the lighting
      light = new THREE.DirectionalLight(0xFFFFFF)
      light.position.set(20, 40, -15)
      light.target.position.copy(scene.position)
      light.castShadow = true
      light.shadowCameraLeft = -60
      light.shadowCameraTop = -60
      light.shadowCameraRight = 60
      light.shadowCameraBottom = 60
      light.shadowCameraNear = 20
      light.shadowCameraFar = 200
      light.shadowBias = -.0001
      light.shadowMapWidth = light.shadowMapHeight = 2048
      light.shadowDarkness = .7
      scene.add(light)

      # add window resizer
      WindowResize(renderer, camera, () ->
        {width: viewportElem.clientWidth, height: viewportElem.clientHeight}
      )

      # start the simulation loop
      scene.simulate()
      animate()

Re-render the scene at the camera's position.
Called by the animation loop and by the trackball listener

    render = () ->
      renderer.render(scene, camera)

Recursively animate / re-render the scene on each frame

    animate = () ->
      requestAnimationFrame(animate)
      controls.update()
      render()

Set the scene to initialize as soon as the window is loaded

    window.onload = () ->
      initScene()

Create the Car and set the camera to point toward it

    createCarWrapper = (startX, startY, startZ) ->
      createCar(scene, car, startX, startY, startZ)
      # set camera position to point toward car
      controls.target.set(startX, startY, startZ)
      camera.position.set(startX + 60, startY + 50, startZ + 60)

Create the Regions and set the camera to point toward the first one

    createRegionsWrapper = (regions) ->
      createRegions(scene, regions)
      # set camera position to point toward the first region (arbitrarily)
      # the camera will move again once the car is created, but added it here
      # just to give the user a sense of progress and what is to come when all
      # the uploads are finished and the execution loop starts
      startX = regions[0].position[0]
      startY = 0
      startZ = regions[0].position[1]
      controls.target.set(startX, startY, startZ)
      camera.position.set(startX + 360, startY + 300, startZ + 360)


Exports
-------

    module.exports = {
      createRegions: createRegionsWrapper,
      getCar: () -> car,
      createCar: createCarWrapper
    }
