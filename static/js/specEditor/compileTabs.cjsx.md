External Dependencies
---------------------

    React = require('react')
    { Tab, Tabs, TabList, TabPanel } = require('react-tabs')
    { Map } = require('immutable')
    classNames = require('classnames')

Spec Editor Compiled Output Tabs Component
------------------------------------------

    CompileTabs = React.createClass
      displayName: 'Compiled Output Tabs'

Define the initial state

      getInitialState: () ->
        return { selectedDecomposed: '' }

Selects a decomposed region based on its name

      _selectDecomposed: (name) ->
        @setState({'selectedDecomposed': name})

Define the component's layout

      render: () ->
        data = @props.data

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
                  <ul className='spec_editor_selectlist'>
                    {Map(data.get('specObj').RegionMapping).keySeq().toArray().map((name) =>
                      <li key={name} tabIndex='0' onClick={() => @_selectDecomposed(name)}
                        className={classNames({'spec_editor_selectlist_li_highlighted':
                          name == @state.selectedDecomposed})}>
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
                            <polygon fill={(() =>
                                if @state.selectedDecomposed != '' and
                                region.name in data.get('specObj').RegionMapping[@state.selectedDecomposed]
                                  return '#000'
                                else
                                  return 'rgb(' + region.color.join(',') + ')'
                              )()}
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


Export
------

    module.exports = CompileTabs
