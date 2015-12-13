External Dependencies
---------------------

    # adds es6 fetch API
    require('es6-promise').polyfill()
    require('isomorphic-fetch')

Helpers for the Fetch API
-------------------------

Checks the HTTP status of a fetch request
    
    checkHTTPStatus = (response) ->
      if response.status >= 200 && response.status < 300
        return response
      else 
        error = new Error(response.statusText)
        error.response = response
        throw error

Returns the JSON of the response body along with the response in an array

    parseJSON = (response) ->
      # response.json returns a value and we need to return a promise
      # [response.json(), response] would return immediately
      return response.json().then((json) -> [json, response])

Returns the blob of the respone body along with the response in an array
    
    parseBlob = (response) -> response.blob().then((blob) -> [blob, response])

Fetch with defaults added

    Fetch = (url, obj, opts) ->
      opts = opts || {}
      # set same origin if nothing set to pass cookies/session data by default
      if !obj.credentials? then obj.credentials = 'same-origin'
      # if native object then stringify JSON body
      if obj.body? and obj.body.constructor == ({}).constructor 
        obj.body = JSON.stringify(obj.body)
      # call fetch using helpers + defaults
      if !opts.isBlob?
        fetch(url, obj).then(checkHTTPStatus).then(parseJSON)
      else
        fetch(url, obj).then(checkHTTPStatus).then(parseBlob)


Export
------

    module.exports = Fetch
