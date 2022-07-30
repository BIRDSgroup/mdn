-- Table for storing information about historical runs. 
create table alignhistory 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    time_stamp DATETIME DEFAULT CURRENT_TIMESTAMP, 
    run_id TEXT, 
    species TEXT, 
    build_transcriptome BOOLEAN, 
    fasta_file TEXT, 
    gtf_file TEXT, 
    resume_prev BOOLEAN, 
    prev_run_id INTEGER, 
    run_status TEXT, 
    folder TEXT, 
    comments TEXT
); 

create table analhistory 
(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    time_stamp DATETIME DEFAULT CURRENT_TIMESTAMP, 
    anal_id TEXT, 
    species_1 TEXT, 
    gene_mtx_1 TEXT, 
    integration BOOLEAN, 
    species_2 TEXT, 
    gene_mtx_2 TEXT,  
    run_status TEXT 
); 

-- Table for storing locations of different html files to be shown
create table files 
(
    fastqc TEXT, 
    cellranger TEXT, 
    script TEXT, 
    run_id INTEGER, 
    CONSTRAINT fk_run_id FOREIGN KEY (run_id) REFERENCES history(run_id)
); 