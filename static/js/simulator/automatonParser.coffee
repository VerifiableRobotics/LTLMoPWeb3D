parseAutomaton = (parse_string, spec) -> 
  # Sample string:
  # State 0 with rank 0 -> <person:0, hazardous_item:0, pick_up:0, drop:0, radio:0, carrying_item:0, bit0:0, bit1:0, bit2:0>
  # With successors : 1


  # regex declarations
  stateRegEx = /\w+(?= with)/gi # matches state name
  rankRegEx = /\d+(?= ->)/gi # matches rank number
  propRegEx = /\w+:\d(?=,|>)/gi # matches props
  successorRegEx = /\w+(?=,|$)/gi # matches successor states

  # helper functions to create automaton object
  getState = (str) ->
    str.match(stateRegEx)[0]
  getRank = (str) ->
    parseInt(str.match(rankRegEx)[0])
  getProps = (str) ->
    props = {}
    props['sensors'] = {}
    props['actuators'] = {}
    props['customprops'] = {}
    for prop in str.match(propRegEx)
      propSplit = prop.split(":")
      if spec.Sensors.hasOwnProperty propSplit[0]
        props['sensors'][propSplit[0]] = parseInt(propSplit[1])
      else if spec.Actions.hasOwnProperty propSplit[0]
        props['actuators'][propSplit[0]] = parseInt(propSplit[1])
      else
        props['customprops'][propSplit[0]] = parseInt(propSplit[1])
    # end for
    props
  getSuccessors = (str) ->
    str.match(successorRegEx)
  isStateString = (str) ->
    if str.search(stateRegEx) >= 0 then true else false
  isSuccessorString = (str) ->
    if str.search(successorRegEx) >= 0 then true else false


  automaton = {}
  # loop through lines
  currentState = ''
  for line in parse_string.trim().split "\n"
    if isStateString(line)
      currentState = getState(line)
      automaton[currentState] = "rank": getRank(line), "props": getProps(line), "successors": []
    else if isSuccessorString(line)
      automaton[currentState]["successors"] = getSuccessors(line)
    else
      console.warn("Automaton Parsing: neither state nor successor string")
    # end else
  # end for

  automaton
# end parseAutomaton

#################################################
# helper functions for searching inside automaton

# finds a next state
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
  alert "The current state has no successor states that match those sensor readings"
  return false

# finds an initial state
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
      break
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
      break
    # check customprops
    for custompropName, isActive of props.custompropName
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

############################################


exports = {
  parseAutomaton: parseAutomaton
  getNextState: getNextState
  getInitialState: getInitialState
}