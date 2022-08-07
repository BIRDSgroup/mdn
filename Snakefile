from snakemake.utils import validate
import os
import shutil 
import time
import hashlib, base64
from distutils.dir_util import copy_tree

configfile: "config.yaml"

# Validate the config file schema. 
# validate(config, schema="config-schema.yaml")

# Different all rules based on whether we're doing alignment or analysis. 
if 'do_alignment' in config and config['do_alignment']:
    
    # Some useful variables. 
    hash_value = config['run_id']
    fastq_filenames = [x[:-6] for x in os.listdir(config['raw_reads'])]

    # Copy the raw reads from a random location to a location inside the directory. 
    copy_tree(config['raw_reads'], './raw_reads/{hash_value}'.format(hash_value=hash_value))

    rule all: 
        input: 
            expand(
                "output/{hash_value}/quality_control/{sample}_fastqc.html", 
                species = config["species"], 
                sample = fastq_filenames, 
                hash_value = hash_value
            ), 
            expand(
                "output/{hash_value}/{species}_cellranger/outs/raw_feature_bc_matrix.h5", 
                species = config['species'], 
                hash_value = hash_value 
            )
    
    if "build_transcriptome" in config:
        rule build_transcriptome:
            input:
                fa = config['fasta_file'], 
                gtf = config['gtf_file']
            output:
                expand(
                    "transcriptomes/{species}/reference.json", 
                    species = config['species']
                )
            shell:
                """
                cellranger mkref --genome={species} --fasta={input.fa} --genes={input.gtf} --nthreads=16 --memgb=512
                mv {species} transcriptomes/
                """

    rule fastqc:
        input:
            fastq="raw_reads/{hash_value}/{sample}.fastq"
        output:
            "output/{hash_value}/quality_control/{sample}_fastqc.html"
        params:
            dir="output/{hash_value}/quality_control"
        shell:
            "./FastQC/fastqc {input.fastq} --outdir={params.dir}"

    rule build_count_matrix:
        input:
            fastq="raw_reads/{hash_value}/", 
            trans="transcriptomes/{species}/", 
        output:
            "output/{hash_value}/{species}_cellranger/outs/raw_feature_bc_matrix.h5" 
        shell:
            """
            cellranger count --id={wildcards.species}_cellranger --fastqs={input.fastq} --transcriptome={input.trans} --expect-cells 3000 --localmem 512
            rsync -a {wildcards.species}_cellranger/ output/{hash_value}/{wildcards.species}_cellranger && rm -rf {wildcards.species}_cellranger/
            """

elif 'do_analysis' in config and config['do_analysis']:
    # Some important variables. 
    hash_value = config['anal_id']

    rule all:
        input:
            expand(
                "output/{hash_value}/{species}_cluster_labels.csv", 
                species = [config['species_1'], config['species_2']] if config['integration'] else [config['species_1']], 
                hash_value = hash_value
            ), 
            expand(
                "output/{hash_value}/{species1}_{species2}_integrated_cluster_correlation.rds", 
                species1 = config['species_1'], 
                species2 = config['species_2'], 
                hash_value = hash_value
            ) if config['integration'] else []
    
    rule cluster_cells:
        input:
            "uploads/{hash_value}/{species}_matrix.h5"
        output:
            "output/{hash_value}/{species}_clusters.rds"
        params:
            species="{species}",
            input_dir="output/{hash_value}/{species}_cellranger/outs/raw_feature_bc_matrix/",
            intermediate_output="output/{hash_value}/{species}_intermediate"
        script:
            "scripts/cluster-cells.R"

    rule label_cell_types:
        input:
            "output/{hash_value}/{species}_clusters.rds"
        output:
            "output/{hash_value}/{species}_cluster_labels.csv"
        params:
            species="{species}"
        script:
            "scripts/label-cells.R"


    rule integrated_analysis:
        input:
            gene_mtx_1 = "output/{hash_value}/{species1}_clusters.rds", 
            gene_mtx_2 = "output/{hash_value}/{species2}_clusters.rds"
        params:
            sp1 = "{species1}", 
            sp2 = "{species2}"
        output:
            "output/{hash_value}/{species1}_{species2}_integrated_cluster_correlation.rds"
        script:
            "scripts/integrative-analysis-cerebellum.R"

else:
    rule all: 
        input: 
            []
    