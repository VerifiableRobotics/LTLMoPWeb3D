External Dependencies
---------------------
    
    React = require('react')

Header Component
----------------

    Header = React.createClass
      render: () ->
        return <div id="heading">
            <h1>LTLMoPWeb3D Simulator</h1>
            <a href="/simulator">Simulator</a>
            <a href="/specEditor">Specification Editor</a>
            <a href="/regionEditor">Region Editor</a>
          </div>

Export
------

    module.exports = Header