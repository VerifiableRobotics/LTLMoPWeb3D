Helper functions / calculations to use with regions
---------------------------------------------------

Given a region, get the centroid

    getCentroid = (region) ->
      # vars for getting centroid of region
      regionX = 0
      regionY = 0
      numPoints = region.points.length
      position = region.position
      for point in region.points
        regionX += point[0]
        regionY += point[1]

      return [position[0] + regionX / numPoints, position[1] + regionY / numPoints]

Given an x, y coordinate, get the region (number) it is located in

    getRegion = (regionFile, xpos, ypos) ->
      # loop through the region array
      for region, index in regionFile.Regions
        left = region.position[0]
        right = region.position[0] + region.size[0]
        bottom = region.position[1]
        top = region.position[1] + region.size[1]
        # check if inside bounding box
        if xpos >= left and xpos <= right and ypos >= bottom and ypos <= top
          # if in bounding box, check if inside polygon
          points = region.points
          pos = region.position
          j = points.length - 1
          result = false
          # check if in polygon (counting edges using ray method)
          for point, i in points
            if (points[i][1] + pos[1] > ypos) != (points[j][1] + pos[1] > ypos) and
            (xpos < (points[j][0] - points[i][0]) * (ypos - points[i][1] + pos[1]) / (points[j][1] - points[i][1]) + points[i][0] + pos[0])
              result = !result
            j = i
          # if in polygon, return the region's index
          if result
            return index
      # not in a region currently
      return null

Given a region, get the midpoint of the transition from the current region to it

    getTransition = (regionFile, currentRegion, nextRegion) ->
      regionToName = nextRegion.name
      regionFromName = regionFile.Regions[getRegion()].name
      #console.log('regionFrom: ' + regionFromName + ' regionTo: ' + regionToName)
      # get correct transition array, could be ordered either way
      transition = if !regionFile.Transitions[regionFromName]? or !regionFile.Transitions[regionFromName][regionToName]?
        regionFile.Transitions[regionToName][regionFromName]
      else regionFile.Transitions[regionFromName][regionToName]
      # return midpoint
      return [(transition[0][0] + transition[1][0]) / 2, (transition[0][1] + transition[1][1]) / 2]


Export
------

    module.exports = {
      getCentroid,
      getRegion,
      getTransition
    }
