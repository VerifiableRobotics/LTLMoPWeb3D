var $actuator_list, $customprop_list, $sensor_list, addPropButtons, automaton, createCar, currentRegion, currentTheta, currentVelocity, exports, getCentroid, getCurrentRegion, getProps, getSensors, plotCourse, regions, setVelocityTheta, spec, stopVelocityTheta;

spec = {};

automaton = {};

regions = {};

currentRegion = 0;

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
          spec = parseSpec(ev.target.result);
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
          automaton = parseAutomaton(ev.target.result, spec);
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
        regions = parseRegions(ev.target.result);
        console.log(regions);
        return create3DRegions(regions.Regions);
      };
      return reader.readAsText(file);
    }
  });
  return $executor_start_button.click(function() {
    execute(automaton, getProps);
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
  console.log("car position z:" + car.body.position.z);
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
  return console.log("velocity: " + velocity + " , theta: " + theta);
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
  return setVelocityTheta(2, targetTheta);
};

getCurrentRegion = function() {
  var angle, angle_v1, angle_v2, bottom, i, index, left, length, point, region, right, sum, top, v1_x, v1_y, v2_x, v2_y, xpos, ypos, _i, _j, _len, _len1, _ref, _ref1;
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
      sum = 0;
      length = region.points.length;
      _ref1 = region.points;
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        point = _ref1[i];
        v1_y = region.points[i][1] - ypos;
        v1_x = region.points[i][0] - xpos;
        v2_y = region.points[(i + 1) % length][1] - ypos;
        v2_x = region.points[(i + 1) % length][0] - xpos;
        angle_v1 = Math.atan2(v1_y, v1_x);
        angle_v2 = Math.atan2(v2_y, v2_x);
        angle = angle_v2 - angle_v1;
        while (angle > Math.PI) {
          angle -= 2 * Math.PI;
        }
        while (angle < -Math.PI) {
          angle += 2 * Math.PI;
        }
        sum += angle;
      }
      if (!(Math.abs(sum) < Math.PI)) {
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

getProps = function() {
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
    props['sensors'][$sensor.text()] = $sensor.hasClass('green_sensor');
  }
  for (_j = 0, _len1 = $actuators.length; _j < _len1; _j++) {
    actuator = $actuators[_j];
    $actuator = $(actuator);
    props['actuators'][$actuator.text()] = $actuator.hasClass('green_actuator');
  }
  for (_k = 0, _len2 = $customprops.length; _k < _len2; _k++) {
    customprop = $customprops[_k];
    $customprop = $(customprop);
    props['customprops'][$customprop.text()] = $customprop.hasClass('green_customprop');
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
    sensors[$sensor.text()] = $sensor.hasClass('green_sensor');
  }
  return sensors;
};