#!/usr/bin/env Rscript

cat("Start integrative analysis-hmm\n",file="status.log",append=TRUE)

# Script to perform the integrative analysis using hierarchical clustering of gene count
# matrices from multiple species of interest. 
# Methods used are mentioned in the following paper: 
# 1. Comparative cellular analysis of motor cortex in human, marmoset and mouse

library(Seurat)
library(homologene)
library(dplyr)
# library(DESeq2) #package not available
# library(edgeR) #package not available
library(limSolve)
# library(scran) #package not available
library(Rtsne)
library(matrixStats)
library(gplots)

library(Matrix) # this is for working with sparse matrices
library(useful)
library(gmodels)
library(sva) 
library(HiClimR)
library(propagate)
library(foreach)
library(doParallel)
library(corrplot)
# library(bigpca) #package not available

library(conos)
library(pagoda2)
library(speciesTree)
library(clue)
library(parallel)
library(Seurat)
library(ggplot2)
source("tree.method.R")

# Read seurat objects of two different species. 
so_1 = readRDS(snakemake@input[[1]])
so_2 = readRDS(snakemake@input[[2]])

species1 = snakemake@params[["sp1"]]
species2 = snakemake@params[["sp2"]]

so_1$clusters = Idents(so_1)
so_2$clusters = Idents(so_2)

# Find marker genes and expression matrix for both. 
markers_so_1 = FindAllMarkers(so_1, only.pos = TRUE, min.pct = 0.25, logfc.threshold = 0.25)
markers_so_2 = FindAllMarkers(so_2, only.pos = TRUE, min.pct = 0.25, logfc.threshold = 0.25)

DEGenes_1 = rownames(markers_so_1)
DEGenes_2 = rownames(markers_so_2)

ExpressionMatrix_1 = as.data.frame(GetAssayData(object = so_1, slot = "counts"))
ExpressionMatrix_2 = as.data.frame(GetAssayData(object = so_2, slot = "counts"))




i = 1
so_1_map <- c()
so_1_cls <- unique(so_1$clusters)
for (x in so_1_cls){
  so_1_map[x] = i
  i = i+1
}
so_2_map <- c()
so_2_cls <- unique(so_2$clusters)
for (x in so_2_cls){
  so_2_map[x] = i
  i = i+1
}


so_1_cell_clusters <- as.integer(so_1_map[as.character(so_1$clusters)])
so_2_cell_clusters <- as.integer(so_2_map[as.character(so_2$clusters)])

so_1$clusters <- sub("^", paste(species1, "_"),so_1$clusters)
so_2$clusters <- sub("^", paste(species2, "_"), so_2$clusters)

cell_clusters <- c(so_1_cell_clusters, so_2_cell_clusters)

# upper level info (species wise cluster)
upperlevelinfo <- c(so_1$clusters, so_2$clusters)


so_1$species <- matrix(species1, length(so_1$clusters),1)
so_2$species <- matrix(species2, length(so_2$clusters),1)
species <- c(so_1$species, so_2$species)
names(species) <- names(cell_clusters)

# No need to find orthologs if the species are the same. 
if (species1 == species2) {
  gene_df = ExpressionMatrix_2
} else {
  # Passing the expression matrix itself instead of a list returns 
  # the original matrix with the row names changed to the orthologs. 
  gene_df <- orthogene::convert_orthologs(
    gene_df = ExpressionMatrix_2, 
    gene_input = "rownames", 
    gene_output = "rownames", 
    standardise_genes = FALSE, 
    input_species = species2, 
    output_species = species1, 
    method = "gprofiler"
  )
}


# Seurat integration
so2_new <- CreateSeuratObject(counts = gene_df)
so2_new$species <- species2

ortho_species2_genes = rownames(so2_new)
species1_genes = rownames(so_1)
common_genes = intersect(ortho_species2_genes, species1_genes)


species1_filter = so_1[species1_genes %in% common_genes,][]
species2_filter = so2_new[ortho_species2_genes %in% common_genes,][]

lst <- list(species1_filter, species2_filter)

features <- SelectIntegrationFeatures(object.list = lst)
anchors <- FindIntegrationAnchors(object.list = lst, anchor.features = features)

# Create an 'integrated' data assay using Seurat's integration
combined <- IntegrateData(anchorset = anchors)

mat <- combined@assays$RNA@counts
names(cell_clusters) <- colnames(mat)
names(upperlevelinfo) <- colnames(mat)
names(species) <- names(cell_clusters)

# building tree
d <- cluster.matrix.expression.distances(
    t(mat), 
    groups=cell_clusters, 
    dist="cor", 
    useVariablegenes=FALSE,  
    use.scaled.data=TRUE
    )

# Use hclust to build the phylogenetic  tree. 
dendr <- hclust(as.dist(d), method='ward.D2')
dend <- as.dendrogram(dendr)

# plot the phylogenetic tree. 
plot(dend)
ggsave("corrplot.png",last_plot())

saveRDS(dend, snakemake@output[[1]])

cat("End integrative analysis-hmm\n",file="status.log",append=TRUE)
