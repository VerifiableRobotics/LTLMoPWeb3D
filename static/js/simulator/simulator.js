var $actuator_list, $customprop_list, $sensor_list, addPropButtons, automaton, exports, getProps, getSensors, spec;

spec = {};

automaton = {};

$sensor_list = [];

$actuator_list = [];

$customprop_list = [];

$(document).ready(function() {
  var $automaton_upload_button, $automaton_upload_file, $executor_start_button, $regions_upload_button, $regions_upload_file, $spec_upload_button, $spec_upload_file, createRegionsFromJSON;
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
  createRegionsFromJSON = function(theList) {
    var blue, green, height, holes, index, name, new_geometry, new_ground, new_ground_material, new_shape, point, red, region, width, xpos, ypos, _i, _j, _len, _len1, _ref, _results;
    console.log(theList);
    _results = [];
    for (_i = 0, _len = theList.length; _i < _len; _i++) {
      region = theList[_i];
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
      for (index = _j = 0, _len1 = _ref.length; _j < _len1; index = ++_j) {
        point = _ref[index];
        if (index === 0) {
          new_shape.moveTo(point[0], point[1]);
        } else {
          new_shape.lineTo(point[0], point[1]);
        }
      }
      new_geometry = new_shape.makeGeometry();
      new_ground = new Physijs.ConvexMesh(new_geometry, new_ground_material, 0);
      new_ground.position.set(xpos, 0, -ypos);
      new_ground.rotation.x = -Math.PI / 2;
      car.body.position.y = -ypos/2;
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
    var extension, file, formData, nameSplit;
    file = this.files[0];
    nameSplit = file.name.split('.');
    extension = nameSplit[nameSplit.length - 1];
    if (extension !== "regions") {
      return alert("This only accepts *.regions files!");
    } else {
      formData = new FormData($('#regions_upload_form')[0]);
      return $.ajax({
        url: '/simulator/uploadRegions',
        type: 'POST',
        success: function(data) {
          return createRegionsFromJSON(data.theList);
        },
        error: function(xhr, status) {
          console.error("regions upload failed");
          return alert("Uploading regions failed, please try again with a different regions file");
        },
        data: formData,
        cache: false,
        contentType: false,
        processData: false
      });
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

addPropButtons = function(spec) {
  var actuatorName, className, custompropName, isActive, sensorName, _i, _len, _ref, _ref1, _ref2;
  $sensor_list.empty();
  $actuator_list.empty();
  $customprop_list.empty();
  _ref = spec.Sensors;
  for (sensorName in _ref) {
    isActive = _ref[sensorName];
    className = isActive ? "green_sensor" : "";
    $sensor_list.append("<li><button type=\"button\" class=\"sensor_button " + className + "\">" + sensorName + "</button></li>");
  }
  _ref1 = spec.Actions;
  for (actuatorName in _ref1) {
    isActive = _ref1[actuatorName];
    className = isActive ? "green_actuator" : "";
    $actuator_list.append("<li><button type=\"button\" class=\"actuator_button " + className + "\">" + actuatorName + "</button></li>");
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
  $sensors = $sensor_list.find('.sensor_button');
  $actuators = $actuator_list.find('.actuator_button');
  $customprops = $customprop_list.find('.customprop_button');
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
  $sensors = $sensor_list.find('.sensor_button');
  for (_i = 0, _len = $sensors.length; _i < _len; _i++) {
    sensor = $sensors[_i];
    $sensor = $(sensor);
    sensors[$sensor.text()] = $sensor.hasClass('green_sensor');
  }
  return sensors;
};