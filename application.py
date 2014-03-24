from flask import Flask
from flask import render_template
from flask import jsonify
import random
import math

app = Flask(__name__)

@app.route('/')
def loadSimulator():
	return render_template('/simulator.html', name='example')

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