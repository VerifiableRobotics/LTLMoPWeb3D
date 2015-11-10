Helper functions to create spec object
--------------------------------------
    
    getSpecOption = (str) ->
      str.split(':')[0]
    
    getCompileOption = (str) ->
      compileOption = {}
      compileOptionSplit = str.split(':')
      compileOption[compileOptionSplit[0]] = compileOptionSplit[1].trim()
      compileOption
    
    getSensorActuator = (str) ->
      sensorAcutator = {}
      sensorActuatorSplit = str.split(',')
      sensorAcutator[sensorActuatorSplit[0]] = parseInt(sensorActuatorSplit[1].trim())
      sensorAcutator
    
    getRegionMapping = (str) ->
      regionMapping = {}
      regionMappingSplit = str.split('=')
      regionMappingArr = regionMappingSplit[1].trim().split(',').map (elem) ->
        elem.trim()
      # end map
      regionMapping[regionMappingSplit[0].trim()] = regionMappingArr
      regionMapping


Parse a spec spec file
----------------------

    parseSpec = (parse_string) ->

      spec = {}
      # loop through lines
      currentOption = ''
      for line in parse_string.trim().split '\n'
        line = line.trim()
        if line.length < 1 and currentOption != 'Spec'
          currentOption = ''
          continue
        switch currentOption
          when ''
            currentOption = getSpecOption(line)
          when 'Actions'
            if not spec.Actions?
              spec.Actions = {}
            $.extend(spec.Actions, getSensorActuator(line))
          when 'Sensors'
            if not spec.Sensors?
              spec.Sensors = {}
            $.extend(spec.Sensors, getSensorActuator(line))
          when 'Customs'
            if not spec.Customs?
              spec.Customs = []
            spec.Customs.push(line)
          when 'CurrentConfigName'
            if not spec.CurrentConfigName?
              spec.CurrentConfigName = ''
            spec.CurrentConfigName += line
          when 'RegionFile'
            if not spec.RegionFile?
              spec.RegionFile = ''
            spec.RegionFile += line
          when 'CompileOptions'
            if not spec.CompileOptions?
              spec.CompileOptions = {}
            $.extend(spec.CompileOptions, getCompileOption(line))
          when 'RegionMapping'
            if not spec.RegionMapping?
              spec.RegionMapping = {}
            $.extend(spec.RegionMapping, getRegionMapping(line))
          when 'Spec'
            if not spec.Spec?
              spec.Spec = ''
            spec.Spec += line + '\n'
          else
            console.warn('Spec Parsing: unrecognized spec option')
        # end else
      # end for

      spec
    # end parseSpec


Export
------

    module.exports = {
      parseSpec: parseSpec
    }
