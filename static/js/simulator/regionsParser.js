var exports, parseRegions;

parseRegions = function(parse_string) {
  var currentOption, getCalibrationPoint, getObstacle, getRegionsOption, getTransition, line, regions, _i, _len, _ref;
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