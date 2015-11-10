External Dependencies
---------------------
    
    React = require('react')
    #{ Surface, Group, Shape, Text } = require('reactART')
    #{ Map } = require('immutable')

Internal Dependencies
---------------------

    Helpers = require('js/common/helpers.litcoffee')
    RegionsParser = require('js/common/regionsParser.litcoffee')

Region Editor Component
-------------------

    RegionEditor = React.createClass
      displayName: 'Region Editor'

Define the initial state

      getInitialState: () ->
        {
          regionObj: { Regions: [] }
        }

When a regions file is uploaded

      _onRegionsUpload: (ev) ->
        callback = (ev) => 
          regionObj = RegionsParser.parseRegions(ev.target.result)
          console.log('Regions Object: ')
          console.log(regionObj)
          @setState({ regionObj })
        Helpers.onUpload(ev, 'regions', callback)

Define the component layout

      render: () ->
        <div>
          <input type='file' name='regions' accept='.regions'
            onChange={@_onRegionsUpload} />
          <span>Import Regions...</span>
          {@state.regionObj.Regions
            .filter((region) -> region.name == 'boundary')
            .map((boundary) =>
            {# create svg with viewbox equal to boundary dimensions}
              <svg width={500} height={500}
                viewBox={boundary.position.join(' ') + ' ' + boundary.size.join(' ')}>
                {@state.regionObj.Regions.map((region, index) ->
                  <g key={index} transform={'translate(' + region.position.join(',') + ')'}>
                    <text>{region.name}</text>
                    {# stroke if boundary, fill otherwise}
                    <polygon 
                      fill={if region.name != 'boundary' then 'rgb(' + region.color.join(',') + ')' else ''}
                      stroke={if region.name == 'boundary' then 'rgb(' + region.color.join(',') + ')' else ''}
                      points={region.points.map((point) -> point.join(',')).join(' ')} />
                  </g>
                )}
              </svg>
            )
          }
        </div>

Export
------

    module.exports = RegionEditor
