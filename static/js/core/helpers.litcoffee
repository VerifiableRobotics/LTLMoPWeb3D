Common Helper functions used throughout LTLMoPWeb3D
---------------------------------------------------

Helper for uploading and reading files
Takes in the event, an extension, and the file reader's callback

    onUpload = (file, ext, callback, opts) ->
      if file?
        # check for blob vs file
        opts = opts || {}
        if !opts.isBlob?
          nameSplit = file.name.split('.')
          extension = nameSplit[nameSplit.length - 1]
          # validation
          if extension != ext
            alert('This only accepts *.' + ext + ' files!')
            return
        reader = new FileReader()
        reader.onload = (ev) -> callback(ev.target.result)
        reader.readAsText(file)

Export
------

    module.exports = {
      onUpload
    }
