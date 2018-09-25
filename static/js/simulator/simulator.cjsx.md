External Dependencies
---------------------

    React = require('react')
    ReactDOM = require('react-dom')
    { Map } = require('immutable')

Internal Dependencies
---------------------

    Helpers = require('js/core/helpers.litcoffee')
    RegionsAPI = require('js/core/regions/regionsAPI.litcoffee')
    regionInterface = require('./regionInterface.litcoffee')
    SpecAPI = require('js/core/spec/specAPI.litcoffee')
    AutAPI = require('js/core/automatonParser.litcoffee')
    Strategy = require('js/core/strategy.litcoffee')
    PoseHandler = require('./physijs/poseHandler.litcoffee')
    MotionHandler = require('./physijs/motionHandler.litcoffee')

Assets

    require('css/header.css')
    require('css/simulator.css')

Main Program
------------

Initial set up

    spec = {}
    automaton = {}
    regionFile = {}
    currentSimulator = {}
    ROSWorker = {}
    strategy = null
    executorInterval = 0 # timer ID


Simulator Component
-------------------

    Simulator = React.createClass
      displayName: 'Simulator'

Define the initial state

      getInitialState: () ->
        return {
          disableAut: true,
          disableExec: true,
          sensors: Map(),
          actuators: Map(),
          customs: Map(),
          regions: Map(),
          velocity: 8
        }

When a *.regions file is uploaded; specifically the decomposed one

      onRegionsUpload: (ev) ->
        Helpers.readFile(ev.target.files[0], 'regions')
          .then(RegionsAPI.parse)
          .then((regionsObj) =>
            regionFile = regionsObj
            PoseHandler.createRegions(regionFile)
            @addRegionButtons(regionFile.Regions))

When a *.spec file is uploaded

      onSpecUpload: (ev) ->
        Helpers.readFile(ev.target.files[0], 'spec')
          .then(SpecAPI.parse)
          .then((specObj) =>
            spec = specObj
            # enable uploading of automaton now
            @setState({disableAut: false})
            @addPropButtons(spec))

When a *.aut file is uploaded

      onAutUpload: (ev) ->
        Helpers.readFile(ev.target.files[0], 'aut')
          .then((file) => AutAPI.parse(file, spec))
          .then((autObj) =>
            automaton = autObj
            # enable executor execution now
            @setState({disableExec: false}))

When a ROS Handler is uploaded

      onROSHandlerUpload: (ev) ->
        # perform validation
        Helpers.readFile(ev.target.files[0], 'js', {keepFile: true}).then((file) =>
          # terminate any existing workers (new upload)
          ROSWorker.terminate?()
          # create new worker
          ROSWorker = new Worker(URL.createObjectURL(file))
          ROSWorker.onerror = (e) => console.log(e)
          # add sensor callback
          ROSWorker.onmessage = (e) => @getROSSensor(e.data)
        )

Toggle for when a ROS message is received

      getROSSensor: (obj) ->
        # merge the sensor dictionary with the current map
        @setState((prev) -> {sensors: prev.sensors.reduce(
          ((red, values, name) ->
            if obj[name]?
              return red.set(name, values.set('active', obj[name]))
            else
              return red
          ), prev.sensors)})

Send ROS message when actuator is toggled by executor

      sendROSActuator: (actDict) ->
        for name, value of actDict
          # call function with state of actuator
          ROSWorker.postMessage?([name, value == 1])

Launch the executor

      startExecution: () ->
        # disable buttons/uploads
        @setState({disableRegions: true, disableSpec: true, disableAut: true, disableExec: true})

        # current region is the single active one
        currentRegion = @state.regions.find((values) -> values.get('active')).get('index')
        PoseHandler.setInitialRegion(regionFile, currentRegion)

        try
          strategy = new Strategy(automaton, @getInitialProps(), currentRegion)
        catch err
          alert(err.message)
          @resetExecution()
          return

        # disable all props and start the execution loop
        @setEnabledProps(false, spec)
        executorInterval = setInterval(@executionLoop, 300)

Reset execution in case props are invalid

      resetExecution: () ->
        @setEnabledProps(true, spec) # re-enable all props
        @setState({disableExec: false})
        clearInterval(executorInterval)

A frame of the execution loop

      executionLoop: () ->
        poseData = PoseHandler.getPose()
        currentRegion = regionInterface.getRegion(regionFile, poseData[0], poseData[1])
        @setActiveRegion(currentRegion)

        try
          [nextRegion, actuators, customs] = strategy.next(@getSensors(), currentRegion)
        catch err
          alert(err.message)
          MotionHandler.stop()
          return

        @setActiveProps(actuators, customs)
        if nextRegion == null or nextRegion == currentRegion
          MotionHandler.stop()
        else
          MotionHandler.plotCourse(regionFile, nextRegion, @state.velocity, poseData)


Gets the initial props (all of sensors, actuators, and customs) for the executor to determine initial state
Outputs a {sensors, actuators, customs} dict of prop -> 1 or 0 (active or not), excluding disabled props

      getInitialProps: () ->
        sensors = actuators = customs = Map()
        @state.sensors.filter((values, name) -> !values.get('disabled')).forEach (values, name) ->
          sensors = sensors.set(name, if values.get('active') then 1 else 0)
        @state.actuators.filter((values, name) -> !values.get('disabled')).forEach (values, name) ->
          actuators = actuators.set(name, if values.get('active') then 1 else 0)
        @state.customs.forEach (values, name) ->
          customs = customs.set(name, if values.get('active') then 1 else 0)
        return {sensors: sensors.toJS(), actuators: actuators.toJS(), customs: customs.toJS()}

Gets sensor readings for the executor to determine next state
Outputs a dict of prop -> 1 or 0 (active or not), excluding disabled props

      getSensors: () ->
        sensors = {}
        @state.sensors.filter((values, name) -> !values.get('disabled')).forEach (values, name) ->
          sensors[name] = if values.get('active') then 1 else 0
        return sensors

Add Region buttons based on regions in region file

      addRegionButtons: (regions_arr) ->
        regions = Map()
        # add names to map
        for region, index in regions_arr
          regions = regions.set(region.name, Map({index: index, disabled: false, active: false}))
        # arbitrarily turn first region as active region
        regions = regions.setIn([regions_arr[0].name, 'active'], true)
        @setState({regions: regions})

Add Buttons/State based on props in spec

      addPropButtons: (spec) ->
        sensors = actuators = customs = Map()
        # add elements to maps
        for propName, isEnabled of spec.Sensors
          sensors = sensors.set(propName, Map({disabled: !isEnabled, active: false}))
        for propName, isEnabled of spec.Actions
          actuators = actuators.set(propName, Map({disabled: !isEnabled, active: false}))
        # customs is just an array, always enabled in spec
        for propName in spec.Customs
          customs = customs.set(propName, Map({disabled: false, active: false}))
        # set maps
        @setState({sensors: sensors, actuators: actuators, customs: customs})

Toggle for when a sensor is clicked

      toggleActiveSensors: (name) ->
        return () =>
          @setState((prev) -> {sensors: prev.sensors.updateIn([name, 'active'], (val) -> !val)})

Toggle for when an actuator is clicked

      toggleActiveActuators: (name) ->
        return () =>
          @setState((prev) -> {actuators: prev.actuators.updateIn([name, 'active'], (val) -> !val)})

Toggle for when an actuator is clicked

      toggleActiveCustoms: (name) ->
        return () =>
          @setState((prev) -> {customs: prev.customs.updateIn([name, 'active'], (val) -> !val)})

Toggle the enabled state of all actuators, customs, and regions (unless it were disabled in spec to begin with)

      setEnabledProps: (enabled, spec) ->
        # do not set to true if it were disabled in spec
        actuators = @state.actuators.map((values, name) -> values.set('disabled', !enabled || spec.Actions[name] == 1))
        customs = @state.customs.map((values) -> values.set('disabled', !enabled))
        regions = @state.regions.map((values) -> values.set('disabled', !enabled))
        @setState({actuators: actuators, customs: customs, regions: regions})

Set which region is active

      setActiveRegion: (regionNum) ->
        # set all to false, find the one with the correct index, set it to true
        @setState({regions: @state.regions.map((values) -> values.set('active', false))
          .setIn([@state.regions.findKey((values) -> values.get('index') == regionNum), 'active'], true)})

Set which actuators and customs are active based on [0, 1] dict from executor

      setActiveProps: (actDict, custDict) ->
        @sendROSActuator(actDict)
        actuators = @state.actuators.map((values, name) -> values.set('active', actDict[name] == 1))
        customs = @state.customs.map((values, name) -> values.set('active', custDict[name] == 1))
        @setState({actuators: actuators, customs: customs})

Set the velocity of the car

      setVelocity: (ev) ->
        @setState({velocity: parseInt(ev.target.value)})

Increase Velocity

      increaseVelocity: () ->
        @setState((prev) -> {velocity: prev.velocity + 2})

Decrease Velocity

      decreaseVelocity: () ->
        decremented = @state.velocity - 2
        @setState({velocity: if decremented <= 0 then 1 else decremented})

Optimize component speed because we have immutability!

      shouldComponentUpdate: (nextProps, nextState) ->
        isEqual = true
        for k, v of nextState
          if v != @state[k]
            isEqual = false
            break
        return !isEqual

Define the simulator's layout

      render: () ->
        hasInput = @state.actuators.size > 0 and @state.sensors.size > 0
        <div>
          <div className='center_wrapper'>
            <button type='button' onClick={@startExecution} disabled={@state.disableExec}>Start</button>
          </div>

          <div className='center_wrapper'>
            <form className='upload_form'>
              <input name='file' type='file' className='upload_file_overlay' accept='.regions'
                onChange={@onRegionsUpload} disabled={@state.disableRegions} />
              <button type='button' disabled={@state.disableRegions}>Upload Regions</button>
            </form>
            <form className='upload_form'>
              <input name='file' type='file' className='upload_file_overlay' accept='.spec'
                onChange={@onSpecUpload} disabled={@state.disableSpec}/>
              <button type='button' disabled={@state.disableSpec}>Upload Spec</button>
            </form>
            <form className='upload_form'>
              <input name='file' type='file' className='upload_file_overlay' accept='.aut'
                onChange={@onAutUpload} disabled={@state.disableAut} />
              <button type='button' disabled={@state.disableAut}>Upload Automaton</button>
            </form>
          </div>

          <div id='simulator_wrapper'>
            <div className='right_wrapper'>
              <input name='file' type='file' className='upload_file_overlay' accept='.js'
                onChange={@onROSHandlerUpload} disabled={not hasInput} value='' />
              <button type='button' disabled={not hasInput}>Upload Custom ROS Handler</button>

              <div>Sensors</div>
              <ul className='simulator_lists'>
                {@state.sensors.map((values, name) =>
                  <li key={name}>
                    <button type='button' className={if values.get('active') then 'prop_button_green' else 'prop_button'}
                      onClick={@toggleActiveSensors(name)} disabled={values.get('disabled')}>{name}</button>
                  </li>)}
              </ul>

              <div>Actuators</div>
              <ul className='simulator_lists'>
                {@state.actuators.map((values, name) =>
                  <li key={name}>
                    <button type='button' className={if values.get('active') then 'prop_button_green' else 'prop_button'}
                      onClick={@toggleActiveActuators(name)} disabled={values.get('disabled')}>{name}</button>
                  </li>)}
              </ul>

              <div>Custom Propositions</div>
              <ul className='simulator_lists'>
                {@state.customs.map((values, name) =>
                  <li key={name}>
                    <button type='button' className={if values.get('active') then 'prop_button_green' else 'prop_button'}
                      onClick={@toggleActiveCustoms(name)} disabled={values.get('disabled')}>{name}</button>
                  </li>)}
              </ul>

              <div>Regions</div>
              <ul className='simulator_lists'>
                {@state.regions.map((values, name) =>
                  <li key={name}>
                    <button type='button' className={if values.get('active') then 'prop_button_green' else 'prop_button'}
                      onClick={() => @setActiveRegion(values.get('index'))}
                      disabled={values.get('disabled')}>{name}</button>
                  </li>)}
              </ul>

              <div>Maximum Velocity</div>
              <input type='text' value={@state.velocity} onChange={@setVelocity} /> <br />
              <button type='button' onClick={@increaseVelocity}>Increase</button>
              <button type='button' onClick={@decreaseVelocity}>Decrease</button>
            </div>
          </div>
        </div>


And render!

    currentSimulator = ReactDOM.render(<Simulator />, document.getElementById('simulator_body'))
