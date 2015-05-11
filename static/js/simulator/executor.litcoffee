Helper functions for searching inside automaton
-----------------------------------------------

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
          else if automaton[successorState]["props"]["sensors"][sensorName] != isActive
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
          else if state["props"]["sensors"][sensorName] != isActive
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
          else if state["props"]["actuators"][actuatorName] != isActive
            isValidSuccessorState = false
            break
        # end for
        if not isValidInitialState
          continue
        # check customs
        for customName, isActive of props.customs
          if not state["props"]["customs"].hasOwnProperty customName
            isValidInitialState = false
            break
          else if state["props"]["customs"][customName] != isActive
            isValidSuccessorState = false
            break
        # end for
        if isValidInitialState
          return stateName
      # end for
      alert "The current configuration of props does not match any possible state in the automaton"
      return false


Execute an automaton
--------------------

    # store the current and next states
    currentState = null
    nextState = null

    # to be executed continuosly
    execute = (automaton, initialProps, sensorReadings, currentRegion) ->
      
      # if first execution
      if currentState == null
        currentState = getInitialState(automaton, initialProps)
        nextState = getNextState(automaton, currentState, sensorReadings)
        # return initial region
        return automaton[currentState]["props"]["region"]
      else
        console.log("current state: " + currentState)
        console.log("current region: " + currentRegion)
        # if there is a current state
        if currentState != false
          prevNextState = nextState
          nextState = getNextState(automaton, currentState, sensorReadings)
          console.log("next state: " + nextState)
          # if there is a next state, go to it
          if nextState != false
            # currentState should only be set to nextState when region has been reached
            if currentRegion == automaton[nextState]["props"]["region"]
              currentState = nextState
            # return next region to go to  
            return automaton[nextState]["props"]["region"]
          # otherwise stop and return null
          else
            return null
        # if there is no current state, stop the execution loop and return false
        else
          return false


Export
------

    module.exports = {
      execute: execute
    }