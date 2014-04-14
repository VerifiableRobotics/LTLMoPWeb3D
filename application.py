from flask import Flask, request, redirect, url_for, render_template, jsonify
from werkzeug.utils import secure_filename
import random
import math
import os, sys
                                                                                                                                                                                                               
sys.path.append(os.path.join("LTLMoP","src","lib")) # add lib to path
import regions

rfi = regions.RegionFileInterface()

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = set(['regions, spec, aut'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# check if in allowed extensions set
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/uploadRegion', methods=['POST'])
def uploadRegion():
  file = request.files['theRegion']
  if file and allowed_file(file.filename):
    filename = secure_filename(file.filename)
    newFilePath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(newFilePath)
    newJSON = rfi.extractJSONFromRegions(newFilePath)
    return jsonify(theBool = "True")
  return jsonify(theBool = "False")

@app.route('/')
def loadSimulator():
	return render_template('/simulator.html', name='simulator')

@app.route('/specEditor')
def loadSpecEditor():
	return render_template('/specEditor.html', name='specEditor')

@app.route('/getVelocityTheta', methods=['GET'])
def sendVelocityTheta():
	newVelocity = random.uniform(0, 30)
	newTheta = random.uniform(0, math.pi/2)
	return jsonify(velocity = newVelocity, theta = newTheta)

@app.route('/getSensorList')
def sendSensorList():
	return jsonify(sensorArray = ["sensor1", "sensor2"])
	

if __name__ == '__main__':
	app.debug = True
	app.run(host='0.0.0.0')