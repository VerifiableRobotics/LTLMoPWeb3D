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
def uploadRegion():
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

@app.route('/specEditor/saveSpec', methods=['GET', 'POST'])
def saveSpec():
	dict = request.args
	proj = project.Project()
	proj.specText = dict.get('specText') # "blah"
	if proj.specText is None:
		proj.specText = ''
	proj.all_sensors = dict.getlist('all_sensors') # ["s1"]
	proj.all_actuators = dict.getlist('all_actuators') # ["a1","a2"]
	proj.enabled_sensors = dict.getlist('enabled_sensors') # ["s1"]
	proj.enabled_actuators = dict.getlist('enabled_actuators') # ["a1"]
	proj.all_customs = dict.getlist('all_customs') # ['p1']
	proj.rfi = regions.RegionFileInterface()                                                                                                                                                                                                    
	proj.rfi.readFile(os.path.join(app.config['UPLOAD_FOLDER'], "floorplan.regions"))
	thepath = os.path.join(app.config['UPLOAD_FOLDER'], "spec.spec")
	proj.writeSpecFile(thepath)
	return send_file(thepath, as_attachment=True, mimetype='text/plain')
	

if __name__ == '__main__':
	app.debug = True
	app.run(host='0.0.0.0')