Common Helper functions used throughout LTLMoPWeb3D
---------------------------------------------------

Helper for uploading and reading files
Takes in the event, an extension, and the file reader's callback'

    onUpload = (ev, ext, callback) ->
      file = ev.target.files[0]
      if file?
        nameSplit = file.name.split('.')
        extension = nameSplit[nameSplit.length - 1]
        # validation
        if extension != ext
          alert('This only accepts *.' + ext + ' files!')
        else
          reader = new FileReader()
          reader.onload = callback
          reader.readAsText(file)

Export
------

    module.exports ={
      onUpload
    }
