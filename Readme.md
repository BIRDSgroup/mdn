# MDN pipeline

Pileline for snRNA sequence data analysis from the MDN project. 

### Directory and naming conventions 

Following is the list of directories that are present in the repository: The description of individual files/directory is as follows: 
- `config-schema.yaml`: File where the schema rules for the config file is defined. 
- `config.yaml`: Single point of entry for the pipeline, pipelines for different species can be run by changing few variables in here. 
- `Dockerfile`: Dockerfile defines the libraries and directory structure of the docker image. 
- `genome_files/`: Stores the raw genome data and gene annotation files for different species. 
- `output/`: Output from pipeline runs. There is a different folder created for each species. 
- `raw_reads/`: Directory containing the raw snRNA seq reads for different species. 
- `Readme.md`: This file. 
- `scripts/`: Different scripts for downstream analysis in the pipeline. 
- `Snakefile`: File defining different parts of the pipeline, the input and output files etc. 
- `.snakemake/`: Directory snakemake uses to store the recency and other information about the files defined in `Snakefile`. 
- `transcriptomes/`: Directory containing the transcriptomes for different species. These are generated using the files present in the `genome_files` directory. 


### Running the pipeline
The single entry point for the code is the `config.yaml` file. After you have updated the file with necessary variables, use the following command to run the pipeline: 
```bash 
snakemake
```
This will run the top rule defined in the `Snakemake` file, which in this case is all i.e. Running the pipeline from end to end. 

### Adding additional species.  

In order to add new species, You need to modify the `config-schema.yaml` file to allow that species in the config file. 

After that, add the relevant files in the following directories by creating a new directory with that species name (which you defined in the prev file): 
- genome_files
- raw_reads
- transcriptomes

Once your files are in place, You can just modify the `species_name` key in the config file and run the pipeline. It'll automatically pick up the right files and dump the output in the `output` directory under the species name. 

### Additional useful commands 

To do a dry run of the snakemake pipeline and see what all rules would be executed, run 
```bash 
snakemake --dryrun
```

