from flask import Flask, request, redirect, url_for, render_template, jsonify, Response, send_file, session
from werkzeug.utils import secure_filename
import random, math, os, sys, datetime, uuid, threading, zipfile
                                                                                                                                                                                                               
sys.path.append(os.path.join("LTLMoP","src","lib")) # add lib to path
import regions, project, specCompiler

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = set(['regions', 'spec', 'aut'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT' # not actually a secret since no need for authentication

# check if in allowed extensions set
def allowed_file(filename):
  return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

# deletes files older than 24 hours
def deleteOldFiles():
  dir_to_search = app.config['UPLOAD_FOLDER']
  for dirpath, dirnames, filenames in os.walk(dir_to_search):
    for file in filenames:
      curpath = os.path.join(dirpath, file)
      file_modified = datetime.datetime.fromtimestamp(os.path.getmtime(curpath))
      if datetime.datetime.now() - file_modified > datetime.timedelta(hours=24):
        os.remove(curpath)

# creates session if one does not already exist
def createSession():
  if 'username' not in session:
    session['username'] = str(uuid.uuid4()) # create session as a random unique string
  # delete old files asynchronously after each session creation
  threading.Thread(target=deleteOldFiles).start()

# creates a region file interface and returns it
def createRFI():
  return regions.RegionFileInterface()

# ----------------- simulator functions ------------------------------
@app.route('/')
def loadSimulator():
  return render_template('/simulator.html', name='simulator')

# returns a list of regions given a .regions file
@app.route('/simulator/uploadRegions', methods=['POST'])
def simulatorUploadRegions():
  file = request.files['file']
  if file and allowed_file(file.filename):
    createSession() # create one in case one currently doesn't exist
    newFilePath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".regions")
    file.save(newFilePath)
    newJSON = createRFI().extractJSONFromRegions(newFilePath)
    return jsonify(theList = newJSON)
  return jsonify(theBool = "False")

# send velocity and theta
@app.route('/simulator/getVelocityTheta', methods=['GET'])
def sendVelocityTheta():
  newVelocity = random.uniform(0, 30)
  newTheta = random.uniform(0, math.pi/2)
  return jsonify(velocity = newVelocity, theta = newTheta)

# -------------------- spec editor functions -----------------------------

# creates a project instance and returns it
def createProject():
  proj = project.Project() # project instance
  proj.project_root = app.config['UPLOAD_FOLDER'] # set root
  createSession()
  proj.project_basename = session['username']
  return proj

# render the spec editor
@app.route('/specEditor')
def loadSpecEditor():
  return render_template('/specEditor.html', name='specEditor')

# create a spec file from request.args dict
def createSpec(dict):
  proj = createProject()
  #store text
  proj.specText = dict.get('specText') # "Do something"
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
    proj.rfi = createRFI()
    proj.rfi.readFile(dict.get('regionPath')) # 'uploads/floorplan.regions'
  
  # write spec, save spec, and return path
  thepath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".spec")
  proj.writeSpecFile(thepath)
  return jsonify(theBool = "True")

# sends the currently stored spec to the user
@app.route('/specEditor/saveSpec', methods=['GET', 'POST'])
def saveSpec():
  createSpec(request.args)
  thepath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".spec")
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored regions to the user
@app.route('/specEditor/saveRegions', methods=['GET', 'POST'])
def saveRegions():
  thepath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".regions")
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# compiles the currently stored project and returns compiler log
@app.route('/specEditor/compileSpec', methods=['GET'])
def compileSpec():
  sc = specCompiler.SpecCompiler()
  sc.loadSpec(os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".spec"))
  realizable, realizableFS, logString = sc.compile()
  # create zip of all files in the project
  with ZipFile(os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".zip"), 'w') as myzip:
    myzip.write(os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".spec"))
    myzip.write(os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".regions"))
    myzip.write(os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".aut"))
    myzip.write(os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".ltl"))
    myzip.write(os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".smv"))
    myzip.write(os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + "_decomposed.regions"))
  # end create zip
  return jsonify(compilerLog = logString)

# sends the currently stored aut to the user
@app.route('/specEditor/saveAut')
def saveAut():
  thepath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".aut")
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored ltl to the user
@app.route('/specEditor/saveLTL')
def saveLTL():
  thepath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".ltl")
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored smv to the user
@app.route('/specEditor/saveSMV')
def saveSMV():
  thepath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".smv")
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored decomposed regions to the user
@app.route('/specEditor/saveDecomposed')
def saveDecomposed():
  thepath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + "_decomposed.regions")
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored zipped project to the user
@app.route('/specEditor/saveZip', methods=['GET', 'POST'])
def saveZip():
  thepath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".zip")
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# returns a list of regions and the server path given a file
@app.route('/specEditor/uploadRegions', methods=['POST'])
def specEditorUploadRegions():
  file = request.files['file']
  if file and allowed_file(file.filename):
    createSession() # create one in case one currently doesn't exist
    newFilePath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".regions")
    file.save(newFilePath)
    newJSON = createRFI().extractJSONFromRegions(newFilePath)
    return jsonify(theList = newJSON, thePath = newFilePath)
  return jsonify(theBool = "False")

# returns data that specifies what to place into the spec editor
@app.route('/specEditor/importSpec', methods=['POST'])
def specEditorImportSpec():
  proj = createProject()
  # get file and re-create project
  file = request.files['file']
  if file and allowed_file(file.filename):
    createSession() # create one in case one currently doesn't exist
    newFilePath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".spec")
    regionsFilePath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'] + ".regions")
    file.save(newFilePath)
    proj.loadProject(newFilePath)
    proj.rfi = createRFI()
    proj.rfi.readFile(regionsFilePath)

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
    data['regionPath'] = proj.rfi.filename # -> must be unique and therefore not necessarily preserved
    data['regionList'] = []
    # loop through list of regions and add names to the array
    for region in proj.rfi.regions:
        data['regionList'].append(region.name)
        
    return jsonify(data)
  return jsonify(theBool = "False")


# ------------------------- region editor functions ------------------------
# renders the region editor
@app.route('/regionEditor')
def loadRegionEditor():
  return render_template('/regionEditor.html', name='regionEditor')
  

if __name__ == '__main__':
  #app.debug = True
  # compile jtlv compiler initially (build the java source with javac)
  print "Compiling jtlv compiler..."
  os.chdir('LTLMoP/src/etc/jtlv')
  os.system('sh build.sh')
  os.chdir('../../../..')
  port = int(os.environ.get("PORT", 5000))
  app.run(host='0.0.0.0', port=port)