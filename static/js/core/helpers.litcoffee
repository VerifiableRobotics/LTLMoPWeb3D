External Dependencies
---------------------

    reader = require('promise-file-reader')


Common Helper functions used throughout LTLMoPWeb3D
---------------------------------------------------

Helper for reading files
Takes in the event, an extension, and some options (keepFile, isBlob)

    readFile = (file, ext, opts) ->
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

        # in case you want to get the file as is (just perform validation)
        if opts.keepFile
          return file

        return reader.readAsText(file)

Helper for creating a text file and URL to it

    createFileURL = (text, url) ->
      # replace previously generated files to avoid memory leaks
      if url != null
        window.URL.revokeObjectURL(url)

      # generate the spec file
      url = window.URL.createObjectURL(new Blob([text], {type: 'text/plain'}))
      return url


Export
------

    module.exports = {
      readFile,
      createFileURL
    }
