External Dependencies
---------------------
    
    React = require('react')
    ReactDOM = require('react-dom')
    { Tab, Tabs, TabList, TabPanel } = require('react-tabs');
    { Map } = require('immutable')
    classNames = require('classnames')

Internal Dependencies
---------------------

    Header = require('../header.cjsx.md')
    { Fetch } = require('../../plugins/fetchHelpers.litcoffee')

Main Program
------------      

Spec Editor Component
-------------------

    SpecEditor = React.createClass               

Define the initial state

      getInitialState: () ->
        return {data: Map({
          isCompiled: false
          specText: ''
          regionPath: ''
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
          sensors: Map()
          actuators: Map()
          customprops: Map()
        })}

Optimize component update cycle

      shouldComponentUpdate: (nextProps, nextState) ->
        return nextState.data != @state.data

Immutable setState helper

      setImmState: (fn) ->
        return @setState(({data}) -> {data: fn(data)})

Hook onto mount event

      componentDidMount: () -> 
        # TODO: create react highlighter (contenteditable)
        # create a lined text area with a largely borrowed plugin
        $('#spec_editor_text').linedtextarea() 

Upload the regions file

      _uploadRegions: (ev) ->
        form = new FormData()
        form.append('file', ev.target.files[0])
        Fetch('/specEditor/uploadRegions', {
          method: 'post'
          body: form
        }).then(([data, request]) => 
            @_createRegions(data.theList, data.thePath)
          ).catch((error) ->
            console.error('regions upload failed')
            alert('The regions file upload failed!')
          )

Upload the spec file

      _uploadSpec: (ev) ->
        form = new FormData()
        form.append('file', ev.target.files[0])
        Fetch('/specEditor/importSpec', {
          method: 'post'
          body: form
        }).then(([data, request]) => @_importSpec(data)) 
          .catch((error) ->
            console.error('import spec failed')
            alert('Importing the spec failed!')
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
            window.open('specEditor/saveSpec', _blank)
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
        }).then(([data, request]) => @setImmState((d) ->
            d.set('isCompiled', true)
              .set('compilerLog', data.compilerLog)
              .set('ltlOutput', data.ltlOutput)
          )).catch((error) ->
            console.error('compile spec failed')
            alert('Spec compilation failed!')
          )

Analyze the spec

      _analyzeSpec: () ->
        Fetch('specEditor/analyzeSpec', {
          method: 'get'
        }).then(([data, request]) -> alert(data.analyzeLog))
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

Checks a prop based on its name and the map's name

      _checkProp: (mapName, propName) ->
        @setImmState (d) -> d.setIn([mapName, propName, 'checked'], true)

Removes the currently highlighted prop in the map with name as specified

      _removeProp: (mapName) ->
        @setImmState (d) -> d.update(mapName, (propMap) ->
          propMap.delete(propMap.findKey(
            (values) -> values.get('highlighted'))
          )
        )
      
Adds all the regions from a list of region objects
Also save the regionPath from the spec

      _createRegions: (regionList, regionPath) ->
        @setImmState (d) -> 
          d.set('regionPath', regionPath)
            .set('regions', regionList.reduce(
              ((map, region) -> map.set(region.name, 
                Map({'checked': false, 'highlighted': false}))),
              Map()
            ))

Given the JSON version of a project object, import the spec

      _importSpec: (proj) ->
        @setImmState((d) ->
          # merge values
          d.merge(Map({
            'specText': proj['specText']
            'compile_options': Map(proj['compile_options'])
            'regionPath': proj['regionPath']
          # add props
          }).set('sensors', proj['all_sensors'].reduce(
            ((map, name) -> 
              map.set(name, Map({
                'checked': proj['enabled_sensors'].indexOf(name) != -1
                'highlighted': false
              }))),
            Map()
          )).set('actuators', proj['all_actuators'].reduce(
            ((map, name) -> 
              map.set(name, Map({
                'checked': proj['enabled_actuators'].indexOf(name) != -1
                'highlighted': false
              }))),
            Map()
          )).set('customprops', proj['all_customs'].reduce(
            ((map, name) -> 
              map.set(name, Map({'checked': false, 'highlighted': false}))),
            Map()
          ))))

Creates and returns a JSON object that holds all spec information

      _createJSONForSpec: () ->
        data = {}
        data['compile_options'] = @state.data.get('compile_options').toJS()
        data['regionPath'] = @state.data.get('regionPath')

        specText = @state.data.get('specText')
        if specText != ''
          data['specText'] = specText
        
        # create arrays for props 
        data['all_sensors'] = @state.data.get('sensors')
          .reduce(((arr, values, name) -> arr.concat(name)), [])
        data['enabled_sensors'] = @state.data.get('sensors')
          .filter((values) -> values.get('checked'))
          .reduce(((arr, values, name) -> arr.concat(name)), [])
        data['all_actuators'] = @state.data.get('actuators')
          .reduce(((arr, values, name) -> arr.concat(name)), [])
        data['enabled_actuators'] = @state.data.get('actuators')
          .filter((values) -> values.get('checked'))
          .reduce(((arr, values, name) -> arr.concat(name)), [])
        data['all_customs'] = @state.data.get('customprops')
          .reduce(((arr, values, name) -> arr.concat(name)), [])

        return data

Show about dialog 

      _showAbout: () ->
        alert('Specification Editor is part of the LTLMoP Toolkit.\nFor more information, please visit http://ltlmop.github.io')

Render the component

      render: () ->
        <div id='spec_editor_body_inner' className='spec_editor_max_height'>
          <Header />
          <div id='spec_editor_wrapper'>
            <div id='menuh-container'>
              <div id='menuh'>
                <ul>
                  <li><a>File &#x25BC</a>
                    <ul>
                      <li>
                        <form>
                          <input name='spec'
                            type='file'
                            accept='.spec'
                            className='spec_editor_upload_file'
                            onChange={@_uploadSpec} />
                          <a>Import Spec File...</a>
                        </form>
                      </li>
                      <li>
                        <form>
                          <input name='regions'
                            type='file'
                            accept='.regions'
                            className='spec_editor_upload_file'
                            onChange={@_uploadRegions} />
                          <a>Import Region File...</a>
                        </form>
                      </li>
                      <li><a onClick={@_saveSpec}>Save Spec</a></li>
                      <li><a href='/specEditor/saveZip' download
                        className={classNames({'spec_editor_save_link_disabled': !@state.data.get('isCompiled')})}
                        onClick={@_saveCompiledArtifacts}>
                        Save Zip</a></li>
                      <li><a href='/specEditor/saveAut' download
                        className={classNames({'spec_editor_save_link_disabled': !@state.data.get('isCompiled')})}
                        onClick={@_saveCompiledArtifacts}>
                        Save Aut</a></li>
                      <li><a href='/specEditor/saveLTL' download
                        className={classNames({'spec_editor_save_link_disabled': !@state.data.get('isCompiled')})}
                        onClick={@_saveCompiledArtifacts}>
                        Save LTL</a></li>
                      <li><a href='/specEditor/saveSMV' download
                        className={classNames({'spec_editor_save_link_disabled': !@state.data.get('isCompiled')})}
                        onClick={@_saveCompiledArtifacts}>
                        Save SMV</a></li>
                      <li><a href='/specEditor/saveDecomposed' download
                        className={classNames({'spec_editor_save_link_disabled': !@state.data.get('isCompiled')})}
                        onClick={@_saveCompiledArtifacts}>
                        Save Decomposed</a></li>
                    </ul>
                  </li>
                </ul>
                <ul>  
                  <li><a>Edit &#x25BC</a>
                    <ul>
                      <li><a>Undo</a></li>
                      <li><a>Redo</a></li>
                      <li><a>Cut</a></li>
                      <li><a>Copy</a></li>
                      <li><a>Paste</a></li>
                    </ul>
                  </li>
                </ul>
                <ul>  
                  <li><a>Run &#x25BC</a>
                    <ul>
                      <li><a onClick={@_compileSpec}>Compile</a></li>
                      <li>
                        <a className='parent'>Compilation options &#x25b6</a>
                        <ul>
                          <li><a>
                            <input type='checkbox' name='convexify'
                              checked={@state.data.getIn(['compile_options', 'convexify'])}
                              onChange={() => @_toggleCompileOption('convexify')} />
                            Decompose workspace into convex regions</a></li>
                          <li><a>
                            <input type='checkbox' name='fastslow'
                              checked={@state.data.getIn(['compile_options', 'fastslow'])}
                              onChange={() => @_toggleCompileOption('fastslow')} />
                            Enable 'fast-slow' synthesis</a></li>
                          <li><a>
                            <input type='checkbox' name='use_region_bit_encoding'
                              checked={@state.data.getIn(['compile_options', 'use_region_bit_encoding'])}
                              onChange={() => @_toggleCompileOption('use_region_bit_encoding')} />
                            Use bit-vector region encoding</a></li>
                          <li><a className='parent'>Parser Mode &#x25b6</a>
                            <ul>
                              <li><a>
                                <input type='radio' name='parser_mode'
                                  checked={@state.data.getIn(['compile_options', 'parser']) == 'slurp'}
                                  onChange={() => @_changeCompileOption('parser', 'slurp')} />
                                SLURP (NL)</a></li>
                              <li><a>
                                <input type='radio' name='parser_mode'
                                  checked={@state.data.getIn(['compile_options', 'parser']) == 'structured'}
                                  onChange={() => @_changeCompileOption('parser', 'structured')} />
                                Structured English</a></li>
                              <li><a>
                                <input type='radio' name='parser_mode'
                                  checked={@state.data.getIn(['compile_options', 'parser']) == 'ltl'}
                                  onChange={() => @_changeCompileOption('parser', 'ltl')} />
                                LTL</a></li>
                            </ul>
                          </li>
                          <li><a className='parent'>Synthesizer &#x25b6</a>
                            <ul>
                              <li><a>
                                <input type='radio' name='synthesizer'
                                  checked={@state.data.getIn(['compile_options', 'synthesizer']) == 'jtlv'}
                                  onChange={() => @_changeCompileOption('synthesizer', 'jtlv')} />
                                JTLV</a></li>
                              <li><a>
                                <input type='radio' name='synthesizer'
                                  checked={@state.data.getIn(['compile_options', 'synthesizer']) == 'slugs'}
                                  onChange={() => @_changeCompileOption('synthesizer', 'slugs')} />
                                Slugs</a></li>
                            </ul>
                          </li>
                          <li><a>
                            <input type='checkbox' name='symbolic'
                              checked={@state.data.getIn(['compile_options', 'symbolic'])}
                              onChange={() => @_toggleCompileOption('symbolic')} />
                            Use symbolic strategy</a></li>
                        </ul>
                      </li>
                      <li><a>Simulate</a></li>
                      <li><a>Configure Simulation...</a></li>
                    </ul>
                  </li>
                </ul>
                <ul>  
                  <li><a>Debug &#x25BC</a>
                    <ul>
                      <li><a onClick={@_analyzeSpec}>Analyze</a></li>
                      <li><a>View Automaton</a></li>
                      <li><a>Visualize Counterstrategy...</a></li>
                    </ul>
                  </li>
                </ul> 
                <ul>  
                  <li><a>Help &#x25BC</a>
                    <ul><li>
                      <a onClick={@_showAbout}>About Specification Editor...</a>
                    </li></ul>
                  </li>
                </ul> 
              </div>
            </div>
            <div id='spec_editor_text_wrapper'>
              <textarea id='spec_editor_text' 
                placeholder='Write your specification here...'
                value={@state.data.get('specText')}
                onChange={@_changeSpecText} />
            </div>
            <div id='spec_editor_rightside'>
              <div className='spec_editor_labels'>Regions:</div>
              <ul className='spec_editor_selectlist' id='spec_editor_regions'>
                {@state.data.get('regions').filter((values, name) -> name != 'boundary')
                  .map((values, name) =>
                    <li tabIndex='0' onClick={() => @_highlightProp('regions', name)}
                      className={classNames({'spec_editor_selectlist_li_highlighted':
                        values.get('highlighted')})}>
                      {name}</li>)}
              </ul>
              <ul className='spec_editor_buttonlist'>
                <li><button disabled={@state.data.get('regions').size <= 0}>
                  Select from Map...</button></li>
                <li><button>Edit Regions...</button></li>
              </ul>
              <div className='spec_editor_labels'>Sensors:</div>
              <ul className='spec_editor_selectlist'>
                {@state.data.get('sensors').map((values, name) =>
                  <li tabIndex='0' onClick={() => @_highlightProp('sensors', name)}
                    className={classNames({'spec_editor_selectlist_li_highlighted':
                      values.get('highlighted')})}>
                    <input type='checkbox' value={name} checked={values.get('checked')}
                      onChange={() => @_checkProp('sensors', name)} />
                    {name}
                  </li>
                )}
              </ul>
              <ul className='spec_editor_buttonlist'>
                <li>
                  <button onClick={() => @_addProp('sensors')}>Add</button>
                </li>
                <li>
                  <button disabled={@state.data.get('sensors').size <= 0}
                    onClick={() => @_removeProp('sensors')}>
                    Remove</button>
                </li>
              </ul>
              <div className='spec_editor_labels'>Actuators:</div>
              <ul className='spec_editor_selectlist'>
                {@state.data.get('actuators').map((values, name) =>
                  <li tabIndex='0' onClick={() => @_highlightProp('actuators', name)}
                    className={classNames({'spec_editor_selectlist_li_highlighted':
                      values.get('highlighted')})}>
                    <input type='checkbox' value={name} checked={values.get('checked')}
                      onChange={() => @_checkProp('actuators', name)} />
                    {name}
                  </li>
                )}
              </ul>
              <ul className='spec_editor_buttonlist'>
                <li>
                  <button onClick={() => @_addProp('actuators')}>
                    Add</button>
                </li>
                <li>
                  <button disabled={@state.data.get('actuators').size <= 0}
                    onClick={() => @_removeProp('actuators')}>
                    Remove</button>
                </li>
              </ul>
              <div className='spec_editor_labels'>Custom Propositions:</div>
              <ul className='spec_editor_selectlist'>
                {@state.data.get('customprops').map((values, name) =>
                  <li tabIndex='0' onClick={() => @_highlightProp('customprops', name)}
                    className={classNames({'spec_editor_selectlist_li_highlighted':
                      values.get('highlighted')})}>
                    {name}
                  </li>
                )}
              </ul>
              <ul className='spec_editor_buttonlist'>
                <li>
                  <button onClick={() => @_addProp('customprops')}>
                    Add</button>
                </li>
                <li>
                  <button disabled={@state.data.get('customprops').size <= 0}
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
                      value={@state.data.get('compilerLog')} />
                  </div>
                </TabPanel>
                <TabPanel className='spec_editor_bottom_div'>
                  <div className='spec_editor_max_height'>
                    <textarea className='spec_editor_bottom_textarea' disabled 
                      value={@state.data.get('ltlOutput')} />
                  </div>
                </TabPanel>
                <TabPanel className='spec_editor_bottom_div'>
                  <div className='spec_editor_max_height'>
                    Workspace Decomposition</div>
                </TabPanel>
              </Tabs>
            </div>
          </div>
        </div>

And render!

    currentSpecEditor = ReactDOM.render(<SpecEditor />, document.getElementById('spec_editor_body'))
