import os 
from flask import Flask, request, g, jsonify, send_from_directory, send_file, redirect, url_for
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import yaml 
import subprocess
import sqlite3
from io import BytesIO
import zipfile
import json
import shutil

DATABASE = './database/mdn_database.db'
UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'h5'}

app = Flask(__name__, static_folder='./frontend/build')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)

@app.after_request
def set_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    return response


# Serve React App using flask 
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


# -----------------------------------------------------------------------------
# Database related functions. 
# -----------------------------------------------------------------------------
def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('./database/schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    db.row_factory = dict_factory
    return db

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


# -----------------------------------------------------------------------------
# Application related functions. 
# -----------------------------------------------------------------------------

def run_job_and_update():
    """
    Function to run the snakemake job and update the database status depending on
    job completion. Would be a long running function so would be run using a python 
    executor in the background so that the server doesn't hang up. 
    """
    pass

@app.route('/api/runalign', methods=["POST", "GET"], strict_slashes=False)
def run_alignment_pipeline():
    """
    Run the snakemake command using the options provided by the user. 
    Dump the run information in a sqlite database to be retrieved later. 
    """ 
    if request.method == "POST":
        config = request.get_json()
        print(config)

        columns = ', '.join(config.keys())
        values = ', '.join(f'"{w}"' for w in config.values())
        query = "insert into alignhistory ({cols}) values ({vals})".format(
            cols=columns, 
            vals=values
        )

        print("Final query: ", query)
        # Insert the details into a sqlite database. 
        cur = get_db()
        cur.execute(query)
        cur.commit()


        config['do_alignment'] = True
        # Generate the config.yaml file for running with snakemake. 
        with open('config.yaml', 'w') as f:
            yaml.dump(config, f)

        # Trigger snakemake job using the config generated. 
        # subprocess.run(["snakemake", "--dry-run"])
        return jsonify({'status': 'Process started'}), 200
    else:
        return jsonify({'status': 'Not supported'}), 500
    

@app.route('/api/alignhistory', methods=["GET"])
def align_historical_runs():
    """
    Return the historical runs with their status, time etc. for the 
    alignment portal. 
    """
    results = query_db('select * from alignhistory')
    return jsonify(results), 200

@app.route('/api/runanal', methods=["POST"])
def run_analysis():
    """
    Run the analysis pipeline consisting of cell labelling and integrative analysis. 
    """ 
    if request.method == "POST":
        print(request.form)

        # Create a directory in the uploads folder for storing files. 
        storage_location = os.path.join(app.config['UPLOAD_FOLDER'], request.form['anal_id'])
        if not os.path.exists(storage_location):
            os.makedirs(storage_location, exist_ok = True)

        # Download the appropriate files based on how many species are there. 
        if request.form['integration'] == 'true': 
            print("Integration analysis")
            # Download the second file to appropriate locations. 
            gene_mtx_2 = request.files['gene_mtx_2']
            filename_2 = request.form['species_2'] + '_matrix.h5'
            gene_mtx_2.save(os.path.join(storage_location, filename_2))

        # Download the gene matrix to appropriate location. 
        gene_mtx_1 = request.files['gene_mtx_1']
        filename_1 = request.form['species_1'] + '_matrix.h5'
        gene_mtx_1.save(os.path.join(storage_location, filename_1))

        config = {
            'anal_id': request.form['anal_id'], 
            'species_1': request.form['species_1'], 
            'gene_mtx_1': filename_1, 
            'integration': request.form['integration'] == 'true', 
            'species_2': request.form['species_2'] if request.form['integration'] == 'true' else "", 
            'gene_mtx_2': filename_2 if request.form['integration'] == 'true' else "", 
            'run_status': request.form['run_status'], 
        }

        print("Config file: ", config)

        columns = ', '.join(config.keys())
        values = ', '.join(f'"{w}"' for w in config.values())
        query = "insert into analhistory ({cols}) values ({vals})".format(
            cols=columns, 
            vals=values
        )

        print("Final query: ", query)
        # Insert the details into a sqlite database. 
        cur = get_db()
        cur.execute(query)
        cur.commit()

        config['do_analysis'] = True
        # Generate the config.yaml file for running with snakemake. 
        with open('config.yaml', 'w') as f:
            yaml.dump(config, f)

        # Trigger snakemake job using the config generated. 
        # subprocess.run(["snakemake", "--dry-run"])
        return jsonify({'status': 'Process started'}), 200
    else:
        return jsonify({'status': 'Not supported'}), 500

@app.route('/api/analhistory', methods=["GET"])
def anal_historical_runs():
    """
    Return older runs for the analysis pipeline. 
    """ 
    results = query_db('select * from analhistory')
    return jsonify(results), 200

@app.route('/output/<path:path>')
def send_report(path):
    return send_from_directory('./output', path)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload/', methods=['GET', 'POST'])
def upload_file():
    print("json: ", request.json())
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({'status': 'Can\'t file file'}), 500
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            return jsonify({'status': 'Please select a file'}), 500
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return jsonify({'status': 'Uploaded successfully'}), 200
    return jsonify({'status': 'Working'}), 200

@app.route('/download/<string:hash>')
def download(hash):
    print(hash)
    # Generate a zip file of the directory contents. 
    base_name = './output/' + hash
    zipfile = hash + '.zip'
    if os.path.isfile(base_name + '.zip'):
        pass
    else:
        shutil.make_archive(base_name, 'zip', base_name)
    return send_from_directory('./output', zipfile)


if __name__ == '__main__':
    app.run(host="0.0.0.0")

