from flask import Flask, request, redirect, url_for, render_template, jsonify, Response, send_file
from werkzeug.utils import secure_filename
import random, math, os, sys
                                                                                                                                                                                                               
sys.path.append(os.path.join("LTLMoP","src","lib")) # add lib to path
import regions, project

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

@app.route('/simulator/getVelocityTheta', methods=['GET'])
def sendVelocityTheta():
	newVelocity = random.uniform(0, 30)
	newTheta = random.uniform(0, math.pi/2)
	return jsonify(velocity = newVelocity, theta = newTheta)

@app.route('/simulator/getSensorList', methods=['GET'])
def sendSensorList():
	return jsonify(sensorArray = ["sensor1", "sensor2"])

# -------------------- spec editor functions -----------------------------
@app.route('/specEditor')
def loadSpecEditor():
	return render_template('/specEditor.html', name='specEditor')

# create a spec file from request.args dict and return its path
def createSpec(dict):
	proj = project.Project()

	# store text
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
	thepath = os.path.join(app.config['UPLOAD_FOLDER'], "spec.spec")
	proj.writeSpecFile(thepath)
	return thepath

@app.route('/specEditor/saveSpec', methods=['GET', 'POST'])
def saveSpec():
	thepath = createSpec(request.args);
	return send_file(thepath, as_attachment=True, mimetype='text/plain')

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
	

if __name__ == '__main__':
	app.debug = True
	app.run(host='0.0.0.0')