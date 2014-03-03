from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def example():
	return render_template('/constraints_car.html', name='example')

if __name__ == '__main__':
	app.debug = True
	app.run(host='0.0.0.0')