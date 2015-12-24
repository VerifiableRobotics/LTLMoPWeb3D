from flask import Flask, request, redirect, url_for, render_template, jsonify, Response, send_file, session
from werkzeug.utils import secure_filename
import os, sys, datetime, uuid, threading, zipfile
                                                                                                                                                                                                               
sys.path.append(os.path.join(os.sep, 'LTLMoP','src','lib')) # add lib to path
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
      if datetime.datetime.now() - file_modified > datetime.timedelta(hours=5):
        os.remove(curpath)

# delete specific file
def deleteFile(path):
  dir_to_search = app.config['UPLOAD_FOLDER']
  for dirpath, dirnames, filenames in os.walk(dir_to_search):
    for file in filenames:
      curpath = os.path.join(dirpath, file)
      if curpath == path:
        os.remove(curpath)

# creates session if one does not already exist
def createSession():
  session.permanent = False # session should stop after browser close
  if 'username' not in session:
    session['username'] = str(uuid.uuid4()) # create session as a random unique string
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], session['username'])) # create a directory for this session
  # delete old files asynchronously after each session creation
  threading.Thread(target=deleteOldFiles).start()

# creates a region file interface and returns it
def createRFI():
  return regions.RegionFileInterface()

# returns a list of regions and the server path given a file
@app.route('/specEditor/uploadRegions', methods=['POST'])
def uploadRegions():
  file = request.files['file']
  if file and allowed_file(file.filename):
    createSession() # create one in case one currently doesn't exist
    filename = secure_filename(file.filename)
    session['regionsFilePath'] = os.path.join(app.config['UPLOAD_FOLDER'], session['username'], filename)
    file.save(session['regionsFilePath'])
    return jsonify(theBool = 'True')
  return jsonify(theBool = 'False')

# ----------------- simulator functions ------------------------------
@app.route('/simulator')
def loadSimulator():
  return render_template('/simulator.html', name='simulator')

# -------------------- spec editor functions -----------------------------

# creates a project instance and returns it
def createProject():
  createSession()
  proj = project.Project() # project instance
  proj.project_root = os.path.join(app.config['UPLOAD_FOLDER'], session['username']) # set root
  proj.project_basename = session['username'] # this might need to be something specific...?
  return proj

# render the spec editor
@app.route('/')
@app.route('/specEditor')
def loadSpecEditor():
  return render_template('/specEditor.html', name='specEditor')

# create a spec file from request.get_json() json
def createSpec(specDict):
  proj = createProject()
  #store text
  proj.specText = specDict['specText'] # 'Do something'
  if proj.specText is None: 
    proj.specText = '' # store as blank string, not None if None
  
  # store sensors
  proj.all_sensors = specDict['all_sensors'] # ['s1']
  proj.all_actuators = specDict['all_actuators'] # ['a1','a2']
  proj.enabled_sensors = specDict['enabled_sensors'] # ['s1']
  proj.enabled_actuators = specDict['enabled_actuators'] # ['a1']
  proj.all_customs = specDict['all_customs'] # ['p1']

  # store compliation options
  proj.compile_options = specDict['compile_options']
  
  # store region path
  regionPath = specDict['regionPath']
  # make sure there is a region path before creating RFI
  if regionPath is not None and regionPath != '':
    # if the path is not just filename, take just filename and attach uploads/
    regionPath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'], os.path.basename(regionPath))
    proj.rfi = createRFI()
    proj.rfi.readFile(regionPath) # 'uploads/floorplan.regions'
  
  # write spec, save spec, and return path
  # create the path if it doesn't exist in the session already
  if not session['specFilePath']:
    session['specFilePath'] = os.path.join(app.config['UPLOAD_FOLDER'], 
      session['username'], session['username'] + '.spec')
  proj.writeSpecFile(session['specFilePath'])
  return jsonify(theBool = 'True')

# route wrapper for createSpec helper
@app.route('/specEditor/createSpec', methods=['POST'])
def createSpecRoute():
  if session['specFilePath']:
    deleteFile(session['specFilePath'])
  return createSpec(request.get_json())

# compiles the project as passed in by JSON, returns log + ltl
@app.route('/specEditor/compileSpec', methods=['POST'])
def compileSpec():
  createSpec(request.get_json())
  sc = specCompiler.SpecCompiler()
  sc.loadSpec(session['specFilePath'])
  realizable, realizableFS, logString = sc.compile()
  # create zip of all files in the project
  with zipfile.ZipFile(os.path.join(app.config['UPLOAD_FOLDER'], session['username'], session['username'] + '.zip'), 'w') as myzip:
    myzip.write(session['regionsFilePath'], os.path.basename(session['regionsFilePath']))
    myzip.write(session['specFilePath'], os.path.basename(session['specFilePath']))
    fileName, fileExtension = os.path.splitext(session['specFilePath']) # split extension
    myzip.write(fileName + '.ltl', os.path.basename(fileName + '.ltl'))
    myzip.write(fileName + '.smv', os.path.basename(fileName + '.smv'))
    myzip.write(fileName + '.aut', os.path.basename(fileName + '.aut'))
    myzip.write(fileName + '_decomposed.regions', os.path.basename(fileName + '_decomposed.regions'))

  return jsonify({'compilerLog': logString})

# analyzes the spec and sends back the output
@app.route('/specEditor/analyzeSpec', methods=['GET'])
def analyzeSpec():
  sc = specCompiler.SpecCompiler()
  sc.loadSpec(session['specFilePath'])
  realizable, unsat, nonTrivial, to_highlight, output = sc._analyze()
  return jsonify(analyzeLog = output)

# sends the currently stored spec to the user
@app.route('/specEditor/saveSpec', methods=['GET', 'POST'])
def saveSpec():
  return send_file(session['specFilePath'], as_attachment=True, mimetype='text/plain')

# sends the currently stored regions to the user
@app.route('/specEditor/saveRegions', methods=['GET', 'POST'])
def saveRegions():
  return send_file(session['regionsFilePath'], as_attachment=True, mimetype='text/plain')

# sends the currently stored aut to the user
@app.route('/specEditor/saveAut', methods=['GET', 'POST'])
def saveAut():
  fileName, fileExtension = os.path.splitext(session['specFilePath']) # split extension
  thepath = fileName + '.aut'
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored ltl to the user
@app.route('/specEditor/saveLTL', methods=['GET', 'POST'])
def saveLTL():
  fileName, fileExtension = os.path.splitext(session['specFilePath']) # split extension
  thepath = fileName + '.ltl'
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored smv to the user
@app.route('/specEditor/saveSMV', methods=['GET', 'POST'])
def saveSMV():
  fileName, fileExtension = os.path.splitext(session['specFilePath']) # split extension
  thepath = fileName + '.smv'
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored decomposed regions to the user
@app.route('/specEditor/saveDecomposed', methods=['GET', 'POST'])
def saveDecomposed():
  fileName, fileExtension = os.path.splitext(session['specFilePath']) # split extension
  thepath = fileName + '_decomposed.regions'
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# sends the currently stored zipped project to the user
@app.route('/specEditor/saveZip', methods=['GET', 'POST'])
def saveZip():
  thepath = os.path.join(app.config['UPLOAD_FOLDER'], session['username'], session['username'] + '.zip')
  return send_file(thepath, as_attachment=True, mimetype='text/plain')

# returns data that specifies what to place into the spec editor
@app.route('/specEditor/importSpec', methods=['POST'])
def importSpec():
  proj = createProject()
  # get file and re-create project
  file = request.files['file']
  if file and allowed_file(file.filename) and 'regionsFilePath' in session: # make sure a regions file has been uploaded
    createSession() # create one in case one currently doesn't exist
    filename = secure_filename(file.filename)
    session['specFilePath'] = os.path.join(app.config['UPLOAD_FOLDER'], session['username'], filename)
    file.save(session['specFilePath'])
    proj.loadProject(session['specFilePath'])
        
    return jsonify(theBool = 'True')
  return jsonify(theBool = 'False')


# ------------------------- region editor functions ------------------------


if __name__ == '__main__':
  port = int(os.environ.get('PORT', 5000))
  debug = bool(os.environ.get('DEBUG', False))
  app.run(host='0.0.0.0', port=port, debug=True)
