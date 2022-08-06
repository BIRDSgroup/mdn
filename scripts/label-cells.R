#!/usr/bin/env Rscript

# Cell labelling using GSEA
cat("Start labelling",file="status.log",append=TRUE)

library(Seurat)
library(clustermole)

# Read the gene count matrix. 
so = readRDS(snakemake@input[[1]])

# Calculate the average expression levels for each cell cluster. 
avg_exp_mat <- AverageExpression(so)

# Convert to a regular matrix and log-transform.
avg_exp_mat <- as.matrix(avg_exp_mat$RNA)
avg_exp_mat <- log1p(avg_exp_mat)

# Skip the ortholog conversion if the species is mouse. 
if (snakemake@params[["species"]] == "mouse") {
    avg_exp_mat_subset = avg_exp_mat
} 

else {
    # Convert the genes present in the average expression matrix to their orthologs in mouse. 
    genelist = rownames(avg_exp_mat)

    ## Find orthologs using orthogene package. 
    gene_df <- orthogene::convert_orthologs(
        gene_df = genelist,
        gene_input = "rownames",
        gene_output = "columns",
        input_species = snakemake@params[["species"]],
        output_species = "mouse",
        non121_strategy = "drop_both_species",
        method = "gprofiler"
    )

    genes_with_orthologs = gene_df$input_gene

    ## Subset the avg_exp_mat so that it only contains the genes that had orthologs. 
    avg_exp_mat_subset = avg_exp_mat[genes_with_orthologs, ]

    ## Chage the rownames of the avg_exp_mat to orthologs using gene_df
    rownames(avg_exp_mat_subset) = gene_df$ortholog_gene
}



# Run enrichment of all cell type signatures across all clusters. 
enrich_tbl <- clustermole_enrichment(expr_mat = avg_exp_mat_subset, species = "mm")

# # Check the top 10 enriched cell types for all the clusters present in the data. 
# for (val in unique(enrich_tbl$cluster)) {
#     # Check the most enriched cell types for a particular cluster. 
#     enrich_tbl %>% filter(cluster == "0") %>% head(15)
# }

# Write the enriched table with all the cell types to file. 
write.csv(enrich_tbl, snakemake@output[[1]], row.names = FALSE)

cat("End labelling",file="status.log",append=TRUE)
