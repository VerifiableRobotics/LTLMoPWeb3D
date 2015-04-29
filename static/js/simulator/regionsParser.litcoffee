Helper functions to create regions object
-----------------------------------------
  
    getRegionsOption = (str) ->
      return str.split(':')[0]
    
    getCalibrationPoint = (str) ->
      calibrationPoint = {}
      calibrationPointSplit = str.split('\t')
      calibrationPoint[calibrationPointSplit[0]] = calibrationPointSplit[1].trim()
      return calibrationPoint
    
    getObstacle = (str) ->
      obstacle = {}
      obstacle[str] = true
      return obstacle
    
    getTransition = (str) ->
      transition = {} # dict from region -> region -> [points]
      transitionSplit = str.split('\t')
      pointNum = 0
      region1 = ''
      region2 = ''
      for transitionPiece, i in transitionSplit
        switch i
          when 0
            # make the first region a dict if it is not already
            region1 = transitionPiece.trim()
            if !transition[region1]? 
              transition[region1] = {}
          when 1
            # make the second region an array (of points)
            region2 = transitionPiece.trim()
            transition[region1][region2] = []
          else
            # enumerate every two [x, y]
            switch i % 2
              when 0
                # put in a new arr for the points and push x
                transition[region1][region2].push([])
                transition[region1][region2][pointNum].push(parseInt(transitionPiece))
              when 1
                # push y, increment pointNum
                transition[region1][region2][pointNum].push(parseInt(transitionPiece))
                pointNum++
              
            # end switch
        # end switch
      # end for
      return transition


Parse the region file
---------------------

    parseRegions = (parse_string) ->    

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
              regions.Transitions = {}
            $.extend(true, regions.Transitions, getTransition(line)) # deep merge
          else
            console.warn("Regions Parsing: unrecognized regions option")
        # end else
      # end for
      # parse regions string into actual JSON
      regions.Regions = JSON.parse(regions.Regions)

      return regions
    # end parseRegions


Export
------

    module.exports = {
      parseRegions: parseRegions
    }