External Dependencies
---------------------

    React = require('react')
    classNames = require('classnames')

Spec Editor Menu Component
--------------------------

    SpecEditorMenu = React.createClass
      displayName: 'Specification Editor Menu'

Define the component's layout        

      render: () ->
        {data, _uploadSpec, _uploadRegions, _saveSpec,
          _saveCompiledArtifacts, _compileSpec, _toggleCompileOption,
          _changeCompileOption, _analyzeSpec, _showAbout} = @props

        <div id='menuh-container'>
          <div id='menuh'>
            <ul>
              <li><a>File &#x25BC</a>
                <ul>
                  <li>
                    <form>
                      <input name='spec' type='file' accept='.spec'
                        className='spec_editor_upload_file'
                        onChange={_uploadSpec} />
                      <a>Import Spec File...</a>
                    </form>
                  </li>
                  <li>
                    <form>
                      <input name='regions' type='file' accept='.regions'
                        className='spec_editor_upload_file'
                        onChange={_uploadRegions} />
                      <a>Import Region File...</a>
                    </form>
                  </li>
                  <li><a onClick={_saveSpec}>Save Spec</a></li>
                  <li><a href='/specEditor/saveZip' download
                    className={classNames({'spec_editor_save_link_disabled': !data.get('isCompiled')})}
                    onClick={_saveCompiledArtifacts}>
                    Save Zip</a></li>
                  <li><a href='/specEditor/saveAut' download
                    className={classNames({'spec_editor_save_link_disabled': !data.get('isCompiled')})}
                    onClick={_saveCompiledArtifacts}>
                    Save Aut</a></li>
                  <li><a href='/specEditor/saveLTL' download
                    className={classNames({'spec_editor_save_link_disabled': !data.get('isCompiled')})}
                    onClick={_saveCompiledArtifacts}>
                    Save LTL</a></li>
                  <li><a href='/specEditor/saveSMV' download
                    className={classNames({'spec_editor_save_link_disabled': !data.get('isCompiled')})}
                    onClick={_saveCompiledArtifacts}>
                    Save SMV</a></li>
                  <li><a href='/specEditor/saveDecomposed' download
                    className={classNames({'spec_editor_save_link_disabled': !data.get('isCompiled')})}
                    onClick={_saveCompiledArtifacts}>
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
                  <li><a onClick={_compileSpec}>Compile</a></li>
                  <li>
                    <a className='parent'>Compilation options &#x25b6</a>
                    <ul>
                      <li><a>
                        <input type='checkbox' name='convexify'
                          checked={data.getIn(['compile_options', 'convexify'])}
                          onChange={() => _toggleCompileOption('convexify')} />
                        Decompose workspace into convex regions</a></li>
                      <li><a>
                        <input type='checkbox' name='fastslow'
                          checked={data.getIn(['compile_options', 'fastslow'])}
                          onChange={() => _toggleCompileOption('fastslow')} />
                        Enable 'fast-slow' synthesis</a></li>
                      <li><a>
                        <input type='checkbox' name='use_region_bit_encoding'
                          checked={data.getIn(['compile_options', 'use_region_bit_encoding'])}
                          onChange={() => _toggleCompileOption('use_region_bit_encoding')} />
                        Use bit-vector region encoding</a></li>
                      <li><a className='parent'>Parser Mode &#x25b6</a>
                        <ul>
                          <li><a>
                            <input type='radio' name='parser_mode'
                              checked={data.getIn(['compile_options', 'parser']) == 'slurp'}
                              onChange={() => _changeCompileOption('parser', 'slurp')} />
                            SLURP (NL)</a></li>
                          <li><a>
                            <input type='radio' name='parser_mode'
                              checked={data.getIn(['compile_options', 'parser']) == 'structured'}
                              onChange={() => _changeCompileOption('parser', 'structured')} />
                            Structured English</a></li>
                          <li><a>
                            <input type='radio' name='parser_mode'
                              checked={data.getIn(['compile_options', 'parser']) == 'ltl'}
                              onChange={() => _changeCompileOption('parser', 'ltl')} />
                            LTL</a></li>
                        </ul>
                      </li>
                      <li><a className='parent'>Synthesizer &#x25b6</a>
                        <ul>
                          <li><a>
                            <input type='radio' name='synthesizer'
                              checked={data.getIn(['compile_options', 'synthesizer']) == 'jtlv'}
                              onChange={() => @_changeCompileOption('synthesizer', 'jtlv')} />
                            JTLV</a></li>
                          <li><a>
                            <input type='radio' name='synthesizer'
                              checked={data.getIn(['compile_options', 'synthesizer']) == 'slugs'}
                              onChange={() => _changeCompileOption('synthesizer', 'slugs')} />
                            Slugs</a></li>
                        </ul>
                      </li>
                      <li><a>
                        <input type='checkbox' name='symbolic'
                          checked={data.getIn(['compile_options', 'symbolic'])}
                          onChange={() => _toggleCompileOption('symbolic')} />
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
                  <li><a onClick={_analyzeSpec}>Analyze</a></li>
                  <li><a>View Automaton</a></li>
                  <li><a>Visualize Counterstrategy...</a></li>
                </ul>
              </li>
            </ul>
            <ul>
              <li><a>Help &#x25BC</a>
                <ul><li>
                  <a onClick={_showAbout}>About Specification Editor...</a>
                </li></ul>
              </li>
            </ul>
          </div>
        </div>


Export
------

    module.exports = SpecEditorMenu
