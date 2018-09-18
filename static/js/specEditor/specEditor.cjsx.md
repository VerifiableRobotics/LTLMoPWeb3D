External Dependencies
---------------------

    React = require('react')
    { Map } = require('immutable')
    classNames = require('classnames')

Internal Dependencies
---------------------

    Fetch = require('js/core/fetchHelpers.litcoffee')
    Helpers = require('js/core/helpers.litcoffee')
    SpecAPI = require('js/core/spec/specAPI.litcoffee')
    RegionsAPI = require('js/core/regions/regionsAPI.litcoffee')
    AutAPI = require('js/core/automatonParser.litcoffee')
    Menu = require('./menu.cjsx.md')
    PropList = require('./propList.cjsx.md')
    CompileTabs = require('./compileTabs.cjsx.md')
    SyntaxHighlighter = require('./syntaxHighlighter.cjsx.md')

Assets

    require('css/specEditor.css')

Initial set up

    specURL = null

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
        Helpers.onUpload(ev.target.files[0], 'regions')
          .then(RegionsAPI.parse)
          .then((regions) => @setImmState((d) ->
            d.set('regionsObj', regions)
              .set('regions', regions.Regions.reduce(
                ((map, region) -> map.set(region.name, false)), Map()
              ))
            ))

Upload the spec file
Given the JSON version of a project object, import the spec

      _uploadSpec: (ev) ->
        # read the spec file
        Helpers.onUpload(ev.target.files[0], 'spec')
          .then(SpecAPI.parse)
          .then((spec) =>
            @refs.editor.insertText(spec.Spec)
            @setImmState((d) ->
              # merge values
              d.set('specObj', spec).merge(Map({
                'compile_options': Map(spec.CompileOptions)
              # add props
              })).set('sensors', Map(spec.Sensors))
              .set('actuators', Map(spec.Actions))
              .set('customprops', spec.Customs.reduce(
                ((map, elem) -> map.set(elem, false)), Map()
              ))
            ))

Disable download if not yet compiled

      _saveCompiledArtifacts: (ev) ->
        if !@state.data.get('isCompiled')
          alert('You must compile the spec before saving this file!')
          ev.preventDefault()
          return false

Generate text from spec object, create Blob of it, then save it

      _saveSpec: () ->
        specURL = Helpers.createFileURL(@_generateSpecText(), specURL)
        # change this to use iframe submit?
        # save the spec by opening the file in a new tab
        # downloads cannot be done via ajax
        window.open(specURL, '_blank')

Compile the spec and set log + ltl

      _compileSpec: () ->
        # upload the spec and regions file
        form = new FormData()
        form.append('spec', new Blob([@_generateSpecText()]))
        form.append('regions', new Blob([@_generateRegionsText()]))
        Fetch('/specEditor/compileSpec', {
          method: 'post'
          body: form
        }).catch((error) ->
            console.error('compile spec failed')
            alert('Spec compilation failed!')
          ).then(([data, request]) =>
            @setImmState((d) ->
              d.set('isCompiled', true)
                .set('compilerLog', data.compilerLog))
            # download the other artifacts asynchronously
            @_downloadLTL()
            @_downloadDecomposed()
            @_downloadAut()
          )

Download the ltl

      _downloadLTL: () ->
        Fetch('/specEditor/saveLTL', {}, {isBlob: true})
          .catch((error) ->
            console.error('ltl download failed')
            alert('Downloading the LTL failed!')
          ).then(([data, request]) =>
            Helpers.onUpload(data, 'ltl', {isBlob: true})
          ).then((ltl) => @setImmState (d) -> d.set('ltlOutput', ltl))

Download the decomposed regions

      _downloadDecomposed: () ->
        Fetch('/specEditor/saveDecomposed', {}, {isBlob: true})
          .catch((error) ->
            console.error('decompose download failed')
            alert('Downloading the decomposition failed!')
          ).then(([data, request]) =>
            Helpers.onUpload(data, 'regions', {isBlob: true})
          ).then(RegionsAPI.parse)
          .then((decomposed) =>
            @setImmState (d) -> d.set('decomposedObj', decomposed)
          )

Download the automaton

      _downloadAut: () ->
        Fetch('/specEditor/saveAut', {}, {isBlob: true})
          .catch((error) ->
            console.error('aut download failed')
            alert('Downloading the automaton failed!')
          ).then(([data, request]) =>
            Helpers.onUpload(data, 'aut', {isBlob: true})
          ).then((file) => AutAPI.parse(file, @state.data.get('specObj')))
          .then((aut) => @setImmState (d) -> d.set('autObj', aut))

Analyze the spec

      _analyzeSpec: () ->
        Fetch('specEditor/analyzeSpec', {})
          .catch((error) ->
            console.error('analyze spec failed')
            alert('Spec analysis failed!')
          ).then(([data, request]) -> alert(data.analyzeLog))

Toggle a compile option (checkboxes)

      _toggleCompileOption: (optionName) ->
        @setImmState((d) -> d.updateIn(['compile_options', optionName],
          (checked) -> !checked))

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
          # add and highlight the new prop
          @setImmState (d) ->
            d.update(mapName, (propMap) ->  propMap.set(propName, false))
              .set(mapName + 'Highlight', propName)

Highlights a prop based on its name and the map's name

      _highlightProp: (mapName, propName) ->
        @setImmState (d) -> d.set(mapName + 'Highlight', propName)

Checks a prop based on its name and the map's name

      _toggleProp: (mapName, propName) ->
        @setImmState (d) ->
          d.updateIn([mapName, propName], (checked) -> !checked)

Removes the currently highlighted prop in the map with name as specified

      _removeProp: (mapName) ->
        @setImmState (d) -> d.update(mapName, (propMap) ->
          propMap.delete(d.get(mapName + 'Highlight')))

Helpers to transform certain data

      _getEnabledSensors: () ->
        @state.data.get('sensors')
          .filter((checked) -> checked).keySeq().toArray()
      _getEnabledActuators: () ->
        @state.data.get('actuators')
          .filter((checked) -> checked).keySeq().toArray()
      _getAllCustoms: () -> @state.data.get('customprops').keySeq().toArray()
      _getAllRegions: () -> @state.data.get('regions').keySeq().toArray()

Updates the current spec object with the inputted properties and returns it

      _createSpecObj: () ->
        specObj = @state.data.get('specObj')
        specObj.CompileOptions = @state.data.get('compile_options').toJS()
        # DO NOT CHANGE -- matches server-set filename
        specObj.RegionFile = 'regions.regions'

        specObj.Spec = @refs.editor.getText()

        specObj.Sensors = @state.data.get('sensors').toJS()
        specObj.Actions = @state.data.get('actuators').toJS()
        specObj.Customs = @_getAllCustoms()

        return specObj

Shortcut function

      _generateSpecText: () ->
        return SpecAPI.generateText(@_createSpecObj())

Shortcut function

      _generateRegionsText: () ->
        return RegionsAPI.generateText(@state.data.get('regionsObj'))

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
                {data.get('regions').filter((_, name) -> name != 'boundary')
                  .map((_, name) =>
                    <li key={name} tabIndex='0' onClick={() => @_highlightProp('regions', name)}
                      className={classNames({'spec_editor_selectlist_li_highlighted':
                        data.get('regionsHighlight') == name})}>
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
