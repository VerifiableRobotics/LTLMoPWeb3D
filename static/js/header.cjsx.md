External Dependencies
---------------------

    React = require('react')
    ReactDOM = require('react-dom')
    { Router, Route, IndexRoute, Link } = require('react-router')

Internal Dependencies
---------------------

    SpecEditor = require('./specEditor/specEditor.cjsx.md')
    RegionEditor = require('./regionEditor.cjsx.md')

Assets

    require('css/header.css')

Header Component
----------------

    Header = React.createClass
      displayName: 'Header'
      render: () ->
        <div className='max_height'>
          <div id='heading'>
            <h1>LTLMoPWeb3D Simulator</h1>
            <Link to='/simulator'> Simulator </Link>
            <Link to='/specEditor'> Specification Editor </Link>
            <Link to='/regionEditor'> Region Editor </Link>
          </div>
          {@props.children}
        </div>

Render the Router
----------------

    ReactDOM.render((
      <Router>
        <Route path='/' component={Header}>
          <IndexRoute component={SpecEditor} />
          <Route path='specEditor' component={SpecEditor} />
          <Route path='regionEditor' component={RegionEditor} />
        </Route>
      </Router>), document.getElementById('react_body'))
