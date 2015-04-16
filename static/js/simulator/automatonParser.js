var getProps, getRank, getState, getSuccessors, isStateString, isSuccessorString, parseAutomaton, propRegEx, rankRegEx, stateRegEx, successorRegEx;

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
  var bit, index, prop, propSplit, props, regionInt, _i, _j, _len, _len1, _ref, _ref1;
  props = {};
  props['sensors'] = {};
  props['actuators'] = {};
  props['customprops'] = {};
  props['region'] = "";
  _ref = str.match(propRegEx);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    prop = _ref[_i];
    propSplit = prop.split(":");
    if (spec.Sensors.hasOwnProperty(propSplit[0])) {
      props['sensors'][propSplit[0]] = parseInt(propSplit[1]);
    } else if (spec.Actions.hasOwnProperty(propSplit[0])) {
      props['actuators'][propSplit[0]] = parseInt(propSplit[1]);
    } else if (spec.Customs.hasOwnProperty(propSplit[0])) {
      props['customprops'][propSplit[0]] = parseInt(propSplit[1]);
    } else {
      props['region'] += propSplit[1];
    }
  }
  regionInt = 0;
  _ref1 = props["region"];
  for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
    bit = _ref1[index];
    regionInt += parseInt(bit) * Math.pow(2, props["region"].length - index - 1);
  }
  props["region"] = regionInt;
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

parseAutomaton = function(parse_string, spec) {
  var automaton, currentState, line, _i, _len, _ref;
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