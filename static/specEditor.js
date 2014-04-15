$(document).ready(function() {
  // create a lined text area with a largely borrowed plugin
  $('#spec_editor_text').linedtextarea();
  
  // adjust results of lined text area
  var spec_editor_text_wrapper = $('#spec_editor_text_wrapper');
  spec_editor_text_wrapper.css('float','left');
  spec_editor_text_wrapper.css('width','80%');
  spec_editor_text_wrapper.css('height','80%');
  var spec_editor_text = $('#spec_editor_text');
  spec_editor_text.resize();
  spec_editor_text.scroll();
  
  // add event handlers
  $('#spec_editor_sensors_add').click(function() {
    var sensorList = $('#spec_editor_sensors');
    var num_sensors = sensorList.children().length;
    var sensorName = prompt("Name of Sensor:","sensor" + (num_sensors + 1));
    if(sensorName != "") {
    	sensorList.append("<li><input type=\"checkbox\">" + sensorName + "</li>");
    }
    else{
      alert("You did not enter a name");
    }
  });
  $('#spec_editor_actuators_add').click(function() {
    var actuatorList =  $('#spec_editor_actuators');
    var num_actuators = actuatorList.children().length;
    var actuatorName = prompt("Name of Actuator:","actuator" + (num_actuators + 1));
    if(actuatorName != "") {
      actuatorList.append("<li><input type=\"checkbox\">" + actuatorName + "</li>");
    }
    else{
      alert("You did not enter a name");
    }
  });
  $('#spec_editor_customprops_add').click(function() {
    var custompropsList =  $('#spec_editor_customprops');
    var num_customprops = custompropsList.children().length;
    var custompropName = prompt("Name of Custom Proposition:","prop" + (num_customprops + 1));
    if(custompropName != "") {  
      custompropsList.append("<li>" + custompropName + "</li>");
    }
    else {
      alert("You did not enter a name");
    }
  });
}); // end document ready