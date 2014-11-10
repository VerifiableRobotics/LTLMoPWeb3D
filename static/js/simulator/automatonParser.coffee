parseAutomaton = (parse_string) -> 

  automaton = {}

  # regex declarations
  stateRegEx = /\w+(?= with)/gi # matches state name
  rankRegEx = /\d+(?= ->)/gi # matches rank number
  propRegEx = /\w+:\d(?=,|>)/gi # matches props
  successorRegEx = /\w+(?=,|$)/gi # matches successor states

  # helper functions to create automaton object
  getState = (str) ->
    str.match(stateRegEx)[0]
  getRank = (str) ->
    parseInt(str.match(rankRegEx)[0])
  getProps = (str) ->
    props = {}
    for prop in str.match(propRegEx)
      propSplit = prop.split(":")
      props[propSplit[0]] = parseInt(propSplit[1])
    # end for
    props
  getSuccessors = (str) ->
    str.match(successorRegEx)
  isStateString = (str) ->
    if str.search(stateRegEx) >= 0 then true else false
  isSuccessorString = (str) ->
    if str.search(successorRegEx) >= 0 then true else false

  # loop through lines
  currentState = ''
  for line in parse_string.trim().split "\n"
    if isStateString(line)
      currentState = getState(line)
      automaton[currentState] = "rank": getRank(line), "props": getProps(line), "successors": []
    else if isSuccessorString(line)
      automaton[currentState]["successors"] = getSuccessors(line)
    else
      console.warn("Automaton Parsing: neither state nor successor string")
    # end else
  # end for

  automaton
# end parseAutomaton

exports = {
  parseAutomaton: parseAutomaton
}