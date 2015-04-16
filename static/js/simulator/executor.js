var execute, getInitialState, getNextState;

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
  alert("None of the current state's successors can be reached with those sensor readings");
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
      continue;
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
      continue;
    }
    _ref2 = props.customprops;
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

execute = function(automaton, initialProps) {
  var callback, currentRegion, currentState, executeInterval, nextState;
  currentState = getInitialState(automaton, initialProps);
  currentRegion = automaton[currentState]["props"]["region"];
  createCar(currentRegion);
  nextState = getNextState(automaton, currentState, getSensors());
  callback = function() {
    var prevNextState;
    console.log("current state: " + currentState);
    currentRegion = getCurrentRegion();
    console.log("current region: " + currentRegion);
    if (currentState !== false) {
      prevNextState = nextState;
      nextState = getNextState(automaton, currentState, getSensors());
      console.log("next state: " + nextState);
      if (nextState !== false) {
        plotCourse(automaton[nextState]["props"]["region"]);
        if (currentRegion === automaton[nextState]["props"]["region"]) {
          return currentState = nextState;
        }
      } else {
        return stopVelocityTheta();
      }
    } else {
      return clearInterval(executeInterval);
    }
  };
  executeInterval = setInterval(callback, 300);
  return false;
};