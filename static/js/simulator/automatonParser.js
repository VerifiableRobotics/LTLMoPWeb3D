var exports, getInitialState, getNextState, parseAutomaton;

parseAutomaton = function(parse_string, spec) {
  var automaton, currentState, getProps, getRank, getState, getSuccessors, isStateString, isSuccessorString, line, propRegEx, rankRegEx, stateRegEx, successorRegEx, _i, _len, _ref;
  stateRegEx = /\w+(?= with)/gi;
  rankRegEx = /\d+(?= ->)/gi;
  propRegEx = /\w+:\d(?=,|>)/gi;
  successorRegEx = /\w+(?=,|$)/gi;
  getState = function(str) {
    return str.match(stateRegEx)[0];
  };
  getRank = function(str) {
    return parseInt(str.match(rankRegEx)[0]);
  };
  getProps = function(str) {
    var prop, propSplit, props, _i, _len, _ref;
    props = {};
    props['sensors'] = {};
    props['actuators'] = {};
    props['customprops'] = {};
    _ref = str.match(propRegEx);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      prop = _ref[_i];
      propSplit = prop.split(":");
      if (spec.Sensors.hasOwnProperty(propSplit[0])) {
        props['sensors'][propSplit[0]] = parseInt(propSplit[1]);
      } else if (spec.Actions.hasOwnProperty(propSplit[0])) {
        props['actuators'][propSplit[0]] = parseInt(propSplit[1]);
      } else {
        props['customprops'][propSplit[0]] = parseInt(propSplit[1]);
      }
    }
    return props;
  };
  getSuccessors = function(str) {
    return str.match(successorRegEx);
  };
  isStateString = function(str) {
    if (str.search(stateRegEx) >= 0) {
      return true;
    } else {
      return false;
    }
  };
  isSuccessorString = function(str) {
    if (str.search(successorRegEx) >= 0) {
      return true;
    } else {
      return false;
    }
  };
  automaton = {};
  currentState = '';
  _ref = parse_string.trim().split("\n");
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    line = _ref[_i];
    if (isStateString(line)) {
      currentState = getState(line);
      automaton[currentState] = {
        "rank": getRank(line),
        "props": getProps(line),
        "successors": []
      };
    } else if (isSuccessorString(line)) {
      automaton[currentState]["successors"] = getSuccessors(line);
    } else {
      console.warn("Automaton Parsing: neither state nor successor string");
    }
  }
  return automaton;
};

getNextState = function(automaton, currentState, sensors) {
  var isActive, isValidSuccessorState, sensorName, successorState, _i, _len, _ref;
  if (automaton[currentState]["successors"].length < 1) {
    alert("The current state has no successors");
    return false;
  }
  _ref = automaton[currentState]["successors"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    successorState = _ref[_i];
    isValidSuccessorState = true;
    for (sensorName in sensors) {
      isActive = sensors[sensorName];
      if (!automaton[successorState]["props"]["sensors"].hasOwnProperty(sensorName)) {
        isValidSuccessorState = false;
        break;
      } else if (!automaton[successorState]["props"]["sensors"][sensorName] === isActive) {
        isValidSuccessorState = false;
        break;
      }
    }
    if (isValidSuccessorState) {
      return successorState;
    }
  }
  alert("The current state has no successor states that match those sensor readings");
  return false;
};

getInitialState = function(automaton, props) {
  var actuatorName, custompropName, isActive, isValidInitialState, isValidSuccessorState, sensorName, state, stateName, _ref, _ref1, _ref2;
  for (stateName in automaton) {
    state = automaton[stateName];
    isValidInitialState = true;
    _ref = props.sensors;
    for (sensorName in _ref) {
      isActive = _ref[sensorName];
      if (!state["props"]["sensors"].hasOwnProperty(sensorName)) {
        isValidInitialState = false;
        break;
      } else if (!state["props"]["sensors"][sensorName] === isActive) {
        isValidSuccessorState = false;
        break;
      }
    }
    if (!isValidInitialState) {
      break;
    }
    _ref1 = props.actuators;
    for (actuatorName in _ref1) {
      isActive = _ref1[actuatorName];
      if (!state["props"]["actuators"].hasOwnProperty(actuatorName)) {
        isValidInitialState = false;
        break;
      } else if (!state["props"]["actuators"][actuatorName] === isActive) {
        isValidSuccessorState = false;
        break;
      }
    }
    if (!isValidInitialState) {
      break;
    }
    _ref2 = props.custompropName;
    for (custompropName in _ref2) {
      isActive = _ref2[custompropName];
      if (!state["props"]["customprops"].hasOwnProperty(custompropName)) {
        isValidInitialState = false;
        break;
      } else if (!state["props"]["customprops"][custompropName] === isActive) {
        isValidSuccessorState = false;
        break;
      }
    }
    if (isValidInitialState) {
      return stateName;
    }
  }
  alert("The current configuration of props does not match any possible state in the automaton");
  return false;
};