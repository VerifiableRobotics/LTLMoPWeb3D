var parseSpec;

parseSpec = function(parse_string) {
  var currentOption, getCompileOption, getRegionMapping, getSensorActuator, getSpecOption, line, spec, _i, _len, _ref;
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