Helper functions for searching inside automaton
-----------------------------------------------

Finds a next state

    getNextState = (automaton, currentState, sensors) ->
      if automaton[currentState]['successors'].length < 1
        throw new Error 'The current state has no successors'
      for successorState in automaton[currentState]['successors']
        isValidSuccessorState = true
        # check sensors
        for sensorName, isActive of sensors
          if not automaton[successorState]['props']['sensors'].hasOwnProperty sensorName
            isValidSuccessorState = false
            break
          else if automaton[successorState]['props']['sensors'][sensorName] != isActive
            isValidSuccessorState = false
            break
        # end for
        if isValidSuccessorState
          return successorState
      # end for
      throw new Error 'None of the current state\'s successors can be reached with those sensor readings'

Finds an initial state given the automaton, initial props, and initial region num

    getInitialState = (automaton, props, regionNum) ->
      for stateName, state of automaton
        # check region - if initial region does not match state, cotinue
        if state['props']['region'] != regionNum
          continue
        # otherwise check all props with flag
        isValidInitialState = true
        # check sensors - all sensors and whether or not they are active must match state
        for sensorName, isActive of props.sensors
          if not state['props']['sensors'].hasOwnProperty sensorName
            isValidInitialState = false
            break
          else if state['props']['sensors'][sensorName] != isActive
            isValidSuccessorState = false
            break
        # continue if invalid
        if not isValidInitialState
          continue
        # check actuators - all actuators and whether or not they are active must match state
        for actuatorName, isActive of props.actuators
          if not state['props']['actuators'].hasOwnProperty actuatorName
            isValidInitialState = false
            break
          else if state['props']['actuators'][actuatorName] != isActive
            isValidSuccessorState = false
            break
        # continue if invalid
        if not isValidInitialState
          continue
        # check customs - all customs and whether or not they are active must match state
        for customName, isActive of props.customs
          if not state['props']['customs'].hasOwnProperty customName
            isValidInitialState = false
            break
          else if state['props']['customs'][customName] != isActive
            isValidSuccessorState = false
            break
        # return if valid
        if isValidInitialState
          return stateName
      # end for
      throw new Error 'The current configuration of props does not match any possible state in the automaton'


Traverse an automaton
---------------------

    class Strategy
      automaton: null
      currentState: null
      nextState: null

      _nextRegion: () =>
        return @automaton[@nextState]['props']['region']

      _actuators: () =>
        return @automaton[@currentState]['props']['actuators']

      _customs: () =>
        return @automaton[@currentState]['props']['customs']

      constructor: (automaton, initialProps, currentRegion) ->
        @automaton = automaton
        @currentState = getInitialState(@automaton, initialProps, currentRegion)

      # to be called continuously by Executor
      next: (sensorReadings, currentRegion) =>
        @nextState = getNextState(@automaton, @currentState, sensorReadings)

        # currentState should only be set to nextState when region has been reached
        if currentRegion == @_nextRegion()
          @currentState = @nextState

        return [@_nextRegion(), @_actuators(), @_customs()]


Export
------

    module.exports = Strategy
