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
    var faceNum, i, transition, transitionPiece, transitionSplit, _i, _len;
    transition = {};
    transitionSplit = str.split('\t');
    faceNum = 1;
    for (i = _i = 0, _len = transitionSplit.length; _i < _len; i = ++_i) {
      transitionPiece = transitionSplit[i];
      switch (i) {
        case 0:
          transition['region1'] = transitionPiece;
          break;
        case 1:
          transition['region2'] = transitionPiece;
          break;
        default:
          switch ((i + 2) % 4) {
            case 0:
              transition['face' + faceNum + '_x1'] = transitionPiece;
              break;
            case 1:
              transition['face' + faceNum + '_y1'] = transitionPiece;
              break;
            case 2:
              transition['face' + faceNum + '_x2'] = transitionPiece;
              break;
            case 3:
              transition['face' + faceNum + '_y2'] = transitionPiece;
              faceNum++;
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