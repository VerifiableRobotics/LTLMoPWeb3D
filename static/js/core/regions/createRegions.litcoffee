Generate Regions Text file
--------------------------
Constants

    backgroundText =
      '# This is a region definition file for the LTLMoP toolkit.\n' +
      '# Format details are described at the beginning of each section below.\n' +
      '# Note that all values are separated by *tabs*.\n' +
      '\n' +
      'Background: # Relative path of background image file\n'
    calibrationText = '\nCalibrationPoints: # Vertices to use for map calibration: (vertex_region_name, vertex_index)\n'
    obstaclesText = '\nObstacles: # Names of regions to treat as obstacles\n'
    regionsText = '\nRegions: # Stored as JSON string\n'
    transitionsText = '\nTransitions: # Region 1 Name, Region 2 Name, Bidirectional transition faces (face1_x1, face1_y1, face1_x2, face1_y2, face2_x1, ...)\n'
    endText = '\n\n'

Create the text of a .regions file from a regions object

    generateRegionsText = (regions) ->
      text = '' + backgroundText
      if regions.Background
        text += regions.Background
      else
        text += 'None'
      text += '\n'

      text += calibrationText
      for point in regions.CalibrationPoints
        text += point[0] + '\t' + point[1] + '\n'

      text += obstaclesText
      for obstacle in regions.Obstacles
        text += obstacle + '\n'

      text += regionsText
      # pretty-print and use tabs as whitespace
      text += JSON.stringify(regions.Regions, null, '\t')

      text += transitionsText
      for region1, region2s of regions.Transitions
        for region2, points of region2s
          text += region1 + '\t' + region2
          for point in points
            text += '\t' + point.join('\t')
          text += '\n'

      text += endText


Export
------

    module.exports = { generateRegionsText }
