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

genelist = top10[top10$cluster == 1,]$gene

celltypes = clustermole_overlaps(genelist, species='mm')

mouse_celltypes = celltypes[(celltypes$p_value < 0.05) & (celltypes$species == "Mouse"), ]$celltype_full

human_genelist = mouse2human(genelist)$humanGene

h_celltypes = clustermole_overlaps(human_genelist, species='hs')

human_celltypes = h_celltypes[(h_celltypes$p_value < 0.05) & (h_celltypes$species == "Human"), ]$celltype_full

human_celltypes.write(snakemake@output[[1]])

#########################

# - Methods for identifying cell types


# > top10[top10$cluster == 1,]$gene
#  [1] "Kalrn"         "Sgcz"          "Cul4a"         "Slc17a7"      
#  [5] "R3hdm1"        "Opcml"         "A830036E02Rik" "9130024F11Rik"
#  [9] "Pcsk2"         "Ntng1"      


