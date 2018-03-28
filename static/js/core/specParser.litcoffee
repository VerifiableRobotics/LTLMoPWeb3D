Helper functions to create spec object
--------------------------------------
    
    getSpecOption = (str) ->
      return str.split(':')[0]
    
    getCompileOption = (str) ->
      compileOptionSplit = str.split(':')
      compileOptionSplit[1] = compileOptionSplit[1].trim()
      # check for boolean values
      if compileOptionSplit[1] == 'True' or compileOptionSplit[1] == 'False'
        compileOptionSplit[1] = compileOptionSplit[1] == 'True'
      return [compileOptionSplit[0], compileOptionSplit[1]]
    
    getSensorActuator = (str) ->
      sensorActuatorSplit = str.split(',')
      return [sensorActuatorSplit[0], sensorActuatorSplit[1].trim() == '1']
    
    getRegionMapping = (str) ->
      regionMappingSplit = str.split('=')
      regionMappingArr = regionMappingSplit[1].trim().split(',').map((elem) ->
        elem.trim())
      # end map
      return [regionMappingSplit[0].trim(), regionMappingArr]


Parse a spec file
-----------------
Args: the spec file, as text

    parseSpec = (parse_string) ->

      # defaults
      spec = {
        'Actions': {},
        'Sensors': {},
        'Customs': [],
        'CurrentConfigName': '',
        'RegionFile': '',
        'CompileOptions': {},
        'RegionMapping': {},
        'Spec': ''
      }
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
          when 'Actions', 'Sensors'
            arr = getSensorActuator(line)
            spec[currentOption][arr[0]] = arr[1]
          when 'Customs'
            spec.Customs.push(line)
          when 'CurrentConfigName'
            spec.CurrentConfigName += line
          when 'RegionFile'
            spec.RegionFile += line
          when 'CompileOptions'
            arr = getCompileOption(line)
            spec.CompileOptions[arr[0]] = arr[1]
          when 'RegionMapping'
            arr = getRegionMapping(line)
            spec.RegionMapping[arr[0]] = arr[1]
          when 'Spec'
            spec.Spec += line + '\n'
          else
            console.warn('Spec Parsing: unrecognized spec option')
        # end else
      # end for

      console.log('Spec Object: ')
      console.log(spec)
      return spec


Export
------

    module.exports = {
      parse: parseSpec
    }
