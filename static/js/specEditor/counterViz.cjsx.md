External Dependencies
---------------------

    React = require('react')
    { Map } = require('immutable')
    classNames = require('classnames')

Spec Editor Counter Strategy Visualization Component
----------------------------------------------------

    SpecEditorCounterViz = React.createClass
      displayName: 'Specification Editor Counter Strategy Visualization'

Define the initial state

      getInitialState: () ->
        return { currentState: 0, currentRegion: 1 }

Sets the current state

      _setCurrentState: (currentState) ->
        @setState({currentState})

Sets the chosen region

      _chooseRegion: (chosenRegion) ->
        @setState({chosenRegion})

Define the component's layout

      render: () ->
        data = @props.data

        aut = data.get('autObj')
        # all possible successor regions
        possibleRegions = aut[@state.currentState]['successors'].map((successor) ->
          return aut[successor]['props']['region'])

        # get all successor states that contain the chosen region
        filteredSuccessors = aut[@state.currentState]['successors'].filter((successor) ->
          aut[successor]['props']['region'] == @state.chosenRegion)

        # get the props that can actually be changed in the chosen region
        propMaps = filteredSuccessors
          # reduce into array of actions, props
          .reduce(((arr, successor) ->
            # add up all values
            [Map(aut[successor]['props']['actuators']).map((value, name) ->
              if arr[0]? then value + arr[0].get(name) else value),
            Map(aut[successor]['props']['customs']).map((value, name) ->
              if arr[1]? then value + arr[1].get(name) else value)]
            ), [])
          .map((elemMap) ->
            # if the sum is in (0, len) then that means this prop
            # can change between the possible states
            elemMap.map((value) -> 
              if value == 0 or filteredSuccessors.length then 0 else 1
            ))


        <div id='spec_editor_bottom'>
          <div className='spec_editor_max_height'>
            <div className='spec_editor_workspace_left'>
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
                            (() ->
                              if index in possibleRegions
                                return 'rgb(' + region.color.join(',') + ')'
                              else
                                return '#000'
                            )()}
                          points={region.points.map((point) -> point.join(',')).join(' ')}
                          onClick={}/>
                      </g>
                    )}
                  </svg>
                )
              }
            </div>
            <div className='spec_editor_workspace_right'>
              <div className='spec_editor_labels'>Active locative phrases:</div>
              <ul className='spec_editor_selectlist' id='spec_editor_regions'>
                {Map(data.get('specObj').RegionMapping).keySeq().toArray().map((name) =>
                  <li key={name} tabIndex='0' onClick={() => @_selectDecomposed(name)}
                    className={classNames({'spec_editor_selectlist_li_highlighted':
                      name == @state.selectedDecomposed})}>
                    {name}</li>)}
              </ul>
            </div>
          </div>
        </div>


Export
------

    module.exports = SpecEditorCounterViz
