$(document).ready(function() {
  // create a lined text area with a largely borrowed plugin
  var specEditorText = $('#spec_editor_text');
  specEditorText.linedtextarea();
  
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
    clickAdd(sensorList, sensorMap, sensorRemove,
      "Name of Sensor:", "sensor", "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\"><input type=\"checkbox\" checked>", "</li>");
  });
  $('#spec_editor_actuators_add').click(function() {
    clickAdd(actuatorList, actuatorMap, actuatorRemove,
      "Name of Actuator:", "actuator", "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\"><input type=\"checkbox\" checked>", "</li>");
  });
  $('#spec_editor_customprops_add').click(function() {
    clickAdd(custompropList, custompropMap, custompropRemove,
      "Name of Custom Proposition:", "prop", "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\">", "</li>");
  });
  
  // remove event handlers
  sensorRemove.click(function() {
    clickRemove(this, sensorList, sensorMap);
  });
  actuatorRemove.click(function() {
    clickRemove(this, actuatorList, actuatorMap);
  });
  custompropRemove.click(function() {
    clickRemove(this, custompropList, custompropMap);
  });
  
  // click add function
  function clickAdd(selectList, selectMap, removeButton, promptText, nameText, htmlLeft, htmlRight) {
  	var count = 1;
    // until we get "name" + count that is not in the map
    while(selectMap[nameText + count] != null) {
      count += 1;
    }
    var name = prompt(promptText, nameText + count);
    if(name != "" && name != null && selectMap[name] == null) {
      selectList.children().removeClass("spec_editor_selectlist_li_clicked"); // unclick all
      var newProp = $(htmlLeft + name + htmlRight);
      newProp.find('input').val(name); // set value of checkbox to name as well
      newProp.click(function(ev) {
        clickSelectListLi(ev, selectList);
      });
      selectList.append(newProp);
      selectMap[name] = true; // add to map
      removeButton[0].disabled = false; // allow removal
    }
    else if(selectMap[name] != null) {
      alert("Duplicates are not allowed");
    }
    else if(name == "") {
      alert("A blank name is not allowed");
    }
  }
  
  // click remove function
  function clickRemove(_t, selectList, selectMap) {
    var elem = selectList.children('.spec_editor_selectlist_li_clicked');
    var text = elem.text();
    delete selectMap[text]; // remove from map
    elem.remove(); // remove from DOM
    if(selectList.children().length <= 0) {
      _t.disabled = true; // disallow removal
    }
  }
  
  // click li functions
  function clickSelectListLi(ev, selectList) {
    selectList.children().removeClass("spec_editor_selectlist_li_clicked");
    var target = $(ev.target);
    if(!target.is('li')) { // in case the checkbox was clicked
      target = target.parent('li');
    }
    target.addClass("spec_editor_selectlist_li_clicked");
  }
  
  // add and remove styling for bottom labels on click
  var bottomLabels = $('.spec_editor_bottom_label');
  bottomLabels.click(function(ev) {
    bottomLabels.removeClass('spec_editor_bottom_label_clicked');
    $(ev.target).addClass('spec_editor_bottom_label_clicked');
  });
  
  // send json to create spec and then download spec
  $('#spec_editor_save').click(function() {
    var data = {};
    var specText = specEditorText.val();
    if(specText != '') {
      data['specText'] = specText;
    }
    // arrays to store data that will be passed to server 
    data['all_sensors'] = [];
    data['enabled_sensors'] = [];
    data['all_actuators'] = [];
    data['enabled_actuators'] = [];
    data['all_customs'] = [];
    sensorList.children().each(function() {
      data['all_sensors'].push($(this).text());
    });
    sensorList.find(':checked').each(function() {
      data['enabled_sensors'].push($(this).val());
    });
    actuatorList.children().each(function() {
      data['all_actuators'].push($(this).text());
    });
    actuatorList.find(':checked').each(function() {
      data['enabled_actuators'].push($(this).val());
    });
    custompropList.children().each(function() {
      data['all_customs'].push($(this).text());
    });
    
    // save spec
    window.location="specEditor/saveSpec?" + $.param(data, true);
  });
  
}); // end document ready