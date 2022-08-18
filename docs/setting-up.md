# Setting up the pipeline 

The portal consists majorly of 3 parts: 
- R scripts that perform the analysis and form the core of the pipeline. 
- Snakemake, which handles the scheduling and running of the different R scripts. 
- Flask and ReactJS web portal, which allows the users to trigger snakemake jobs from a Web UI. 


## Environment setup 
You can use the included `environment.yaml` file in order to make a copy of the conda environment running the portal on the BIRDS server. Creating a clone of that environment is as easy as running: 
```bash
conda env create --file environment.yaml
```
After this step, you'll also have to install the node packages used for building the frontend. That can be done by using the following commands: 
```bash 
cd ./frontend
npm install 
```

There's also an option to build and use a docker image using the `Dockerfile` present in the root directory. For that, use the following commands inside the root directory: 
```bash
docker build -t mdn 
docker run --publish 5000:5000 mdn 
```

## Running the pipeline 

If you're running the pipeline locally, i.e. not a docker container it's recommended to use a tmux shell (separate terminals) in order to prevent the run from being affected by any network issues which might cause the ssh connection to break. You can check how to use a [tmux shell here](https://linuxize.com/post/getting-started-with-tmux/). 

The pipeline makes use of multiple components, all of which need to be running in order for the pipeline to function properly. These components are: 
- **Redis server**: Used for task queuing when multiple task requests are received in order to reduce the load on the server. It's preferable to start redis as a daemon in the background. This can be done using the following command: 
```bash 
redis-server --daemonize yes
```
- **Redis worker**: This worker thread takes one task at a time from the queued tasks on the redis server and executes them. Essentially this is the thread that runs the snakemake jobs that are triggered by the web UI. In order to run it, just activate the conda environment created earlier and run the following command: 
```bash 
conda activate <env-name> 
python worker.py
```
You can also run this worker in the background and push all the output and logs to a file using the following command instead (note that this notation only works in bash): 
```bash 
nohup python worker.py &> worker.log & 
```

- **Flask backend**: This is the flask server which takes requests from the web UI and queues the job on the redis queue. Starting it up is similar to the redis worker and can be done using the following set of commands: 
```bash 
conda activate <env-name> 
python app.py
```
By default the server runs on port `5000`, which can be changed in the app.py file or using additional command line arguments while running the file. 

## Updating various aspects 

### R scripts 
The scripts are located in the `./scripts` folder and can be directly modified without any changes to other parts. Pay attention to input and output though, which should be imported from snakemake instead of a hardcoded value in order for them to be integrated in the pipeline. 

### Snakemake related config 
There are three files that define the snakemake configuration: `Snakefile`, `config.yaml` and `config-schema.yaml` file. 
- `Snakefile` defines various rules and structure of the pipeline. 
- `config.yaml` file is read by snakemake in order to feed in different user defined variables into the `Snakefile`. 
- `config-schema.yaml` file defines the structure of the `config.yaml` file, what variables are allowed; their datatypes etc. 

Any change in the user defined variables would require a change in all three of these files. For example, if you want to use an additional user defined variable for debug output: 
- You'll have to update the `config-schema.yaml` file to allow for an additional variable. Failure to do this will cause the schema verification to fail. 
- You need to modify the `Snakefile` to read that additional variable from the config file, with appropriate keys. 
- Lastly, you need to define the variable in the `config.yaml` file before triggering the `snakemake` job. Post which, snakemake will read the appropriate variables from the config, complete the `Snakefile` and run the job. 

### Web portal 
- The backend code lives in the `./app.py` file, and changes to the backend can be made there without affecting anything else. You'll have to update the frontend as well if you are making any changes to the API endpoints or structure (e.g. datatypes, keys etc.) 
- The frontend code is present in the `./frontend/src/` directory. You can test the changes locally by running `npm start` with `./frontend` as your root. Once you're done testing, run `npm run build` to build the website to be served from the flask server. 


