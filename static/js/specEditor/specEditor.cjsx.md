External Dependencies
---------------------
    
    React = require('react')
    { Map } = require('immutable')
    classNames = require('classnames')

Internal Dependencies
---------------------

    Fetch = require('js/core/fetchHelpers.litcoffee')
    Helpers = require('js/core/helpers.litcoffee')
    SpecParser = require('js/core/specParser.litcoffee')
    RegionsParser = require('js/core/regionsParser.litcoffee')
    AutParser = require('js/core/automatonParser.litcoffee')
    Menu = require('./menu.cjsx.md')
    PropList = require('./propList.cjsx.md')
    CompileTabs = require('./compileTabs.cjsx.md')
    SyntaxHighlighter = require('./syntaxHighlighter.cjsx.md')

Assets

    require('css/specEditor.css')

Spec Editor Component
---------------------

    SpecEditor = React.createClass
      displayName: 'Specification Editor'

Define the initial state

      getInitialState: () ->
        return {
          data: Map({
            isCompiled: false
            compilerLog: ''
            ltlOutput: ''
            compile_options: Map({
              convexify: true
              fastslow: false
              use_region_bit_encoding: true
              parser: 'structured'
              synthesizer: 'jtlv'
              symbolic: false
            })
            regionsObj: { Regions: [] }
            decomposedObj: { Regions: [] }
            specObj: { RegionMapping: [] }
            autObj: {}
            regions: Map()
            sensors: Map()
            actuators: Map()
            customprops: Map()
          })
        }

Optimize component update cycle

      shouldComponentUpdate: (nextProps, nextState) ->
        return nextState.data != @state.data

Immutable setState helper

      setImmState: (fn) ->
        return @setState(({data}) -> {data: fn(data)})

Upload the regions file
Adds all the regions from a list of region objects

      _uploadRegions: (ev) ->
        RegionsParser.uploadRegions(ev.target.files[0], (regions) =>
          @setImmState((d) ->
            d.set('regionsObj', regions)
              .set('regions', regions.Regions.reduce(
                ((map, region) -> map.set(region.name,
                  Map({'checked': false, 'highlighted': false}))
                ), Map()
              ))
            ))

        # upload the regions file
        form = new FormData()
        form.append('file', ev.target.files[0])
        Fetch('/specEditor/uploadRegions', {
          method: 'post'
          body: form
        }).catch((error) ->
            console.error('regions upload failed')
            alert('The regions file upload failed!')
          )

Upload the spec file
Given the JSON version of a project object, import the spec

      _uploadSpec: (ev) ->
        # read the spec file
        SpecParser.uploadSpec(ev.target.files[0], (spec) =>
          @refs.editor.insertText(spec.Spec)
          @setImmState((d) ->
            # merge values
            d.set('specObj', spec).merge(Map({
              'compile_options': Map(spec.CompileOptions)
            # add props
            })).set('sensors', Map(spec.Sensors).map(
              (value, name) -> Map({'checked': value == 1, 'highlighted': false})
            )).set('actuators', Map(spec.Actions).map(
              (value, name) -> Map({'checked': value == 1, 'highlighted': false})
            )).set('customprops', spec.Customs.reduce(
              ((map, elem) ->
                map.set(elem, Map({'checked': false, 'highlighted': false}))
              ), Map()
            ))
          ))

        # upload the spec file
        form = new FormData()
        form.append('file', ev.target.files[0])
        Fetch('/specEditor/importSpec', {
          method: 'post'
          body: form
        }).catch((error) ->
            console.error('upload spec failed')
            alert('Uploading the spec failed!')
          )

Disable download if not yet compiled

      _saveCompiledArtifacts: (ev) ->
        if !@state.data.get('isCompiled')
          alert('You must compile the spec before saving this file!')
          ev.preventDefault()
          return false
      
Send json to create spec and then download spec

      _saveSpec: () ->
        Fetch('specEditor/createSpec', {
          method: 'post'
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
          body: @_createJSONForSpec()
        }).then(([data, request]) ->
            # change this to use iframe submit?
            # save the spec by opening the file in a new tab
            # downloads cannot be done via ajax
            window.open('specEditor/saveSpec', '_blank')
          ).catch((error) ->
            console.error('create spec failed')
            alert('The spec was unable to be saved')
          )
      
Compile the spec and set log + ltl

      _compileSpec: () ->
        Fetch('specEditor/compileSpec', {
          method: 'post'
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
          body: @_createJSONForSpec()
        }).then(([data, request]) => 
            @setImmState((d) ->
              d.set('isCompiled', true)
                .set('compilerLog', data.compilerLog))
            # download the other artifacts asynchronously
            @_downloadLTL()
            @_downloadDecomposed()
            @_downloadAut()
          ).catch((error) ->
            console.error('compile spec failed')
            alert('Spec compilation failed!')
          )

Download the ltl

      _downloadLTL: () ->
        Fetch('/specEditor/saveLTL', {method: 'post'}, {isBlob: true})
          .then(([data, request]) =>
            Helpers.onUpload(data, 'ltl',
              ((ltl) =>
                @setImmState (d) -> d.set('ltlOutput', ltl)
              ), {isBlob: true})
          ).catch((error) ->
            console.error('ltl download failed')
            alert('Downloading the LTL failed!')
          )

Download the decomposed regions

      _downloadDecomposed: () ->
        Fetch('/specEditor/saveDecomposed', {method: 'post'}, {isBlob: true})
          .then(([data, request]) =>
            RegionsParser.uploadRegions(data,
              ((decomposed) =>
                @setImmState (d) -> d.set('decomposedObj', decomposed)
              ), {isBlob: true})
          ).catch((error) -> 
            console.error('decompose download failed')
            alert('Downloading the decomposition failed!')
          )

Download the automaton

      _downloadAut: () ->
        Fetch('/specEditor/saveAut', {method: 'post'}, {isBlob: true})
          .then(([data, request]) =>
            AutParser.uploadAutomaton(data, @state.data.get('specObj'),
              ((aut) =>
                @setImmState (d) -> d.set('autObj', aut)
              ), {isBlob: true})
          ).catch((error) ->
            console.error('aut download failed')
            alert('Downloading the automaton failed!')
          )

Analyze the spec

      _analyzeSpec: () ->
        Fetch('specEditor/analyzeSpec', {method: 'get'})
          .then(([data, request]) -> alert(data.analyzeLog))
          .catch((error) ->
            console.error('analyze spec failed')
            alert('Spec analysis failed!')
          )

Toggle a compile option (checkboxes)

      _toggleCompileOption: (optionName) ->
        @setImmState((d) -> d.updateIn(['compile_options', optionName],
          (value) -> !value))

Change a compile option (radio buttons)

      _changeCompileOption: (optionName, newValue) ->
        @setImmState((d) -> d.setIn(['compile_options', optionName], newValue))
      
Adds a prop to the map with name as specified
Launches a prompt to ask for the prop's name

      _addProp: (mapName) ->
        promptText = 'Name of '
        defaultName = ''
        # set the prompt text and default based on map name
        switch mapName
          when 'sensors'
            promptText += 'Sensor:'
            defaultName = 'sensor'
          when 'actuators'
            promptText += 'Actuator:'
            defaultName = 'actuator'
          else 
            promptText += 'Custom Proposition:'
            defaultName = 'prop'
        count = 1
        # until we get 'name' + count that is not in the map
        until not @state.data.hasIn([mapName, defaultName + count])
          count += 1
        propName = prompt(promptText, defaultName + count)
        if propName == null # cancel was clicked
          return
        else if propName == ''
          alert('A blank name is not allowed')
        else if @state.data.hasIn([mapName, propName])
          alert('Duplicates are not allowed')
        else
          # add prop to the map
          @setImmState (d) -> 
            d.update(mapName, (propMap) -> 
              # unhighlight everything
              propMap.map((values, name) -> values.set('highlighted', false))
                .set(propName, Map({'checked': false, 'highlighted': true}))
            ) # add and highlight the new one
      
Highlights a prop based on its name and the map's name

      _highlightProp: (mapName, propName) ->
        @setImmState (d) -> d.update(mapName, (propMap) -> 
          # unhighlight everything
          propMap.map((values, name) -> values.set('highlighted', false))
            .setIn([propName, 'highlighted'], true) # highlight the clicked one
        )

Checks a prop based on its name and the map's name

      _toggleProp: (mapName, propName) ->
        @setImmState (d) ->
          d.updateIn([mapName, propName, 'checked'], (checked) -> !checked)

Removes the currently highlighted prop in the map with name as specified

      _removeProp: (mapName) ->
        @setImmState (d) -> d.update(mapName, (propMap) ->
          propMap.delete(propMap.findKey(
            (values) -> values.get('highlighted'))
          )
        )

Helpers to transform certain data

      _getEnabledSensors: () ->
        @state.data.get('sensors')
          .filter((values) -> values.get('checked')).keySeq().toArray()
      _getEnabledActuators: () ->
        @state.data.get('actuators')
          .filter((values) -> values.get('checked')).keySeq().toArray()
      _getAllCustoms: () -> @state.data.get('customprops').keySeq().toArray()
      _getAllRegions: () -> @state.data.get('regions').keySeq().toArray()

Creates and returns a JSON object that holds all spec information

      _createJSONForSpec: () ->
        data = {}
        data['compile_options'] = @state.data.get('compile_options').toJS()
        data['regionPath'] = @state.data.get('specObj').RegionFile

        specText = @refs.editor.getText()
        if specText != ''
          data['specText'] = specText
        
        # create arrays for props 
        data['all_sensors'] = @state.data.get('sensors').keySeq().toArray()
        data['enabled_sensors'] = @_getEnabledSensors()
        data['all_actuators'] = @state.data.get('actuators').keySeq().toArray()
        data['enabled_actuators'] = @_getEnabledActuators()
        data['all_customs'] = @_getAllCustoms()

        return data

Show about dialog 

      _showAbout: () ->
        alert('Specification Editor is part of the LTLMoP Toolkit.\nFor more information, please visit http://ltlmop.github.io')

Define the component's layout

      render: () ->
        data = @state.data
        menuProps = {data, @_uploadSpec, @_uploadRegions, @_saveSpec,
          @_saveCompiledArtifacts, @_compileSpec, @_toggleCompileOption,
          @_changeCompileOption, @_analyzeSpec, @_showAbout}
        propListProps = {data, @_highlightProp, @_toggleProp, @_addProp,
          @_removeProp}

        <div id='spec_editor_wrapper'>
          <Menu {...menuProps} />
          <div id='spec_editor_text_wrapper'>
            <SyntaxHighlighter ref='editor'
              regexes={@_getEnabledSensors().concat(@_getEnabledActuators(),
                @_getAllCustoms(), @_getAllRegions()).map((str) ->
                  new RegExp('(^|((\\s)+))' + str + '(((\\s)+)|$)', 'g'))} />
          </div>
          <div id='spec_editor_rightside'>
            <div className='spec_editor_selectlist_container'>
              <div className='spec_editor_labels'>Regions:</div>
              <ul className='spec_editor_selectlist'>
                {data.get('regions').filter((values, name) -> name != 'boundary')
                  .map((values, name) =>
                    <li key={name} tabIndex='0' onClick={() => @_highlightProp('regions', name)}
                      className={classNames({'spec_editor_selectlist_li_highlighted':
                        values.get('highlighted')})}>
                      {name}
                    </li>
                  ).toArray()}
              </ul>
              <ul className='spec_editor_buttonlist'>
                <li><button disabled={data.get('regions').size <= 0}>
                  Select from Map...</button></li>
                <li><button>Edit Regions...</button></li>
              </ul>
            </div>
            <PropList {...propListProps} title='Sensors:' propType='sensors' />
            <PropList {...propListProps} title='Actuators:'
              propType='actuators' />
            <PropList {...propListProps} title='Custom Propositions:'
              propType='customprops' />
          </div>
          <CompileTabs data={data} />
        </div>

Export
------

    module.exports = SpecEditor
