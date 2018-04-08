from flask import Flask, request, render_template, jsonify, send_file, session, abort
import os, sys, datetime, uuid, threading, zipfile

# add LTLMoP lib to path so its modules can be imported
sys.path.append(os.path.join(os.sep, 'LTLMoP', 'src', 'lib'))
import specCompiler


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
# not actually a secret since no need for authentication
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'


def deleteOldFiles():
    """deletes files older than 24 hours"""
    dir_to_search = app.config['UPLOAD_FOLDER']
    for dirpath, dirnames, filenames in os.walk(dir_to_search):
        for file in filenames:
            curpath = os.path.join(dirpath, file)
            file_modified = datetime.datetime.fromtimestamp(os.path.getmtime(curpath))
            if datetime.datetime.now() - file_modified > datetime.timedelta(hours=5):
                os.remove(curpath)


def createSession():
    """creates session if one does not already exist"""
    session.permanent = False  # session should stop after browser close
    if 'username' not in session:
        # create session as a random unique string
        session['username'] = str(uuid.uuid4())
        # create a directory for this session
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], session['username']))
    # delete old files asynchronously after each session creation
    threading.Thread(target=deleteOldFiles).start()


def joinToSessionDir(path):
    """helper to join path to the session directory"""
    return os.path.join(app.config['UPLOAD_FOLDER'], session['username'], path)


def saveToSession(ext):
    """helper to save an uploaded file"""
    file = request.files[ext]
    if not file:
        abort(400)
    session_key = ext + 'FilePath'  # e.g. specFilePath
    new_name = ext + '.' + ext  # e.g. spec.spec
    session[session_key] = joinToSessionDir(new_name)
    file.save(session[session_key])


# ----------------- simulator functions ------------------------------
@app.route('/simulator')
def loadSimulator():
    return render_template('/simulator.html', name='simulator')


# -------------------- spec editor functions -----------------------------

@app.route('/')
@app.route('/specEditor')
def loadSpecEditor():
    """render the spec editor"""
    return render_template('/specEditor.html', name='specEditor')


@app.route('/specEditor/compileSpec', methods=['POST'])
def compileSpec():
    """compiles the project via the spec file, returns log"""
    createSession()
    saveToSession('regions')
    saveToSession('spec')
    sc = specCompiler.SpecCompiler()
    sc.loadSpec(session['specFilePath'])
    realizable, realizableFS, logString = sc.compile()

    # create zip of all files in the project
    with zipfile.ZipFile(joinToSessionDir(session['username'] + '.zip'), 'w') as myzip:
        myzip.write(session['regionsFilePath'], os.path.basename(session['regionsFilePath']))
        myzip.write(session['specFilePath'], os.path.basename(session['specFilePath']))
        fileName, fileExtension = os.path.splitext(session['specFilePath'])
        myzip.write(fileName + '.ltl', os.path.basename(fileName + '.ltl'))
        myzip.write(fileName + '.smv', os.path.basename(fileName + '.smv'))
        myzip.write(fileName + '.aut', os.path.basename(fileName + '.aut'))
        myzip.write(fileName + '_decomposed.regions', os.path.basename(fileName + '_decomposed.regions'))

    return jsonify({'compilerLog': logString})


@app.route('/specEditor/analyzeSpec', methods=['GET'])
def analyzeSpec():
    """analyzes the stored spec and sends back the output"""
    sc = specCompiler.SpecCompiler()
    sc.loadSpec(session['specFilePath'])
    realizable, unsat, nonTrivial, to_highlight, output = sc._analyze()
    return jsonify({'analyzeLog': output})


@app.route('/specEditor/saveSpec', methods=['GET'])
def saveSpec():
    """sends the currently stored spec to the user"""
    thepath = session['specFilePath']
    return send_file(thepath, as_attachment=True, mimetype='text/plain')


@app.route('/specEditor/saveRegions', methods=['GET'])
def saveRegions():
    """sends the currently stored regions to the user"""
    thepath = session['regionsFilePath']
    return send_file(thepath, as_attachment=True, mimetype='text/plain')


@app.route('/specEditor/saveAut', methods=['GET'])
def saveAut():
    """sends the currently stored aut to the user"""
    fileName, fileExtension = os.path.splitext(session['specFilePath'])
    thepath = fileName + '.aut'
    return send_file(thepath, as_attachment=True, mimetype='text/plain')


@app.route('/specEditor/saveLTL', methods=['GET'])
def saveLTL():
    """sends the currently stored ltl to the user"""
    fileName, fileExtension = os.path.splitext(session['specFilePath'])
    thepath = fileName + '.ltl'
    return send_file(thepath, as_attachment=True, mimetype='text/plain')


@app.route('/specEditor/saveSMV', methods=['GET'])
def saveSMV():
    """sends the currently stored smv to the user"""
    fileName, fileExtension = os.path.splitext(session['specFilePath'])
    thepath = fileName + '.smv'
    return send_file(thepath, as_attachment=True, mimetype='text/plain')


@app.route('/specEditor/saveDecomposed', methods=['GET'])
def saveDecomposed():
    """sends the currently stored decomposed regions to the user"""
    fileName, fileExtension = os.path.splitext(session['specFilePath'])
    thepath = fileName + '_decomposed.regions'
    return send_file(thepath, as_attachment=True, mimetype='text/plain')


@app.route('/specEditor/saveZip', methods=['GET'])
def saveZip():
    """sends the currently stored zipped project to the user"""
    thepath = joinToSessionDir(session['username'] + '.zip')
    return send_file(thepath, as_attachment=True, mimetype='text/plain')


# ------------------------- region editor functions ------------------------


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = bool(os.environ.get('DEBUG', False))
    app.run(host='0.0.0.0', port=port, debug=True)
