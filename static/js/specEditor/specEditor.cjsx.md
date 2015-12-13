External Dependencies
---------------------
    
    React = require('react')
    ReactDOM = require('react-dom')
    { Tab, Tabs, TabList, TabPanel } = require('react-tabs');
    { Map } = require('immutable')
    classNames = require('classnames')

Internal Dependencies
---------------------

    Fetch = require('plugins/fetchHelpers.litcoffee')
    SpecParser = require('js/lib/specParser.litcoffee')
    RegionsParser = require('js/lib/regionsParser.litcoffee')
    AutParser = require('js/lib/automatonParser.litcoffee')
    SpecEditorMenu = require('./specEditorMenu.cjsx.md')

Assets

    require('css/specEditor.css')

Main Program
------------

Initial set up

    specObj = { RegionMapping: [] }
    autObj = {}


Spec Editor Component
---------------------

    SpecEditor = React.createClass
      displayName: 'Specification Editor'

Define the initial state

      getInitialState: () ->
        return {
          data: Map({
            isCompiled: false
            specText: ''
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
            regions: Map()
            selectedDecomposed: ''
            regionsObj: { Regions: [] }
            decomposedObj: { Regions: [] }
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

      _uploadRegions: (ev) ->
        RegionsParser.uploadRegions(ev.target.files[0], (regions) =>
          @setImmState (d) -> d.set('regionsObj', regions)
          @_createRegions(regions))
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

      _uploadSpec: (ev) ->
        # read the spec file
        SpecParser.uploadSpec(ev.target.files[0], (spec) => 
          specObj = spec
          @_importSpec(specObj))
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
                .set('compilerLog', data.compilerLog)
                .set('ltlOutput', data.ltlOutput))
            @_downloadDecomposed()
          ).catch((error) ->
            console.error('compile spec failed')
            alert('Spec compilation failed!')
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

Change the spec text

      _changeSpecText: (ev) ->
        @setImmState((d) -> d.set('specText', ev.target.value))
      
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

Selects a decomposed region based on its name

      _selectDecomposed: (name) -> 
        @setImmState (d) -> d.set('selectedDecomposed', name)

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
      
Adds all the regions from a list of region objects

      _createRegions: (regionsObj) ->
        @setImmState (d) -> 
          d.set('regions', regionsObj.Regions.reduce(
              ((map, region) -> map.set(region.name, 
                Map({'checked': false, 'highlighted': false}))
              ), Map()
            ))

Given the JSON version of a project object, import the spec

      _importSpec: (spec) ->
        @setImmState (d) ->
          # merge values
          d.merge(Map({
            'specText': spec.Spec
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

Creates and returns a JSON object that holds all spec information

      _createJSONForSpec: () ->
        data = {}
        data['compile_options'] = @state.data.get('compile_options').toJS()
        data['regionPath'] = specObj.RegionFile

        specText = @state.data.get('specText')
        if specText != ''
          data['specText'] = specText
        
        # create arrays for props 
        data['all_sensors'] = @state.data.get('sensors').keySeq().toArray()
        data['enabled_sensors'] = @state.data.get('sensors')
          .filter((values) -> values.get('checked')).keySeq().toArray()
        data['all_actuators'] = @state.data.get('actuators').keySeq().toArray()
        data['enabled_actuators'] = @state.data.get('actuators')
          .filter((values) -> values.get('checked')).keySeq().toArray()
        data['all_customs'] = @state.data.get('customprops').keySeq().toArray()

        return data

Show about dialog 

      _showAbout: () ->
        alert('Specification Editor is part of the LTLMoP Toolkit.\nFor more information, please visit http://ltlmop.github.io')

Define the component's layout

      render: () ->
        data = @state.data
        specEditorMenuProps = {data, @_uploadSpec, @_uploadRegions, @_saveSpec,
          @_saveCompiledArtifacts, @_compileSpec, @_toggleCompileOption,
          @_changeCompileOption, @_analyzeSpec, @_showAbout}

        <div id='spec_editor_wrapper'>
          <SpecEditorMenu {...specEditorMenuProps} />
          <div id='spec_editor_text_wrapper'>
            <textarea id='spec_editor_text'
              placeholder='Write your specification here...'
              value={data.get('specText')}
              onChange={@_changeSpecText} />
          </div>
          <div id='spec_editor_rightside'>
            <div className='spec_editor_labels'>Regions:</div>
            <ul className='spec_editor_selectlist' id='spec_editor_regions'>
              {data.get('regions').filter((values, name) -> name != 'boundary')
                .map((values, name) =>
                  <li key={name} tabIndex='0' onClick={() => @_highlightProp('regions', name)}
                    className={classNames({'spec_editor_selectlist_li_highlighted':
                      values.get('highlighted')})}>
                    {name}</li>).toArray()}
            </ul>
            <ul className='spec_editor_buttonlist'>
              <li><button disabled={data.get('regions').size <= 0}>
                Select from Map...</button></li>
              <li><button>Edit Regions...</button></li>
            </ul>
            <div className='spec_editor_labels'>Sensors:</div>
            <ul className='spec_editor_selectlist'>
              {data.get('sensors').map((values, name) =>
                <li key={name} tabIndex='0' onClick={() => @_highlightProp('sensors', name)}
                  className={classNames({'spec_editor_selectlist_li_highlighted':
                    values.get('highlighted')})}>
                  <input type='checkbox' value={name} checked={values.get('checked')}
                    onChange={() => @_toggleProp('sensors', name)} />
                  {name}
                </li>
              ).toArray()}
            </ul>
            <ul className='spec_editor_buttonlist'>
              <li>
                <button onClick={() => @_addProp('sensors')}>Add</button>
              </li>
              <li>
                <button disabled={data.get('sensors').size <= 0}
                  onClick={() => @_removeProp('sensors')}>
                  Remove</button>
              </li>
            </ul>
            <div className='spec_editor_labels'>Actuators:</div>
            <ul className='spec_editor_selectlist'>
              {data.get('actuators').map((values, name) =>
                <li key={name} tabIndex='0' onClick={() => @_highlightProp('actuators', name)}
                  className={classNames({'spec_editor_selectlist_li_highlighted':
                    values.get('highlighted')})}>
                  <input type='checkbox' value={name} checked={values.get('checked')}
                    onChange={() => @_toggleProp('actuators', name)} />
                  {name}
                </li>
              ).toArray()}
            </ul>
            <ul className='spec_editor_buttonlist'>
              <li>
                <button onClick={() => @_addProp('actuators')}>
                  Add</button>
              </li>
              <li>
                <button disabled={data.get('actuators').size <= 0}
                  onClick={() => @_removeProp('actuators')}>
                  Remove</button>
              </li>
            </ul>
            <div className='spec_editor_labels'>Custom Propositions:</div>
            <ul className='spec_editor_selectlist'>
              {data.get('customprops').map((values, name) =>
                <li key={name} tabIndex='0' onClick={() => @_highlightProp('customprops', name)}
                  className={classNames({'spec_editor_selectlist_li_highlighted':
                    values.get('highlighted')})}>
                  {name}
                </li>
              ).toArray()}
            </ul>
            <ul className='spec_editor_buttonlist'>
              <li>
                <button onClick={() => @_addProp('customprops')}>
                  Add</button>
              </li>
              <li>
                <button disabled={data.get('customprops').size <= 0}
                  onClick={() => @_removeProp('customprops')}>
                  Remove</button>
              </li>
            </ul>
          </div>
          <div id='spec_editor_bottom'>
            <Tabs className='spec_editor_max_height'>
              <TabList>
                <Tab>Compiler Log</Tab>
                <Tab>LTL Output</Tab>
                <Tab>Workspace Decomposition</Tab>
              </TabList>
              <TabPanel className='spec_editor_bottom_div'>
                <div className='spec_editor_max_height'>
                  <textarea className='spec_editor_bottom_textarea' disabled
                    value={data.get('compilerLog')} />
                </div>
              </TabPanel>
              <TabPanel className='spec_editor_bottom_div'>
                <div className='spec_editor_max_height'>
                  <textarea className='spec_editor_bottom_textarea' disabled
                    value={data.get('ltlOutput')} />
                </div>
              </TabPanel>
              <TabPanel className='spec_editor_bottom_div'>
                <div className='spec_editor_max_height'>
                  <div className='spec_editor_workspace_left'>
                    <div className='spec_editor_labels'>Active locative phrases:</div>
                    <ul className='spec_editor_selectlist' id='spec_editor_regions'>
                      {Map(specObj.RegionMapping).keySeq().toArray().map((name) =>
                        <li key={name} tabIndex='0' onClick={() => @_selectDecomposed(name)}
                          className={classNames({'spec_editor_selectlist_li_highlighted':
                            name == data.get('selectedDecomposed')})}>
                          {name}</li>)}
                    </ul>
                  </div>
                  <div className='spec_editor_workspace_right'>
                    {data.get('regionsObj').Regions
                      .filter((region) -> region.name == 'boundary')
                      .map((boundary, index) =>
                        <svg key={index} width={1000} height={150}
                          viewBox={boundary.position.join(' ') + ' ' + boundary.size.join(' ')}>
                          {data.get('decomposedObj').Regions.map((region, index) =>
                            <g key={index} transform={'translate(' + region.position.join(',') + ')'}>
                              <text>{region.name}</text>
                              <polygon
                                fill={
                                  if data.get('selectedDecomposed') != '' && specObj.RegionMapping[data.get('selectedDecomposed')].indexOf(region.name) != -1 then '#000' else 'rgb(' + region.color.join(',') + ')'}
                                points={region.points.map((point) -> point.join(',')).join(' ')} />
                            </g>
                          )}
                        </svg>
                      )
                    }
                  </div>
                </div>
              </TabPanel>
            </Tabs>
          </div>
        </div>

Export
------

    module.exports = SpecEditor
