External Dependencies
---------------------

    require('draft-js/dist/Draft.css')
    {CompositeDecorator, Editor, EditorState,
      ContentState} = require('draft-js')
    React = require('react')

Syntax Highlighter Decorator
----------------------------

Create regexes for syntax highlighting

    COMMENT_REGEX = /\#.+/g

    commentStrategy = (contentBlock, callback) ->
      findWithRegex(COMMENT_REGEX, contentBlock, callback)

    propStrategy = (propRegex) -> (contentBlock, callback) ->
      findWithRegex(propRegex, contentBlock, callback)

Search for the regexes in the contentBlock's text
Callback on the (start, end) indices that we've found for the regex

    findWithRegex = (regex, contentBlock, callback) ->
      text = contentBlock.getText()
      matchArr = []
      start = -1
      while (matchArr = regex.exec(text)) != null
        start = matchArr.index
        callback(start, start + matchArr[0].length)

Components for rendering any text that fits the regexes

    PropSpan = (props) ->
      <span {...props} style={{color: 'blue'}}>{props.children}</span>

    CommentSpan = (props) ->
      <span {...props} style={{color: 'gray'}}>{props.children}</span>

Create the Decorator

    compositeDecorator = new CompositeDecorator([
      {strategy: commentStrategy,
      component: CommentSpan}
    ])

    newPropsDecorator = (regexes) -> new CompositeDecorator([
      {strategy: commentStrategy,
      component: CommentSpan}].concat(regexes.map((regex) ->
        {strategy: propStrategy(regex),
        component: PropSpan})))


Syntax Highlighter Component
----------------------------

    SyntaxHighlighter = React.createClass
      displayName: 'Syntax Highlighter'
      getInitialState: () ->
        {editorState: EditorState.createEmpty(compositeDecorator)}
      componentWillReceiveProps: (nextProps) ->
        if nextProps.regexes?
          @setState({editorState:
            EditorState.set(@state.editorState,
              {decorator: newPropsDecorator(nextProps.regexes)})
          })
      _focus: () -> @refs.editor.focus()
      _onChange: (editorState) -> @setState({editorState})
      getText: () -> @state.editorState.getCurrentContent().getPlainText()
      insertText: (text) ->
        @setState({editorState: EditorState.createWithContent(
          ContentState.createFromText(text))})
      render: () ->
        <div id='spec_editor_text' onClick={@_focus}>
          <Editor editorState={@state.editorState} onChange={@_onChange}
            placeholder='Write your specification here...' ref='editor' />
        </div>


Export
------

    module.exports = SyntaxHighlighter
