$(document).ready(function() {
  // cache jQuery objects
  var $spec_editor_save_link = $('.spec_editor_save_link');
  var $spec_editor_text = $('#spec_editor_text');
  var $spec_editor_compilerlog_text = $('#spec_editor_compilerlog_text');
  var $spec_editor_regions = $('#spec_editor_regions');
  var $spec_editor_sensors = $('#spec_editor_sensors');
  var $spec_editor_actuators =  $('#spec_editor_actuators');
  var $spec_editor_customprops =  $('#spec_editor_customprops');
  var $spec_editor_sensors_remove = $('#spec_editor_sensors_remove');
  var $spec_editor_actuators_remove = $('#spec_editor_actuators_remove');
  var $spec_editor_customprops_remove = $('#spec_editor_customprops_remove');
  var $spec_editor_bottom_label = $('.spec_editor_bottom_label');
  var $spec_editor_import_spec_form = $('#spec_editor_import_spec_form');
  var $spec_editor_regions_upload_form = $('#spec_editor_regions_upload_form');
  var $spec_editor_regions_selectfrommap = $('#spec_editor_regions_selectfrommap');
  var $compilation_options_convexify = $('#compilation_options_convexify');
  var $compilation_options_fastslow = $('#compilation_options_fastslow'); 
  var $compilation_options_use_region_bit_encoding = $('#compilation_options_use_region_bit_encoding');
  var $compilation_options_symbolic = $('#compilation_options_symbolic');
       


  // disable download if not yet compiled
  $spec_editor_save_link.click(function(ev) {
    if($(this).hasClass('spec_editor_save_link_disabled')) {
      alert('You must compile the spec before saving this file!');
      ev.preventDefault();
      return false;
    } // end if
  }); // end click

  // create a lined text area with a largely borrowed plugin
  $spec_editor_text.linedtextarea();
  
  var regionPath = ''; // variable to hold the path to the regions file
  
  // for constant time access to check names
  var sensorMap = {};
  var actuatorMap = {};
  var custompropMap = {};                  

  // add event handlers
  $('#spec_editor_sensors_add').click(function() {
    clickAdd($spec_editor_sensors, sensorMap, $spec_editor_sensors_remove,
      "Name of Sensor:", "sensor", "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\"><input type=\"checkbox\" checked>", "</li>");
  });
  $('#spec_editor_actuators_add').click(function() {
    clickAdd($spec_editor_actuators, actuatorMap, $spec_editor_actuators_remove,
      "Name of Actuator:", "actuator", "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\"><input type=\"checkbox\" checked>", "</li>");
  });
  $('#spec_editor_customprops_add').click(function() {
    clickAdd($spec_editor_customprops, custompropMap, $spec_editor_customprops_remove,
      "Name of Custom Proposition:", "prop", "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\">", "</li>");
  });
  
  // remove event handlers
  $spec_editor_sensors_remove.click(function() {
    clickRemove(this, $spec_editor_sensors, sensorMap);
  });
  $spec_editor_actuators_remove.click(function() {
    clickRemove(this, $spec_editor_actuators, actuatorMap);
  });
  $spec_editor_customprops_remove.click(function() {
    clickRemove(this, $spec_editor_customprops, custompropMap);
  });
  
  // add and remove styling for bottom labels on click
  $spec_editor_bottom_label.click(function(ev) {
    $spec_editor_bottom_label.removeClass('spec_editor_bottom_label_clicked');
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
        $spec_editor_compilerlog_text.text(data.compilerLog);
        $spec_editor_save_link.removeClass('spec_editor_save_link_disabled');
      },
      error: function() {
        console.error("compile spec failed");
        alert("Spec compilation failed!");
      }
    });
  });

  $('#spec_editor_analyze').click(function() {
    $.ajax({
      type: 'GET',
      url: 'specEditor/analyzeSpec',
      success: function(data) {
        alert(data.analyzeLog);
      },
      error: function() {
        console.error("analyze spec failed");
        alert("Spec analysis failed!");
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
    uploadFile(this, "regions", $spec_editor_regions_upload_form[0], '/specEditor/uploadRegions', 'POST', successFunc, errorFunc);
    // success callback
    function successFunc(data) { 
      createRegionsFromJSON(data.theList); // add li elems
      regionPath = data.thePath; // store path
      //$spec_editor_regions_selectfrommap.prop('disabled', false); // enable button
    }
    // error callback
    function errorFunc(xhr, status) {
      console.error("regions upload failed");
      alert("The regions file upload failed!");
    }
  }); // end change
  
  $('#spec_editor_import_spec_file').change(function() {
    uploadFile(this, "spec", $spec_editor_import_spec_form[0], '/specEditor/importSpec', 'POST', successFunc, errorFunc);
    function successFunc(data) {
      importSpec(data);
    }
    function errorFunc(xhr, status) {
      console.error('import spec failed');
      alert("Importing the spec failed!");
    }
  }); // end change
  
  // ---------------------------------------- helper functions below ----------------------------
  
  // given the JSON version of a project object, imports the spec
  function importSpec(data) {
    $spec_editor_text.text(data['specText']); // set text
    regionPath = data['regionPath']; // store the path to the regions file
    
    // set compilation options
    // checkboxes
    $compilation_options_convexify.prop('checked', data['convexify'] == 'true');
    $compilation_options_fastslow.prop('checked', data['fastslow'] == 'true'); 
    $compilation_options_use_region_bit_encoding.prop('checked', data['use_region_bit_encoding'] == 'true');
    $compilation_options_symbolic.prop('checked', data['symbolic'] == 'true');
    // radio buttons
    $('.parser_mode_radio[value="' + data['parser'] + '"]').prop('checked', true);
    $('.synthesizer_radio[value="' + data['synthesizer'] + '"]').prop('checked', true);
    
    // clear all lists and maps
    sensorMap = {};
    actuatorMap = {};
    custompropMap = {};
    $spec_editor_sensors.empty();
    $spec_editor_actuators.empty();
    $spec_editor_customprops.empty();
    $spec_editor_regions.empty();
    
    // add regions
    data['regionList'].forEach(function(name) {
      createRegion(name);
    })
    // add sensors
    data['all_sensors'].forEach(function(name) {  
      addProp(name, sensorMap, $spec_editor_sensors,
        "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\"><input type=\"checkbox\">", "</li>", 
        $spec_editor_sensors_remove);
    })
    data['all_actuators'].forEach(function(name) {  
      addProp(name, actuatorMap, $spec_editor_actuators,
        "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\"><input type=\"checkbox\">", "</li>", 
        $spec_editor_actuators_remove);
    })
    data['all_customs'].forEach(function(name) {  
      addProp(name, custompropMap, $spec_editor_customprops,
        "<li class=\"spec_editor_selectlist_li_clicked\" tabindex=\"0\">", "</li>", 
        $spec_editor_customprops_remove);
    })
    // check sensors
    data['enabled_sensors'].forEach(function(name) {
      $spec_editor_sensors.find(':contains('+name+')').children().prop('checked', true);
    })
    data['enabled_actuators'].forEach(function(name) {
      $spec_editor_actuators.find(':contains('+name+')').children().prop('checked', true);
    })
  } // end import spec
  
  // uploads file given the jQuery object that holds the file, the accepted extension (e.g. "spec"), the form element that wraps the file, the url to send the file to, the type of request (e.g. "POST"), and the success and error callbacks
  function uploadFile(newthis, acceptedExtension, form, url, type, successFunc, errorFunc) {
    var file = newthis.files[0];
    var name = file.name;
    var nameSplit = name.split('.');
    var extension = nameSplit[nameSplit.length - 1];
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
   // takes the ul element to add to, the map that holds the props, the button that does remove for these props, the text to prompt the user upon input, the placeholer name of the prop (e.g. "sensor"), and the html that will go to the left and right of the name
  function clickAdd(selectList, selectMap, removeButton, promptText, nameText, htmlLeft, htmlRight) {
  	var count = 1;
    // until we get "name" + count that is not in the map
    while(selectMap[nameText + count] != null) {
      count += 1;
    }
    var name = prompt(promptText, nameText + count);
    addProp(name, selectMap, selectList, htmlLeft, htmlRight, removeButton);
  } // end click add

  // adds the prop given the name, the map that holds the props, the ul that holds them, the html to the left and right of the name, and the button that removes these props   
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
  } // end add prop
  
  // click remove function
  // takes in the jQuery object of the remove button, and the respective ul and map that hold the props that this button removes
  function clickRemove(_t, selectList, selectMap) {
    var elem = selectList.children('.spec_editor_selectlist_li_clicked');
    var text = elem.text();
    delete selectMap[text]; // remove from map
    elem.remove(); // remove from DOM
    if(selectList.children().length <= 0) {
      _t.disabled = true; // disallow removal
    } // end if
  } // end click remove
  
  // click li function
  // takes in an event and the ul that was clicked
  function clickSelectListLi(ev, selectList) {
    selectList.children().removeClass("spec_editor_selectlist_li_clicked");
    var target = $(ev.target);
    if(!target.is('li')) { // in case the checkbox was clicked
      target = target.parent('li');
    } // end if
    target.addClass("spec_editor_selectlist_li_clicked");
  } // end click li
  
  // adds all the regions from a JSON list
  function createRegionsFromJSON(theList) {
    // loop through the region array
    theList.forEach(function(region) {
      var name = region.name; // get name
      createRegion(name); // create the region    
    }) // end for each
  } // end create regions from JSON
  
  // creates region element, binds the event handler, and adds to ul
  function createRegion(name) {
    var newRegion = $("<li class=\"spec_editor_selectlist_li\" tabindex=\"0\">" + name + "</li>"); // create elem
    newRegion.click(function(ev) { // bind click to element
      clickSelectListLi(ev, $spec_editor_regions);
    });
    $spec_editor_regions.append(newRegion); // append element  
  } // end create region
  
  // creates and returns the json that holds all spec information
  function createJSONForSpec() {
    var data = {};
    
    var specText = $spec_editor_text.val();
    if(specText != '') {
      data['specText'] = specText; // store spec text
    }
    
    data['regionPath'] = regionPath; // store the path to the regions file
    
    // store compilation options
    // get checkboxes
    data['convexify'] = $compilation_options_convexify[0].checked;
    data['fastslow'] = $compilation_options_fastslow[0].checked;
    data['use_region_bit_encoding'] = $compilation_options_use_region_bit_encoding[0].checked;
    data['symbolic'] = $compilation_options_symbolic[0].checked;
    // get radio buttons
    data['parser'] = $('.parser_mode_radio:checked').val();
    data['synthesizer'] = $('.synthesizer_radio:checked').val();
    
    // arrays to store data that will be passed to server 
    data['all_sensors'] = [];
    data['enabled_sensors'] = [];
    data['all_actuators'] = [];
    data['enabled_actuators'] = [];
    data['all_customs'] = [];
    $spec_editor_sensors.children().each(function() {
      data['all_sensors'].push($(this).text());
    });
    $spec_editor_sensors.find(':checked').each(function() {
      data['enabled_sensors'].push($(this).val());
    });
    $spec_editor_actuators.children().each(function() {
      data['all_actuators'].push($(this).text());
    });
    $spec_editor_actuators.find(':checked').each(function() {
      data['enabled_actuators'].push($(this).val());
    });
    $spec_editor_customprops.children().each(function() {
      data['all_customs'].push($(this).text());
    });
    
    return data;
  } // end create JSON for spec
  
}); // end document ready