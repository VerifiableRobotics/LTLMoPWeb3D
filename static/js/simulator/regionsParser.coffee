parseRegions = (parse_string) ->

  # helper functions to create regions object
  getRegionsOption = (str) ->
    str.split(':')[0]
  getCalibrationPoint = (str) ->
    calibrationPoint = {}
    calibrationPointSplit = str.split('\t')
    calibrationPoint[calibrationPointSplit[0]] = calibrationPointSplit[1].trim()
    calibrationPoint
  getObstacle = (str) ->
    obstacle = {}
    obstacle[str] = true
    obstacle
  getTransition = (str) ->
    transition = {}
    transitionSplit = str.split('\t')
    faceNum = 1
    for transitionPiece, i in transitionSplit
      switch i
        when 0
          transition['region1'] = transitionPiece
        when 1
          transition['region2'] = transitionPiece
        else
          # enumerate every four
          switch (i + 2) % 4
            when 0
              transition['face' + faceNum + '_x1'] = transitionPiece
            when 1
              transition['face' + faceNum + '_y1'] = transitionPiece
            when 2
              transition['face' + faceNum + '_x2'] = transitionPiece
            when 3
              transition['face' + faceNum + '_y2'] = transitionPiece
              faceNum++
          # end switch
      # end switch
    # end for
    transition
  # end getTransition

    

  regions = {}
  # loop through lines
  currentOption = ''
  for line in parse_string.trim().split "\n"
    line = line.trim()
    if line.length < 1 and currentOption != 'Spec'
      currentOption = ''
      continue
    switch currentOption
      when ''
        currentOption = getRegionsOption(line)
      when 'Background'
        if not regions.Background?
          regions.Background = ""
        regions.Background += line
      when 'CalibrationPoints'
        if not regions.CalibrationPoints?
          regions.CalibrationPoints = []
        regions.CalibrationPoints.push(getCalibrationPoint(line))
      when 'Obstacles'
        if not regions.Obstacles?
          regions.Obstacles = {}
        $.extend(regions.Obstacles, getObstacle(line))
      when 'Regions'
        if not regions.Regions?
          regions.Regions = ""
        regions.Regions += line
      when 'Transitions'
        if not regions.Transitions?
          regions.Transitions = []
        regions.Transitions.push(getTransition(line))
      else
        console.warn("Regions Parsing: unrecognized regions option")
    # end else
  # end for
  # parse regions string into actual JSON
  regions.Regions = JSON.parse(regions.Regions)

  regions
# end parseRegions

exports = {
  parseRegions: parseRegions
}