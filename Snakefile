from snakemake.utils import validate
import os
import time
import hashlib, base64

configfile: "config.yaml"

# Validate the config file schema. 
validate(config, schema="config-schema.yaml")

species = config["species"]
fastq_files = [x[:-6] for x in os.listdir(os.path.join(config['raw_reads']["fastq"], species))]

# Use run id as default hash is provided, otherwise calculate one. 
if config["new_run"]["is_new_run"]:
    if config["new_run"]["run_id"]:
        hash_value = config["new_run"]["run_id"]
    else:
        string_to_hash = species + '_' + datetime.datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
        hash_value = hashlib.md5(string_to_hash.encode('UTF-8')).hexdigest()


rule all:
    input:
        expand(
            "output/{hash_value}/quality_control/{sample}_fastqc.html", 
            species = config["species"], 
            sample = fastq_files
        ), 
        expand(
            "output/{hash_value}/{species}_cluster_labels.csv", 
            species = config['species']
        ), 
        expand(
            "output/{hash_value}/{species1}_{species2}_integrated_cluster_correlation.rds", 
            species1 = config['species1'], 
            species2 = config['species2']
        ) if "integration" in config else []

if "build_transcriptome" in config:
    rule build_transcriptome:
        input:
            fa = config['build_transcriptome']['fa'], 
            gtf = config['build_transcriptome']['gtf']
        output:
            "transcriptomes/{species}/reference.json"
        shell:
            """
            cellranger mkref --genome={species} --fasta={input.fa} --genes={input.gtf} --nthreads=16 --memgb=512
            mv {species} transcriptomes/
            """

rule fastqc:
    input:
        fastq="raw_reads/{species}/{sample}.fastq"
    output:
        "output/{hash_value}/quality_control/{sample}_fastqc.html"
    params:
        dir="output/{hash_value}/quality_control"
    shell:
        "./FastQC/fastqc {input.fastq} --outdir={params.dir}"

rule build_count_matrix:
    input:
        fastq="raw_reads/{species}/", 
        trans="transcriptomes/{species}/", 
    output:
        "output/{hash_value}/{species}_cellranger/outs/raw_feature_bc_matrix/matrix.mtx.gz"
    shell:
        """
        cellranger count --id={species}_cellranger --fastqs={input.fastq} --transcriptome={input.trans} --expect-cells 3000 --localmem 512
        rsync -a {species}_cellranger/ output/{hash_value}/{species}_cellranger && rm -rf {species}_cellranger/
        """

rule cluster_cells:
    input:
        "output/{hash_value}/{species}_cellranger/outs/raw_feature_bc_matrix/matrix.mtx.gz"
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

if "integration" in config: 
    rule integrated_analysis:
        input:
            "output/{hash_value}/{species1}_clusters.rds", 
            "output/{hash_value}/{species2}_clusters.rds", 
        params:
            sp1 = "{species1}", 
            sp2 = "{species2}"
        output:
            "output/{hash_value}/{species1}_{species2}_integrated_cluster_correlation.rds"
        script:
            "scripts/integrative-analysis-cerebellum.R"