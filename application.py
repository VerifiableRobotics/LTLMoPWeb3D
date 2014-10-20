from flask import Flask, request, redirect, url_for, render_template, jsonify, Response, send_file
from werkzeug.utils import secure_filename
import random, math, os, sys
                                                                                                                                                                                                               
sys.path.append(os.path.join("LTLMoP","src","lib")) # add lib to path
import regions, project, specCompiler

rfi = regions.RegionFileInterface()

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = set(['regions', 'spec', 'aut'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# check if in allowed extensions set
def allowed_file(filename):
  return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

# ----------------- simulator functions ------------------------------
@app.route('/')
def loadSimulator():
	return render_template('/simulator.html', name='simulator')

# returns a list of regions given a .regions file
@app.route('/simulator/uploadRegions', methods=['POST'])
def simulatorUploadRegion():
  file = request.files['file']
  if file and allowed_file(file.filename):
    filename = secure_filename(file.filename)
    newFilePath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(newFilePath)
    newJSON = rfi.extractJSONFromRegions(newFilePath)
    return jsonify(theList = newJSON)
  return jsonify(theBool = "False")

# send velocity and theta
@app.route('/simulator/getVelocityTheta', methods=['GET'])
def sendVelocityTheta():
	newVelocity = random.uniform(0, 30)
	newTheta = random.uniform(0, math.pi/2)
	return jsonify(velocity = newVelocity, theta = newTheta)

# send an array of sensor names
@app.route('/simulator/getSensorList', methods=['GET'])
def sendSensorList():
	return jsonify(sensorArray = ["sensor1", "sensor2"])

# -------------------- spec editor functions -----------------------------
proj = project.Project() # project instance
proj.project_root = app.config['UPLOAD_FOLDER'] # set root
fileprefix = "spec" # constant prefix
proj.project_basename = fileprefix

# render the spec editor
@app.route('/specEditor')
def loadSpecEditor():
	return render_template('/specEditor.html', name='specEditor')

# create a spec file from request.args dict
def createSpec(dict):
	#store text
	proj.specText = dict.get('specText') # "blah"
	if proj.specText is None: 
		proj.specText = '' # store as blank string, not None if None
	
	# store sensors
	proj.all_sensors = dict.getlist('all_sensors') # ["s1"]
	proj.all_actuators = dict.getlist('all_actuators') # ["a1","a2"]
	proj.enabled_sensors = dict.getlist('enabled_sensors') # ["s1"]
	proj.enabled_actuators = dict.getlist('enabled_actuators') # ["a1"]
	proj.all_customs = dict.getlist('all_customs') # ['p1']

	# store compliation options
	proj.compile_options = {}
	proj.compile_options['convexify'] = dict.get('convexify') == 'true' # true or false
	proj.compile_options['fastslow'] = dict.get('fastslow') == 'true' # true or false
	proj.compile_options['symbolic'] = dict.get('symbolic') == 'true' # true or false
	proj.compile_options['decompose'] = True; # cannot be changed by user
	proj.compile_options['use_region_bit_encoding'] = dict.get('use_region_bit_encoding') == 'true' # true or false
	proj.compile_options['synthesizer'] = dict.get('synthesizer') # 'jtlv' or 'slugs'
	proj.compile_options['parser'] = dict.get('parser') # 'structured' or 'slurp' or 'ltl'
	
	# store region path
	regionPath = dict.get('regionPath')
	if regionPath is not None and regionPath != '': # make sure there is a path to region before rfi
		proj.rfi = regions.RegionFileInterface()
		proj.rfi.readFile(dict.get('regionPath')) # 'uploads/floorplan.regions'
	
	# write spec, save spec, and return path
	thepath = os.path.join(app.config['UPLOAD_FOLDER'], fileprefix + ".spec")
	proj.writeSpecFile(thepath)
	return jsonify(theBool = "True")

# sends the currently stored spec to the user
@app.route('/specEditor/saveSpec', methods=['GET', 'POST'])
def saveSpec():
	createSpec(request.args)
	thepath = os.path.join(app.config['UPLOAD_FOLDER'], fileprefix + ".spec")
	return send_file(thepath, as_attachment=True, mimetype='text/plain')

# compiles the currently stored project and returns compiler log
@app.route('/specEditor/compileSpec', methods=['GET'])
def compileSpec():
	sc = specCompiler.SpecCompiler()
	sc.loadSpec(os.path.join(app.config['UPLOAD_FOLDER'], fileprefix + ".spec"))
	realizable, realizableFS, logString = sc.compile()
	return jsonify(compilerLog = logString)

# sends the currently stored aut to the user
@app.route('/specEditor/saveAut')
def saveAut():
	thepath = os.path.join(app.config['UPLOAD_FOLDER'], fileprefix + ".aut")
	return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored ltl to the user
@app.route('/specEditor/saveLTL')
def saveLTL():
	thepath = os.path.join(app.config['UPLOAD_FOLDER'], fileprefix + ".ltl")
	return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored smv to the user
@app.route('/specEditor/saveSMV')
def saveSMV():
  thepath = os.path.join(app.config['UPLOAD_FOLDER'], fileprefix + ".smv")
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored decomposed regions to the user
@app.route('/specEditor/saveDecomposed')
def saveDecomposed():
  thepath = os.path.join(app.config['UPLOAD_FOLDER'], fileprefix + "_decomposed.regions")
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# returns a list of regions and the server path given a file
@app.route('/specEditor/uploadRegions', methods=['POST'])
def specEditorUploadRegion():
  file = request.files['file']
  if file and allowed_file(file.filename):
    filename = secure_filename(file.filename)
    newFilePath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(newFilePath)
    newJSON = rfi.extractJSONFromRegions(newFilePath)
    return jsonify(theList = newJSON, thePath = newFilePath)
  return jsonify(theBool = "False")

# returns data that specifies what to place into the spec editor
@app.route('/specEditor/importSpec', methods=['POST'])
def specEditorImportSpec():
	# get file and re-create project
  file = request.files['file']
  if file and allowed_file(file.filename):
    newFilePath = os.path.join(app.config['UPLOAD_FOLDER'], fileprefix + ".spec")
    file.save(newFilePath)
    proj.loadProject(newFilePath)

    # create JSON
    data = {}
    data['specText'] = proj.specText
    data['convexify'] = proj.compile_options['convexify']
    data['fastslow'] = proj.compile_options['fastslow']
    data['use_region_bit_encoding'] = proj.compile_options['use_region_bit_encoding']
    data['symbolic'] = proj.compile_options['symbolic']
      
    data['parser'] = proj.compile_options['parser']
    data['synthesizer'] = proj.compile_options['synthesizer']
    
    # arrays to store data that will be passed to server 
    data['all_sensors'] = proj.all_sensors
    data['enabled_sensors'] = proj.enabled_sensors
    data['all_actuators'] = proj.all_actuators
    data['enabled_actuators'] = proj.enabled_actuators
    data['all_customs'] = proj.all_customs
    data['regionPath'] = proj.rfi.filename
    data['regionList'] = []
    # loop through list of regions and add names to the array
    for region in proj.rfi.regions:
        data['regionList'].append(region.name)
        
    return jsonify(data)
  return jsonify(theBool = "True")


# ------------------------- region editor functions ------------------------
# renders the region editor
@app.route('/regionEditor')
def loadRegionEditor():
	return render_template('/regionEditor.html', name='regionEditor')
	

if __name__ == '__main__':
	#app.debug = True
	port = int(os.environ.get("PORT", 5000))
  app.run(host='0.0.0.0', port=port)