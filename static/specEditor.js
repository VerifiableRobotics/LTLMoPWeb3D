$(document).ready(function() {
  // create a lined text area with a largely borrowed plugin
  var specEditorText = $('#spec_editor_text');
  specEditorText.linedtextarea();
  
  var regionPath = ''; // variable to hold the path to the regions file
  
  var regionList = $('#spec_editor_regions');
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
  
  // add and remove styling for bottom labels on click
  var bottomLabels = $('.spec_editor_bottom_label');
  bottomLabels.click(function(ev) {
    bottomLabels.removeClass('spec_editor_bottom_label_clicked');
    $(ev.target).addClass('spec_editor_bottom_label_clicked');
  });
  
  // send json to create spec and then download spec
  $('#spec_editor_save').click(function() {
    var data = createJSONForSpec();
    // save spec... downloads cannot be done via ajax
    window.location="specEditor/saveSpec?" + $.param(data, true);
  });
  
  $('#spec_editor_compile').click(function() {
    var data = createJSONForSpec();
    // save spec... downloads cannot be done via ajax
    window.open("specEditor/saveSpec?" + $.param(data, true));
    $.ajax({
      type: 'GET',
      url: 'specEditor/compileSpec',
      success: function(data) {
        $('#spec_editor_compilerlog_text').text(data.compilerLog);
        window.open("specEditor/saveAut");
        window.open("specEditor/saveLTL");
      },
      error: function() {
        console.log("compile spec failed");
      }
    });
  });
  
  // click about handler 
  $('#about_spec_editor').click(function() {
    alert("Specification Editor is part of the LTLMoP Toolkit.\nFor more information, please visit http://ltlmop.github.com");
  });
  
  // bind to change event, partly borrowed from olanod on SO
  $('#spec_editor_regions_upload_file').change(function(){
    // upload the file
    uploadFile(this, "regions", $('#spec_editor_regions_upload_form')[0], '/specEditor/uploadRegions', 'POST', successFunc, errorFunc);
    // success callback
    function successFunc(data) { 
      createRegionsFromJSON(data.theList); // add li elems
      regionPath = data.thePath; // store path
      $('#spec_editor_regions_selectfrommap').prop('disabled', false); // enable button
    }
    // error callback
    function errorFunc(xhr, status) {
      console.log("regions upload failed");
    }
  }); // end change
  
  $('#spec_editor_import_spec').click(function() {
    $.ajax({
      url: 'specEditor/importSpec',
      type: 'GET',
      success: function(data) {
        importSpec(data);
      },
      error: function(xhr, status) {
        console.log('import spec failed');
      }
    }); // end ajax
  }); // end click
  
  // ---------------------------------------- helper functions below ----------------------------
  
  function importSpec(data) {
    $('#spec_editor_text').text(data['specText']); // set text
    regionPath = data['regionPath']; // store the path to the regions file
    
    // set compilation options
    // checkboxes
    $('#compilation_options_convexify').prop('checked', data['convexify'] == 'true');
    $('#compilation_options_fastslow').prop('checked', data['fastslow'] == 'true'); 
    $('#compilation_options_use_region_bit_encoding').prop('checked', data['use_region_bit_encoding'] == 'true');
    $('#compilation_options_symbolic').prop('checked', data['symbolic'] == 'true');
    // radio buttons
    $('.parser_mode_radio[value="' + data['parser'] + '"]').prop('checked', true);
    $('.synthesizer_radio[value="' + data['synthesizer'] + '"]').prop('checked', true);
    
    // add sensors
    data['all_sensors'].forEach(function(name) {  
      addProp(name, sensorMap, sensorList,
        "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\"><input type=\"checkbox\">", "</li>", 
        sensorRemove);
    })
    data['all_actuators'].forEach(function(name) {  
      addProp(name, actuatorMap, actuatorList,
        "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\"><input type=\"checkbox\">", "</li>", 
        actuatorRemove);
    })
    data['all_customs'].forEach(function(name) {  
      addProp(name, custompropMap, custompropList,
        "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\">", "</li>", 
        custompropRemove);
    })
    // check sensors
    data['enabled_sensors'].forEach(function(name) {
      sensorList.find(':contains('+name+')').children().prop('checked', true);
    })
    data['enabled_actuators'].forEach(function(name) {
      actuatorList.find(':contains('+name+')').children().prop('checked', true);
    })
  }
  
  // upload file function
  function uploadFile(newthis, acceptedExtension, form, url, type, successFunc, errorFunc) {
    var file = newthis.files[0];
    var name = file.name;
    var extension = name.split('.')[name.split('.').length - 1]
    // validation
    if(extension != acceptedExtension) {
      alert("This only accepts *." + acceptedExtension + "files!");
    }
    else { // do upload
      var formData = new FormData(form);
      $.ajax({
        url: url,
        type: type,
        // ajax callbacks 
        success: successFunc,
        error: errorFunc,
        // form data to send
        data: formData,
        // options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false
      }); // end ajax
    } // end else
  } // end upload file
  
   // click add function
  function clickAdd(selectList, selectMap, removeButton, promptText, nameText, htmlLeft, htmlRight) {
  	var count = 1;
    // until we get "name" + count that is not in the map
    while(selectMap[nameText + count] != null) {
      count += 1;
    }
    var name = prompt(promptText, nameText + count);
    addProp(name, selectMap, selectList, htmlLeft, htmlRight, removeButton);
  }

  // adds the prop    
  function addProp(name, selectMap, selectList, htmlLeft, htmlRight, removeButton) {
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
  
  // click li function
  function clickSelectListLi(ev, selectList) {
    selectList.children().removeClass("spec_editor_selectlist_li_clicked");
    var target = $(ev.target);
    if(!target.is('li')) { // in case the checkbox was clicked
      target = target.parent('li');
    }
    target.addClass("spec_editor_selectlist_li_clicked");
  }
  
  function createRegionsFromJSON(theList) {
    // loop through the region array
    theList.forEach(function(region) {
      var name = region.name; // get name
      var newRegion = $("<li class=\"spec_editor_selectlist_li\" tabindex=\"0\">" + name + "</li>"); // create elem
      newRegion.click(function(ev) { // bind click to element
        clickSelectListLi(ev, regionList);
      });
      regionList.append(newRegion); // append element      
    }) // end for each
  } // end create regions from JSON
  
  // creates and returns the json that holds all spec information
  function createJSONForSpec() {
    var data = {};
    
    var specText = specEditorText.val();
    if(specText != '') {
      data['specText'] = specText; // store spec text
    }
    
    data['regionPath'] = regionPath; // store the path to the regions file
    
    // store compilation options
    // get checkboxes
    data['convexify'] = $('#compilation_options_convexify')[0].checked;
    data['fastslow'] = $('#compilation_options_fastslow')[0].checked;
    data['use_region_bit_encoding'] = $('#compilation_options_use_region_bit_encoding')[0].checked;
    data['symbolic'] = $('#compilation_options_symbolic')[0].checked;
    // get radio buttons
    data['parser'] = $('.parser_mode_radio:checked').val();
    data['synthesizer'] = $('.synthesizer_radio:checked').val();
    
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
    
    return data;
  } // end create JSON for spe
  
}); // end document ready