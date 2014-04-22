$(document).ready(function() {
  // create a lined text area with a largely borrowed plugin
  $('#spec_editor_text').linedtextarea();
  
  var sensorList = $('#spec_editor_sensors');
  var actuatorList =  $('#spec_editor_actuators');
  var custompropList =  $('#spec_editor_customprops');
  // for constant time access to check names
  var sensorMap = {};
  var actuatorMap = {};
  var custompropMap = {};
  
  var sensorRemove = $('#spec_editor_sensors_remove');
  var actuatorRemove = $('#spec_editor_actuators_remove');
  var custompropRemove = $('#spec_editor_customprops_remove');                       

  // add event handlers
  $('#spec_editor_sensors_add').click(function() {
    var num_sensors = sensorList.children().length;
    var sensorName = prompt("Name of Sensor:","sensor" + (num_sensors + 1));
    if(sensorName != "" && sensorMap[sensorName] == null) {
   	  sensorList.append("<li tabindex=\"0\"><input type=\"checkbox\" checked>" + sensorName + "</li>");
      sensorMap[sensorName] = true; // add to map
      sensorRemove[0].disabled = false; // allow removal
    }
    else{
      alert("You did not enter a valid name");
    }
  });
  $('#spec_editor_actuators_add').click(function() {
    var num_actuators = actuatorList.children().length;
    var actuatorName = prompt("Name of Actuator:","actuator" + (num_actuators + 1));
    if(actuatorName != "" && actuatorMap[actuatorName] == null) {
      actuatorList.append("<li tabindex=\"0\"><input type=\"checkbox\" checked>" + actuatorName + "</li>");
      actuatorMap[actuatorName] = true; // add to map
      actuatorRemove[0].disabled = false; // allow removal
    }
    else{
      alert("You did not enter a valid name");
    }
  });
  $('#spec_editor_customprops_add').click(function() {
    var num_customprops = custompropList.children().length;
    var custompropName = prompt("Name of Custom Proposition:","prop" + (num_customprops + 1));
    if(custompropName != "" && custompropMap[custompropName] == null) {  
      custompropList.append("<li tabindex=\"0\">" + custompropName + "</li>");
      custompropMap[custompropName] = true; // add to map
      custompropRemove[0].disabled = false; // allow removal
    }
    else {
      alert("You did not enter a valid name");
    }
  });
  
  // remove event handlers
  sensorRemove.click(function() {
    sensorList.children(':focus').remove();
  });
  
}); // end document ready