External Dependencies
---------------------

    React = require('react')
    classNames = require('classnames')

Prop List Component
-------------------

    PropList = React.createClass
      displayName: 'Prop List'

Define the component's layout

      render: () ->
        {data, title, propType, _highlightProp, _toggleProp, _addProp,
          _removeProp} = @props

        <div className='spec_editor_selectlist_container'>
          <div className='spec_editor_labels'>{title}</div>
          <ul className='spec_editor_selectlist'>
            {data.get(propType).map((checked, name) ->
              <li key={name} tabIndex='0'
                onClick={() -> _highlightProp(propType, name)}
                className={classNames({'spec_editor_selectlist_li_highlighted':
                  data.get(propType + 'Highlight') == name})}>
                {if propType == 'customprops' then ''
                else <input type='checkbox' value={name}
                    checked={checked}
                    onChange={() -> _toggleProp(propType, name)} />}
                {name}
              </li>
            ).toArray()}
          </ul>
          <ul className='spec_editor_buttonlist'>
            <li>
              <button onClick={() -> _addProp(propType)}>Add</button>
            </li>
            <li>
              <button disabled={data.get(propType).size <= 0}
                onClick={() -> _removeProp(propType)}>
                Remove</button>
            </li>
          </ul>
        </div>


Export
------

    module.exports = PropList
