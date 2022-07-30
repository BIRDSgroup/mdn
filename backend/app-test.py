import os
from flask import Flask, request, g, jsonify, send_from_directory

app = Flask(__name__, static_folder='../frontend/build')

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


# -----------------------------------------------------------------------------
# Application related functions. 
# -----------------------------------------------------------------------------

@app.route('/run', methods=["POST"])
def run_snakemake():
    """
    Run the snakemake command using the options provided by the user. 
    Dump the run information in a sqlite database to be retrieved later. 
    """ 
    config = request.get_json()
    # Make a new config file based on the json dump (verify it first)
    with open('config.yaml', 'w') as f:
        yaml.dump(config, f)
    
    query = "insert into history values ({1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9})".format(
        config['time_stamp'], 
        config['species'], 
        config['build_transcriptome'], 
        config['fasta_file'], 
        config['gtf_file'], 
        config['resume_prev'], 
        config['prev_run_id'], 
        config['run_status'], 
        config['folder']
    )

    # Insert the details into a sqlite database. 
    cur = get_db()
    cur.execute(query)
    cur.commit()

    # Trigger snakemake job using the config generated. 
    subprocess.run(["snakemake", "--dry-run"])
    return jsonify({'status': 'Process started', 'id':cur.lastrowid}), 200

@app.route('/history', methods=["GET"])
def historical_runs():
    """
    Return the historical runs with their status, time etc. 
    """
    results = query_db('select * from history')
    return results, 200

@app.route('/files', methods=["GET"])
def file_locations():
    """
    Function to return the location of the different html files for rendering. 
    Should get an id of some sort to specify the run that we're interested in. 
    """
    return "something", 200

@app.route('/output/<path:path>')
def send_report(path):
    return send_from_directory('../output', path)

if __name__ == '__main__':
    app.run(use_reloader=True, port=5000, threaded=True)
