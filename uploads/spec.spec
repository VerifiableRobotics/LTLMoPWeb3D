# This is a specification definition file for the LTLMoP toolkit.
# Format details are described at the beginning of each section below.


======== SETTINGS ========

Actions: # List of action propositions and their state (enabled = 1, disabled = 0)
actuator1, 1
actuator2, 1

CompileOptions:
convexify: True
parser: structured
symbolic: False
use_region_bit_encoding: True
fastslow: False
decompose: True

Customs: # List of custom propositions
prop1
prop2
prop3

RegionFile: # Relative path of region description file
floorplan.regions

Sensors: # List of sensor propositions and their state (enabled = 1, disabled = 0)
sensor1, 1
sensor2, 0


======== SPECIFICATION ========

Spec: # Specification in structured English
asdfasdfas

