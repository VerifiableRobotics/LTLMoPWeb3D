(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

getProps = function(str, spec) {
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
    } else if (spec.Customs.indexOf(propSplit[0]) !== -1) {
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
        "props": getProps(line, spec),
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

module.exports = {
  parseAutomaton: parseAutomaton
};



},{}],2:[function(require,module,exports){
var currentState, execute, getInitialState, getNextState, nextState;

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

currentState = null;

nextState = null;

execute = function(automaton, initialProps, sensorReadings, currentRegion) {
  var prevNextState;
  if (currentState === null) {
    currentState = getInitialState(automaton, initialProps);
    nextState = getNextState(automaton, currentState, sensorReadings);
    return automaton[currentState]["props"]["region"];
  } else {
    console.log("current state: " + currentState);
    console.log("current region: " + currentRegion);
    if (currentState !== false) {
      prevNextState = nextState;
      nextState = getNextState(automaton, currentState, sensorReadings);
      console.log("next state: " + nextState);
      if (nextState !== false) {
        if (currentRegion === automaton[nextState]["props"]["region"]) {
          currentState = nextState;
        }
        return automaton[nextState]["props"]["region"];
      } else {
        return null;
      }
    } else {
      return false;
    }
  }
};

module.exports = {
  execute: execute
};



},{}],3:[function(require,module,exports){
var getCalibrationPoint, getObstacle, getRegionsOption, getTransition, parseRegions;

getRegionsOption = function(str) {
  return str.split(':')[0];
};

getCalibrationPoint = function(str) {
  var calibrationPoint, calibrationPointSplit;
  calibrationPoint = {};
  calibrationPointSplit = str.split('\t');
  calibrationPoint[calibrationPointSplit[0]] = calibrationPointSplit[1].trim();
  return calibrationPoint;
};

getObstacle = function(str) {
  var obstacle;
  obstacle = {};
  obstacle[str] = true;
  return obstacle;
};

getTransition = function(str) {
  var i, pointNum, region1, region2, transition, transitionPiece, transitionSplit, _i, _len;
  transition = {};
  transitionSplit = str.split('\t');
  pointNum = 0;
  region1 = '';
  region2 = '';
  for (i = _i = 0, _len = transitionSplit.length; _i < _len; i = ++_i) {
    transitionPiece = transitionSplit[i];
    switch (i) {
      case 0:
        region1 = transitionPiece.trim();
        if (transition[region1] == null) {
          transition[region1] = {};
        }
        break;
      case 1:
        region2 = transitionPiece.trim();
        transition[region1][region2] = [];
        break;
      default:
        switch (i % 2) {
          case 0:
            transition[region1][region2].push([]);
            transition[region1][region2][pointNum].push(parseInt(transitionPiece));
            break;
          case 1:
            transition[region1][region2][pointNum].push(parseInt(transitionPiece));
            pointNum++;
        }
    }
  }
  return transition;
};

parseRegions = function(parse_string) {
  var currentOption, line, regions, _i, _len, _ref;
  regions = {};
  currentOption = '';
  _ref = parse_string.trim().split("\n");
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    line = _ref[_i];
    line = line.trim();
    if (line.length < 1 && currentOption !== 'Spec') {
      currentOption = '';
      continue;
    }
    switch (currentOption) {
      case '':
        currentOption = getRegionsOption(line);
        break;
      case 'Background':
        if (regions.Background == null) {
          regions.Background = "";
        }
        regions.Background += line;
        break;
      case 'CalibrationPoints':
        if (regions.CalibrationPoints == null) {
          regions.CalibrationPoints = [];
        }
        regions.CalibrationPoints.push(getCalibrationPoint(line));
        break;
      case 'Obstacles':
        if (regions.Obstacles == null) {
          regions.Obstacles = {};
        }
        $.extend(regions.Obstacles, getObstacle(line));
        break;
      case 'Regions':
        if (regions.Regions == null) {
          regions.Regions = "";
        }
        regions.Regions += line;
        break;
      case 'Transitions':
        if (regions.Transitions == null) {
          regions.Transitions = [];
        }
        regions.Transitions.push(getTransition(line));
        break;
      default:
        console.warn("Regions Parsing: unrecognized regions option");
    }
  }
  regions.Regions = JSON.parse(regions.Regions);
  return regions;
};

module.exports = {
  parseRegions: parseRegions
};



},{}],4:[function(require,module,exports){
var $actuator_list, $customprop_list, $sensor_list, AutomatonParser, Executor, RegionsParser, SpecParser, addPropButtons, automaton, createCar, currentTheta, currentVelocity, getCentroid, getCurrentRegion, getInitialProps, getSensors, plotCourse, regions, setVelocityTheta, spec, stopVelocityTheta;

RegionsParser = require('./regionsParser.litcoffee');

SpecParser = require('./specParser.litcoffee');

AutomatonParser = require('./automatonParser.litcoffee');

Executor = require('./executor.litcoffee');

spec = {};

automaton = {};

regions = {};

$sensor_list = [];

$actuator_list = [];

$customprop_list = [];

$(document).ready(function() {
  var $automaton_upload_button, $automaton_upload_file, $executor_start_button, $regions_upload_button, $regions_upload_file, $spec_upload_button, $spec_upload_file, create3DRegions;
  $spec_upload_file = $('#spec_upload_file');
  $spec_upload_button = $('#spec_upload_button');
  $automaton_upload_file = $('#automaton_upload_file');
  $automaton_upload_button = $('#automaton_upload_button');
  $regions_upload_file = $('#regions_upload_file');
  $regions_upload_button = $('#regions_upload_button');
  $executor_start_button = $('#executor_start_button');
  $sensor_list = $('#sensor_list');
  $actuator_list = $('#actuator_list');
  $customprop_list = $('#customprop_list');
  create3DRegions = function(regions_arr) {
    var blue, green, height, holes, name, new_geometry, new_ground, new_ground_material, new_shape, point, pointIndex, red, region, width, xpos, ypos, _i, _j, _len, _len1, _ref, _results;
    _results = [];
    for (_i = 0, _len = regions_arr.length; _i < _len; _i++) {
      region = regions_arr[_i];
      name = region.name;
      if (name === 'boundary') {
        continue;
      }
      red = region.color[0];
      green = region.color[1];
      blue = region.color[2];
      xpos = region.position[0];
      ypos = region.position[1];
      width = region.size[0];
      height = region.size[1];
      holes = region.holeList;
      new_ground_material = Physijs.createMaterial(new THREE.MeshBasicMaterial({
        color: "rgb(" + red + "," + green + "," + blue + ")",
        side: THREE.DoubleSide
      }), .5, 0);
      new_shape = new THREE.Shape();
      _ref = region.points;
      for (pointIndex = _j = 0, _len1 = _ref.length; _j < _len1; pointIndex = ++_j) {
        point = _ref[pointIndex];
        if (pointIndex === 0) {
          new_shape.moveTo(point[0], point[1]);
        } else {
          new_shape.lineTo(point[0], point[1]);
        }
      }
      new_geometry = new_shape.makeGeometry();
      new_ground = new Physijs.ConvexMesh(new_geometry, new_ground_material, 0);
      new_ground.position.set(xpos, 0, ypos);
      new_ground.rotation.x = Math.PI / 2;
      new_ground.receiveShadow = true;
      _results.push(scene.add(new_ground));
    }
    return _results;
  };
  $spec_upload_file.change(function() {
    var extension, file, nameSplit, reader;
    file = this.files[0];
    if (file != null) {
      nameSplit = file.name.split('.');
      extension = nameSplit[nameSplit.length - 1];
      if (extension !== "spec") {
        return alert("This only accepts *.spec files!");
      } else {
        reader = new FileReader();
        reader.onload = function(ev) {
          spec = SpecParser.parseSpec(ev.target.result);
          console.log("Spec Object: ");
          console.log(spec);
          $automaton_upload_file.prop('disabled', false);
          $automaton_upload_button.prop('disabled', false);
          return addPropButtons(spec);
        };
        return reader.readAsText(file);
      }
    }
  });
  $automaton_upload_file.change(function() {
    var extension, file, nameSplit, reader;
    file = this.files[0];
    if (file != null) {
      nameSplit = file.name.split('.');
      extension = nameSplit[nameSplit.length - 1];
      if (extension !== "aut") {
        return alert("This only accepts *.aut files!");
      } else {
        reader = new FileReader();
        reader.onload = function(ev) {
          automaton = AutomatonParser.parseAutomaton(ev.target.result, spec);
          console.log("Automaton Object: ");
          console.log(automaton);
          return $executor_start_button.prop('disabled', false);
        };
        return reader.readAsText(file);
      }
    }
  });
  $regions_upload_file.change(function() {
    var extension, file, nameSplit, reader;
    file = this.files[0];
    nameSplit = file.name.split('.');
    extension = nameSplit[nameSplit.length - 1];
    if (extension !== "regions") {
      return alert("This only accepts *.regions files!");
    } else {
      reader = new FileReader();
      reader.onload = function(ev) {
        regions = RegionsParser.parseRegions(ev.target.result);
        console.log("Regions Object: ");
        console.log(regions);
        return create3DRegions(regions.Regions);
      };
      return reader.readAsText(file);
    }
  });
  return $executor_start_button.click(function() {
    var counter, executionLoop, executorInterval;
    counter = 0;
    executorInterval = 0;
    executionLoop = function() {
      var initialRegion, nextRegion;
      if (counter === 0) {
        initialRegion = Executor.execute(automaton, getInitialProps(), null, null);
        createCar(initialRegion);
        return counter = 1;
      } else {
        nextRegion = Executor.execute(automaton, null, getSensors(), getCurrentRegion());
        if (nextRegion !== null) {
          return plotCourse(nextRegion);
        } else if (nextRegion !== false) {
          return stopVelocityTheta();
        } else {
          return clearInterval(executorInterval);
        }
      }
    };
    executorInterval = setInterval(executionLoop, 300);
    $executor_start_button.prop('disabled', true);
    $automaton_upload_file.prop('disabled', true);
    $automaton_upload_button.prop('disabled', true);
    $spec_upload_file.prop('disabled', true);
    return $spec_upload_button.prop('disabled', true);
  });
});

currentVelocity = 0;

currentTheta = 0;

setVelocityTheta = function(velocity, theta) {
  console.log("car position x:" + car.body.position.x);
  console.log("car position y:" + car.body.position.z);
  car.wheel_bl_constraint.configureAngularMotor(2, velocity, 0, velocity, 200000);
  car.wheel_br_constraint.configureAngularMotor(2, velocity, 0, velocity, 200000);
  car.wheel_fl_constraint.configureAngularMotor(2, velocity, 0, velocity, 200000);
  car.wheel_fr_constraint.configureAngularMotor(2, velocity, 0, velocity, 200000);
  car.wheel_bl_constraint.enableAngularMotor(2);
  car.wheel_br_constraint.enableAngularMotor(2);
  car.wheel_fl_constraint.enableAngularMotor(2);
  car.wheel_fr_constraint.enableAngularMotor(2);
  car.wheel_fl_constraint.configureAngularMotor(1, theta, 0, theta, 200);
  car.wheel_fr_constraint.configureAngularMotor(1, theta, 0, theta, 200);
  car.wheel_fl_constraint.enableAngularMotor(1);
  car.wheel_fr_constraint.enableAngularMotor(1);
  currentVelocity = velocity;
  currentTheta = theta;
  console.log("velocity: " + velocity);
  console.log("car theta: " + car.body.quaternion._euler.y);
  return console.log("wheel theta: " + theta);
};

stopVelocityTheta = function() {
  car.wheel_bl_constraint.configureAngularMotor(2, currentVelocity, -currentVelocity, -currentVelocity, 200000);
  car.wheel_br_constraint.configureAngularMotor(2, currentVelocity, -currentVelocity, -currentVelocity, 200000);
  car.wheel_fl_constraint.configureAngularMotor(2, currentVelocity, -currentVelocity, -currentVelocity, 200000);
  car.wheel_fr_constraint.configureAngularMotor(2, currentVelocity, -currentVelocity, -currentVelocity, 200000);
  car.wheel_bl_constraint.disableAngularMotor(2);
  car.wheel_br_constraint.disableAngularMotor(2);
  car.wheel_fl_constraint.disableAngularMotor(2);
  car.wheel_fr_constraint.disableAngularMotor(2);
  car.wheel_fl_constraint.configureAngularMotor(1, currentTheta, -currentTheta, -currentTheta, 200);
  car.wheel_fr_constraint.configureAngularMotor(1, currentTheta, -currentTheta, -currentTheta, 200);
  car.wheel_fl_constraint.disableAngularMotor(1);
  return car.wheel_fr_constraint.disableAngularMotor(1);
};

getCentroid = function(region) {
  var numPoints, point, position, regionX, regionY, _i, _len, _ref;
  regionX = 0;
  regionY = 0;
  numPoints = region.points.length;
  position = region.position;
  _ref = region.points;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    point = _ref[_i];
    regionX += point[0];
    regionY += point[1];
  }
  return [position[0] + regionX / numPoints, position[1] + regionY / numPoints];
};

createCar = function(region_num) {
  var centroid, region, xpos, ypos;
  region = regions.Regions[region_num];
  xpos = region.position[0];
  ypos = region.position[1];
  centroid = getCentroid(region);
  return create3DCar(centroid[0], 0, centroid[1]);
};

plotCourse = function(region_num) {
  var currentPosition, target, targetPosition, targetTheta;
  target = regions.Regions[region_num];
  targetPosition = getCentroid(target);
  currentPosition = [car.body.position.x, car.body.position.z];
  targetTheta = Math.atan2(targetPosition[1] - currentPosition[1], targetPosition[0] - currentPosition[0]);
  console.log("target theta: " + targetTheta);
  return setVelocityTheta(2, car.body.quaternion._euler.y + targetTheta);
};

getCurrentRegion = function() {
  var bottom, i, index, j, left, point, points, pos, region, result, right, top, xpos, ypos, _i, _j, _len, _len1, _ref;
  xpos = car.body.position.x;
  ypos = car.body.position.z;
  _ref = regions.Regions;
  for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
    region = _ref[index];
    left = region.position[0];
    right = region.position[0] + region.size[0];
    bottom = region.position[1];
    top = region.position[1] + region.size[1];
    if (xpos >= left && xpos <= right && ypos >= bottom && ypos <= top) {
      points = region.points;
      pos = region.position;
      j = points.length - 1;
      result = false;
      for (i = _j = 0, _len1 = points.length; _j < _len1; i = ++_j) {
        point = points[i];
        if ((points[i][1] + pos[1] > ypos) !== (points[j][1] + pos[1] > ypos) && (xpos < (points[j][0] - points[i][0]) * (ypos - points[i][1] + pos[1]) / (points[j][1] - points[i][1]) + points[i][0] + pos[0])) {
          result = !result;
        }
        j = i;
      }
      if (result) {
        return index;
      }
    }
  }
  return null;
};

addPropButtons = function(spec) {
  var actuatorName, custompropName, disabledText, isActive, sensorName, _i, _len, _ref, _ref1, _ref2;
  $sensor_list.empty();
  $actuator_list.empty();
  $customprop_list.empty();
  _ref = spec.Sensors;
  for (sensorName in _ref) {
    isActive = _ref[sensorName];
    disabledText = isActive ? "" : "disabled";
    $sensor_list.append("<li><button " + disabledText + " type=\"button\" class=\"sensor_button\">" + sensorName + "</button></li>");
  }
  _ref1 = spec.Actions;
  for (actuatorName in _ref1) {
    isActive = _ref1[actuatorName];
    disabledText = isActive ? "" : "disabled";
    $actuator_list.append("<li><button " + disabledText + " type=\"button\" class=\"actuator_button\">" + actuatorName + "</button></li>");
  }
  _ref2 = spec.Customs;
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    custompropName = _ref2[_i];
    $customprop_list.append("<li><button type=\"button\" class=\"customprop_button\">" + custompropName + "</button></li>");
  }
  $(".sensor_button").click(function(evt) {
    return $(evt.target).toggleClass("green_sensor");
  });
  $(".actuator_button").click(function(evt) {
    return $(evt.target).toggleClass("green_actuator");
  });
  return $(".customprop_button").click(function(evt) {
    return $(evt.target).toggleClass("green_customprop");
  });
};

getInitialProps = function() {
  var $actuator, $actuators, $customprop, $customprops, $sensor, $sensors, actuator, customprop, props, sensor, _i, _j, _k, _len, _len1, _len2;
  props = {};
  $sensors = $sensor_list.find('.sensor_button:not([disabled])');
  $actuators = $actuator_list.find('.actuator_button:not([disabled])');
  $customprops = $customprop_list.find('.customprop_button:not([disabled])');
  props['sensors'] = {};
  props['actuators'] = {};
  props['customprops'] = {};
  for (_i = 0, _len = $sensors.length; _i < _len; _i++) {
    sensor = $sensors[_i];
    $sensor = $(sensor);
    props['sensors'][$sensor.text()] = $sensor.hasClass('green_sensor') ? 1 : 0;
  }
  for (_j = 0, _len1 = $actuators.length; _j < _len1; _j++) {
    actuator = $actuators[_j];
    $actuator = $(actuator);
    props['actuators'][$actuator.text()] = $actuator.hasClass('green_actuator') ? 1 : 0;
  }
  for (_k = 0, _len2 = $customprops.length; _k < _len2; _k++) {
    customprop = $customprops[_k];
    $customprop = $(customprop);
    props['customprops'][$customprop.text()] = $customprop.hasClass('green_customprop') ? 1 : 0;
  }
  return props;
};

getSensors = function() {
  var $sensor, $sensors, sensor, sensors, _i, _len;
  sensors = {};
  $sensors = $sensor_list.find('.sensor_button:not([disabled])');
  for (_i = 0, _len = $sensors.length; _i < _len; _i++) {
    sensor = $sensors[_i];
    $sensor = $(sensor);
    sensors[$sensor.text()] = $sensor.hasClass('green_sensor') ? 1 : 0;
  }
  return sensors;
};



},{"./automatonParser.litcoffee":1,"./executor.litcoffee":2,"./regionsParser.litcoffee":3,"./specParser.litcoffee":5}],5:[function(require,module,exports){
var getCompileOption, getRegionMapping, getSensorActuator, getSpecOption, parseSpec;

getSpecOption = function(str) {
  return str.split(':')[0];
};

getCompileOption = function(str) {
  var compileOption, compileOptionSplit;
  compileOption = {};
  compileOptionSplit = str.split(':');
  compileOption[compileOptionSplit[0]] = compileOptionSplit[1].trim();
  return compileOption;
};

getSensorActuator = function(str) {
  var sensorActuatorSplit, sensorAcutator;
  sensorAcutator = {};
  sensorActuatorSplit = str.split(',');
  sensorAcutator[sensorActuatorSplit[0]] = parseInt(sensorActuatorSplit[1].trim());
  return sensorAcutator;
};

getRegionMapping = function(str) {
  var regionMapping, regionMappingArr, regionMappingSplit;
  regionMapping = {};
  regionMappingSplit = str.split('=');
  regionMappingArr = regionMappingSplit[1].trim().split(',').map(function(elem) {
    return elem.trim();
  });
  regionMapping[regionMappingSplit[0].trim()] = regionMappingArr;
  return regionMapping;
};

parseSpec = function(parse_string) {
  var currentOption, line, spec, _i, _len, _ref;
  spec = {};
  currentOption = '';
  _ref = parse_string.trim().split("\n");
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    line = _ref[_i];
    line = line.trim();
    if (line.length < 1 && currentOption !== 'Spec') {
      currentOption = '';
      continue;
    }
    switch (currentOption) {
      case '':
        currentOption = getSpecOption(line);
        break;
      case 'Actions':
        if (spec.Actions == null) {
          spec.Actions = {};
        }
        $.extend(spec.Actions, getSensorActuator(line));
        break;
      case 'Sensors':
        if (spec.Sensors == null) {
          spec.Sensors = {};
        }
        $.extend(spec.Sensors, getSensorActuator(line));
        break;
      case 'Customs':
        if (spec.Customs == null) {
          spec.Customs = [];
        }
        spec.Customs.push(line);
        break;
      case 'CurrentConfigName':
        if (spec.CurrentConfigName == null) {
          spec.CurrentConfigName = '';
        }
        spec.CurrentConfigName += line;
        break;
      case 'RegionFile':
        if (spec.RegionFile == null) {
          spec.RegionFile = '';
        }
        spec.RegionFile += line;
        break;
      case 'CompileOptions':
        if (spec.CompileOptions == null) {
          spec.CompileOptions = {};
        }
        $.extend(spec.CompileOptions, getCompileOption(line));
        break;
      case 'RegionMapping':
        if (spec.RegionMapping == null) {
          spec.RegionMapping = {};
        }
        $.extend(spec.RegionMapping, getRegionMapping(line));
        break;
      case 'Spec':
        if (spec.Spec == null) {
          spec.Spec = '';
        }
        spec.Spec += line + '\n';
        break;
      default:
        console.warn("Spec Parsing: unrecognized spec option");
    }
  }
  return spec;
};

module.exports = {
  parseSpec: parseSpec
};



},{}]},{},[4]);
