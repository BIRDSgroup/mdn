#!/usr/bin/env Rscript

# Cell labelling using over representation analysis. 
# Need to convert this to GSEA in the later versions. 

library(dplyr)
library(Seurat)
library(clustermole)
library(homologene)

# Read the mouse gene counts
same = readRDS(snakemake@input[[1]])

# Find markers for all the clusters. 
same.markers = FindAllMarkers(same, only.pos = TRUE, min.pct = 0.25, logfc.threshold = 0.25)

# Find top 10 marker genes for each cluster. 
top10 <- same.markers %>% group_by(cluster) %>% top_n(n = 10, wt = avg_log2FC)

for (val in unique(top10$cluster)){
    genelist = top10[top10$cluster == val,]$gene
    gene_df <- orthogene::convert_orthologs(gene_df = genelist,
                gene_input = "rownames",
                gene_output = "columns",
                input_species = snakemake@params[["species"]],
                output_species = "mouse",
                non121_strategy = "drop_both_species",
                method = "gprofiler")

    celltypes = clustermole_overlaps(gene_df$ortholog_gene, species='mm')
    mouse_celltypes = celltypes[(celltypes$p_value < 0.05) & (celltypes$species == "Mouse"), ]$celltype_full
    mouse_celltypes.write(toString(val) + "_cluster_" + snakemake@output[[1]])
}


