Regex declarations
------------------

    stateRegEx = /\w+(?= with)/gi # matches state name
    rankRegEx = /\d+(?= ->)/gi # matches rank number
    propRegEx = /\w+:\d(?=,|>)/gi # matches props
    successorRegEx = /\w+(?=,|$)/gi # matches successor states


Helper functions to create automaton object
-------------------------------------------
  
    getState = (str) ->
      str.match(stateRegEx)[0]
    
    getRank = (str) ->
      return parseInt(str.match(rankRegEx)[0])
    
    getProps = (str, spec) ->
      props = {}
      props['sensors'] = {}
      props['actuators'] = {}
      props['customprops'] = {}
      props['region'] = "" # region bit string first, then convert to int

      # match all props
      for prop in str.match(propRegEx)
        # split by colon, name left, value right
        propSplit = prop.split(":")
        # check if the prop exists in the spec 
        if spec.Sensors.hasOwnProperty propSplit[0]
          props['sensors'][propSplit[0]] = parseInt(propSplit[1])
        else if spec.Actions.hasOwnProperty propSplit[0]
          props['actuators'][propSplit[0]] = parseInt(propSplit[1])
        else if spec.Customs.indexOf propSplit[0] != -1
          props['customprops'][propSplit[0]] = parseInt(propSplit[1])
        # not a proposition, must be a region bit
        else
          props['region'] += propSplit[1] #bit0 is first and is MSB
      
      # convert region bit string to int
      regionInt = 0
      for bit, index in props["region"]
        regionInt += parseInt(bit) * 2 ** (props["region"].length - index - 1)
      props["region"] = regionInt

      return props
    
    getSuccessors = (str) ->
      return str.match(successorRegEx)
    
    isStateString = (str) ->
      if str.search(stateRegEx) >= 0 then true else false
    
    isSuccessorString = (str) ->
      if str.search(successorRegEx) >= 0 then true else false


Parse the automaton file
------------------------
Sample string:  
```
State 0 with rank 0 -> <person:0, hazardous_item:0, pick_up:0, drop:0, radio:0, carrying_item:0, bit0:0, bit1:0, bit2:0>
  With successors : 1
```

    parseAutomaton = (parse_string, spec) -> 

      automaton = {}
      # loop through lines
      currentState = ''
      for line in parse_string.trim().split "\n"
        if isStateString(line)
          currentState = getState(line)
          automaton[currentState] = "rank": getRank(line), "props": getProps(line, spec), "successors": []
        else if isSuccessorString(line)
          automaton[currentState]["successors"] = getSuccessors(line)
        else
          console.warn("Automaton Parsing: neither state nor successor string")
        # end else
      # end for

      return automaton
    # end parseAutomaton

Export
------

    module.exports = {
      parseAutomaton: parseAutomaton
    }