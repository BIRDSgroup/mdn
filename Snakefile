from snakemake.utils import validate
import os

configfile: "config.yaml"

# Validate the config file schema. 
validate(config, schema="config-schema.yaml")

species = config["species"]
fastq_files = [x[:-6] for x in os.listdir(os.path.join(config['raw_reads']["fastq"], species))]

rule all:
    input:
        expand(
            "quality_control/{species}/{sample}_fastqc.html", 
            species = config["species"], 
            sample = fastq_files
        ), 
        expand(
            "output/{species}_cluster_labels.csv", 
            species = config['species']
        )

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
        "quality_control/{species}/{sample}_fastqc.html"
    params:
        dir="quality_control/{species}"
    shell:
        "./FastQC/fastqc {input.fastq} --outdir={params.dir}"

rule build_count_matrix:
    input:
        fastq="raw_reads/{species}/", 
        trans="transcriptomes/{species}/", 
    output:
        "output/{species}_cellranger/outs/raw_feature_bc_matrix/matrix.mtx.gz"
    shell:
        """
        cellranger count --id={species}_cellranger --fastqs={input.fastq} --transcriptome={input.trans} --expect-cells 3000 --localmem 512
        rsync -a {species}_cellranger/ output/{species}_cellranger && rm -rf {species}_cellranger/
        """

rule cluster_cells:
    input:
        "output/{species}_cellranger/outs/raw_feature_bc_matrix/matrix.mtx.gz"
    output:
        "output/{species}_clusters.rds"
    params:
        species="{species}",
        input_dir="output/{species}_cellranger/outs/raw_feature_bc_matrix/",
        intermediate_output="output/{species}_intermediate"
    script:
        "scripts/cluster-cells.r"

rule label_cell_types:
    input:
        "output/{species}_clusters.rds"
    output:
        "output/{species}_cluster_labels.csv"
    script:
        "scripts/label-cells.r"

rule integrated_analysis:
    input:
        "output/{species}_clusters.rds"
    output:
        ""
    script:
        "scripts/integrative-analysis.r"

