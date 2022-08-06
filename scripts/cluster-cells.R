#!/usr/bin/env Rscript

## Guided clustering in Seurat. 
## https://satijalab.org/seurat/archive/v3.0/pbmc3k_tutorial.html

cat("Start clustering",file="status.log",append=TRUE)

library(dplyr)
library(Seurat)
library(ggplot2)

# Defind some variables to be used. 
project_name =  snakemake@params[["species"]]
cellranger_output = snakemake@params[["input_dir"]]
intermediate_output = snakemake@params[["intermediate_output"]]

# Load the PBMC dataset
seu_dob.data <- Read10X(data.dir = cellranger_output)
# Initialize the Seurat object with the raw (non-normalized data).
seu_dob <- CreateSeuratObject(counts = seu_dob.data, project = project_name, min.cells = 3, min.features = 100)


# The [[ operator can add columns to object metadata. This is a great place to stash QC stats
seu_dob[["percent.mt"]] <- PercentageFeatureSet(seu_dob, pattern = "^MT-")

# Visualize QC metrics as a violin plot
VlnPlot(seu_dob, features = c("nFeature_RNA", "nCount_RNA", "percent.mt"), ncol = 3)
# Save the last plot to file. 
ggsave(paste(intermediate_output, 'qc_metrics_voilin.png'), last_plot())

# FeatureScatter is typically used to visualize feature-feature relationships, but can be used
# for anything calculated by the object, i.e. columns in object metadata, PC scores etc.

plot1 <- FeatureScatter(seu_dob, feature1 = "nCount_RNA", feature2 = "percent.mt")
plot2 <- FeatureScatter(seu_dob, feature1 = "nCount_RNA", feature2 = "nFeature_RNA")
CombinePlots(plots = list(plot1, plot2))
# Save the last plot to file. 
ggsave(paste(intermediate_output, 'combine-plot-features.png'), last_plot())

seu_dob <- subset(seu_dob, subset = nFeature_RNA > 100 & nFeature_RNA < 2500 & percent.mt < 5)

seu_dob <- NormalizeData(seu_dob, normalization.method = "LogNormalize", scale.factor = 10000)

seu_dob <- NormalizeData(seu_dob)

seu_dob <- FindVariableFeatures(seu_dob, selection.method = "vst", nfeatures = 2000)

# Identify the 10 most highly variable genes
top10 <- head(VariableFeatures(seu_dob), 10)

# plot variable features with and without labels
plot1 <- VariableFeaturePlot(seu_dob)
plot2 <- LabelPoints(plot = plot1, points = top10, repel = TRUE)
CombinePlots(plots = list(plot1, plot2))
# Save the last plot to file. 
ggsave(paste(intermediate_output, 'combine-plot-variable-features.png'), last_plot())

all.genes <- rownames(seu_dob)
seu_dob <- ScaleData(seu_dob, features = all.genes)

seu_dob <- RunPCA(seu_dob, features = VariableFeatures(object = seu_dob))

# Examine and visualize PCA results a few different ways
print(seu_dob[["pca"]], dims = 1:5, nfeatures = 5)

VizDimLoadings(seu_dob, dims = 1:2, reduction = "pca")
# Save the last plot to file. 
ggsave(paste(intermediate_output, 'viz-dim-loadings-pca.png'), last_plot())

DimPlot(seu_dob, reduction = "pca")
# Save the last plot to file. 
ggsave(paste(intermediate_output, 'dimplot-pca.png'), last_plot())

DimHeatmap(seu_dob, dims = 1, cells = 500, balanced = TRUE)
# Save the last plot to file. 
ggsave(paste(intermediate_output, 'dimheatmap-pca-1.png'), last_plot())

DimHeatmap(seu_dob, dims = 1:15, cells = 500, balanced = TRUE)
# Save the last plot to file. 
ggsave(paste(intermediate_output, 'dimheatmap-pca-1:15.png'), last_plot())

# NOTE: This process can take a long time for big datasets, comment out for expediency. More
# approximate techniques such as those implemented in ElbowPlot() can be used to reduce
# computation time
seu_dob <- JackStraw(seu_dob, num.replicate = 100)
seu_dob <- ScoreJackStraw(seu_dob, dims = 1:20)

JackStrawPlot(seu_dob, dims = 1:15)
# Save the last plot to file. 
ggsave(paste(intermediate_output, 'jackstraw-plot-1:15.png'), last_plot())

ElbowPlot(seu_dob)
# Save the last plot to file. 
ggsave(paste(intermediate_output, 'elbow-plot.png'), last_plot())

## Cluster the cells

seu_dob <- FindNeighbors(seu_dob, dims = 1:10)
seu_dob <- FindClusters(seu_dob, resolution = 0.5)

# Look at cluster IDs of the first 5 cells
head(Idents(seu_dob), 5)

## Run non-linear dimensional reduction (UMAP/tSNE)

# If you haven't installed UMAP, you can do so via reticulate::py_install(packages =
# 'umap-learn')
seu_dob <- RunUMAP(seu_dob, dims = 1:10)
seu_dob <- RunTSNE(seu_dob)

# note that you can set `label = TRUE` or use the LabelClusters function to help label
# individual clusters
DimPlot(seu_dob, reduction = "umap", label=TRUE)
# Save the last plot to file. 
ggsave(paste(intermediate_output, 'dimplot-umap.png'), last_plot())

## Finding differentially expressed features (cluster biomarkers)

# find all markers of cluster 1
cluster1.markers <- FindMarkers(seu_dob, ident.1 = 1, min.pct = 0.25)
head(cluster1.markers, n = 5)

# find all markers distinguishing cluster 5 from clusters 0 and 3
cluster5.markers <- FindMarkers(seu_dob, ident.1 = 5, ident.2 = c(0, 3), min.pct = 0.25)
head(cluster5.markers, n = 5)

# find markers for every cluster compared to all remaining cells, report only the positive ones
seu_dob.markers <- FindAllMarkers(seu_dob, only.pos = TRUE, min.pct = 0.25, logfc.threshold = 0.25)
# seu_dob.markers %>% group_by(cluster) %>% top_n(n = 2, wt = avg_log2FC)

cluster1.markers <- FindMarkers(seu_dob, ident.1 = 0, logfc.threshold = 0.25, test.use = "roc", only.pos = TRUE)

# VlnPlot(seu_dob, features = c("MS4A1", "CD79A"))

# # you can plot raw counts as well
# VlnPlot(seu_dob, features = c("NKG7", "PF4"), slot = "counts", log = TRUE)

# FeaturePlot(seu_dob, features = c("MS4A1", "GNLY", "CD3E", "CD14", "FCER1A", "FCGR3A", "LYZ", "PPBP", 
#     "CD8A"))

top10 <- seu_dob.markers %>% group_by(cluster) %>% top_n(n = 10, wt = avg_log2FC)
DoHeatmap(seu_dob, features = top10$gene) + NoLegend()
# Save the last plot to file. 
ggsave(paste(intermediate_output, 'top-10-genes-cluster.png'), last_plot())

## Assigning cell type identity to clusters
## Will need to get this information from a gene expression database. 

# new.cluster.ids <-  c("T cell", "T cell", "NA", "NA", "Oligodendrocyte", "Oligodendrocyte", 
# "GABAergic neurons", "NA", "Macrophage", "Glutaminergic neurons", "Oligodendrocyte", "NA", 
# "Gamma delta", "Endothelial cells", "GABAergic         neurons", "Myofibroblasts", "Meningeal cells", "NA")
# names(new.cluster.ids) <- levels(seu_dob)
# seu_dob <- RenameIdents(seu_dob, new.cluster.ids)
# DimPlot(seu_dob, reduction = "umap", label = TRUE, pt.size = 0.5) + NoLegend()
# ggsave(paste(intermediate_output, 'dimplot-umap-labels.png'), last_plot())


saveRDS(seu_dob, file = paste(intermediate_output, project_name + "_clusters.rds"))

cat("End clustering",file="status.log",append=TRUE)