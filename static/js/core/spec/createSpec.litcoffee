Generate Spec Text file
-----------------------
Constants

    actText =
      '# This is a specification definition file for the LTLMoP toolkit.\n' +
      '# Format details are described at the beginning of each section below.\n' +
      '\n\n======== SETTINGS ========\n\n' +
      'Actions: # List of action propositions and their state (enabled = 1, disabled = 0)\n'
    compileText = '\nCompileOptions:\n'
    configText = '\nCurrentConfigName:\n'
    customsText = '\nCustoms: # List of custom propositions\n'
    regionText = '\nRegionFile: # Relative path of region description file\n'
    sensorText = '\nSensors: # List of sensor propositions and their state (enabled = 1, disabled = 0)\n'
    mapText = '\n\n======== SPECIFICATION ========\n\n' +
      'RegionMapping: # Mapping between region names and their decomposed counterparts'
    specText = '\nSpec: # Specification in structured English\n'
    endText = '\n\n'

Create the text of a .spec file from a spec object

    generateSpecText = (spec) ->
      text = '' + actText
      for name, isEnabled of spec.Actions
        num = if isEnabled then '1' else '0'
        text += name + ', ' + num + '\n'

      text += compileText
      for name, val of spec.CompileOptions
        # convert JS t/f to Python t/f
        outVal = val == true ? 'True' : val
        outVal = outVal == false ? 'False' : outVal
        text += name + ': ' + outVal

      text += configText + spec.CurrentConfigName + '\n'

      text += customsText
      for name in spec.Customs
        text += name + '\n'

      text += regionText + spec.RegionFile + '\n'

      text += sensorText
      for name, isEnabled of spec.Sensors
        num = if isEnabled then '1' else '0'
        text += name + ', ' + num + '\n'

      text += mapText
      for name, mapping of spec.RegionMapping
        text += name + ' = ' + mapping.join(', ') + '\n'

      text += specText + spec.Spec + '\n'
      text += endText


Export
------

    module.exports = { generateSpecText }
