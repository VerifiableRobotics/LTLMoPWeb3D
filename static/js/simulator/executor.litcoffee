## Helper functions for searching inside automaton


Finds a next state
  
  getNextState = (automaton, currentState, sensors) ->
    if automaton[currentState]["successors"].length < 1
      alert "The current state has no successors"
      return false
    for successorState in automaton[currentState]["successors"]
      isValidSuccessorState = true
      # check sensors
      for sensorName, isActive of sensors
        if not automaton[successorState]["props"]["sensors"].hasOwnProperty sensorName
          isValidSuccessorState = false
          break
        else if not automaton[successorState]["props"]["sensors"][sensorName] == isActive
          isValidSuccessorState = false
          break
      # end for
      if isValidSuccessorState
        return successorState
    # end for
    alert "None of the current state's successors can be reached with those sensor readings"
    return false

Finds an initial state

  getInitialState = (automaton, props) ->
    for stateName, state of automaton
      isValidInitialState = true
      # check sensors
      for sensorName, isActive of props.sensors
        if not state["props"]["sensors"].hasOwnProperty sensorName
          isValidInitialState = false
          break
        else if not state["props"]["sensors"][sensorName] == isActive
          isValidSuccessorState = false
          break
      # end for
      if not isValidInitialState
        continue
      # check actuators
      for actuatorName, isActive of props.actuators
        if not state["props"]["actuators"].hasOwnProperty actuatorName
          isValidInitialState = false
          break
        else if not state["props"]["actuators"][actuatorName] == isActive
          isValidSuccessorState = false
          break
      # end for
      if not isValidInitialState
        continue
      # check customprops
      for custompropName, isActive of props.customprops
        if not state["props"]["customprops"].hasOwnProperty custompropName
          isValidInitialState = false
          break
        else if not state["props"]["customprops"][custompropName] == isActive
          isValidSuccessorState = false
          break
      # end for
      if isValidInitialState
        return stateName
    # end for
    alert "The current configuration of props does not match any possible state in the automaton"
    return false


## Executor function

  execute = (automaton, initialProps) ->
    
    # run the execution loop!
    currentState = getInitialState(automaton, initialProps)
    currentRegion = automaton[currentState]["props"]["region"]
    createCar(currentRegion) # create car in the centroid of the initial region
    nextState = getNextState(automaton, currentState, getSensors())
    callback = () ->
      console.log("current state: " + currentState)
      currentRegion = getCurrentRegion()
      console.log("current region: " + currentRegion)
      if currentState != false
        prevNextState = nextState
        nextState = getNextState(automaton, currentState, getSensors())
        console.log("next state: " + nextState)
        # if there is a next state, go to it
        if nextState != false
          # constantly plot a path to the nextState  
          plotCourse(automaton[nextState]["props"]["region"])
          # currentState should only be set to nextState when region has been reached
          if currentRegion == automaton[nextState]["props"]["region"]
            currentState = nextState
        # otherwise stop
        else
          stopVelocityTheta()
      else
        clearInterval(executeInterval)
    # get next state every 3 seconds
    executeInterval = setInterval(callback, 300)

    return false


  exports = {
    execute: execute
  }