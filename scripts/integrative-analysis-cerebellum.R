#!/usr/bin/env Rscript

# Script to perform the integrated analysis of two or more species. 
# This script will refer to the methods used in the following papers. 
# 1) Tosches, Maria Antonietta, et al. "Evolution of pallium, hippocampus, and cortical cell types revealed by single-cell transcriptomics in reptiles." Science 360.6391 (2018): 881-888.
# 2) Kebschull, Justus M., et al. "Cerebellar nuclei evolved by repeatedly duplicating a conserved cell-type set." Science 370.6523 (2020): eabd5059.

# Function to replace the manually downloaded eggnog tables that were used in the original papers. 
findHumanOrthologs = function(genelist, species_from) {
    gene_df <- orthogene::convert_orthologs(gene_df = genelist,
        gene_input = "rownames",
        gene_output = "columns",
        input_species = species_from,
        output_species = "human",
        non121_strategy = "drop_both_species",
        method = "gprofiler")
    
    # Change the gene_df to a format similar to eggnog files. 
    gene_df_subset = gene_df[c('input_gene', 'ortholog_gene')]
    # Reset the indices and change col names. 
    rown.names(gene_df_subset) = NULL
    colnames(gene_df_subset) = c(species_from, 'eggnog')
    return (gene_df_subset) 
}


SpPermute = function(ExpressionTableSpecies1, species1, DEgenesSpecies1, ExpressionTableSpecies2, species2, DEgenesSpecies2, nPermutations = 1000, genes.use='intersect', corr.method = 'spearman'){

  # Step1: Convert genes from both the species into a common space. 
  # In this case, we'll convert both to human orthologs. 
   
  genelist_1 = rownames(ExpressionTableSpecies1)
  genelist_2 = rownames(ExpressionTableSpecies2)
  
  eggnog1 = findHumanOrthologs(genelist_1)
  eggnog2 = findHumanOrthologs(genelist_2)


  #Step2: Take intersect, union, species1 or species2 of DEgenes for analysis
  DEgenesSpecies1 = eggnog1[eggnog1[,1] %in% DEgenesSpecies1,2]
  nDESp1 = length(DEgenesSpecies1)
  DEgenesSpecies2 = eggnog2[eggnog2[,1] %in% DEgenesSpecies2,2]
  nDESp2 = length(DEgenesSpecies2)
  #genes.use = c('intersect','union','species1','species2')
  if (genes.use=='intersect') DEgenes = intersect(DEgenesSpecies1,DEgenesSpecies2)
  if (genes.use=='union') DEgenes = union(DEgenesSpecies1,DEgenesSpecies2)
  if (genes.use=='species1') DEgenes = DEgenesSpecies1
  if (genes.use=='species2') DEgenes = DEgenesSpecies2
  DEgenesSpecies1 = eggnog1[eggnog1[,2] %in% DEgenes,1]
  DEgenesSpecies2 = eggnog2[eggnog2[,2] %in% DEgenes,1]

  #Step3: Prune Expression Tables & Remove rows with no expression
  Sp1 = ExpressionTableSpecies1[rownames(ExpressionTableSpecies1) %in% DEgenesSpecies1,]
  Sp1 = Sp1[rowSums (Sp1)!=0,]
  Sp2 = ExpressionTableSpecies2[rownames(ExpressionTableSpecies2) %in% DEgenesSpecies2,]
  Sp2 = Sp2[rowSums (Sp2)!=0,]

  #Step4: Replace Gene names with Eggnog name
  Sp1[,ncol(Sp1)+1] = rownames(Sp1)
  colnames(Sp1)[ncol(Sp1)] = species1
  Sp1 = merge(eggnog1, Sp1, by =species1, all = F)
  rownames(Sp1) = Sp1$eggnog
  Sp1 = Sp1[,3:ncol(Sp1)]

  Sp2[,ncol(Sp2)+1] = rownames(Sp2)
  colnames(Sp2)[ncol(Sp2)] = species2
  Sp2 = merge(eggnog2, Sp2, by =species2, all = F)
  rownames(Sp2) = Sp2$eggnog
  Sp2 = Sp2[,3:ncol(Sp2)]

  #Step5: Scale Expression Tables by gene average
  avg = rowMeans(Sp1)
  Sp1 = sweep(Sp1,1,avg,"/")
  rm(avg)
  avg = rowMeans(Sp2)
  Sp2 = sweep(Sp2,1,avg,"/")
  rm(avg)

  #Step6: Merge Expression Tables
  geTable = merge(Sp1,Sp2, by='row.names', all=F)
  rownames(geTable) = geTable$Row.names
  geTable = geTable[,2:ncol(geTable)]
  
  print(dim(geTable))
  #Step7:  Correlation
  #7a:  Correlation
  # Corr.Coeff.Table = cor(geTable,method=corr.method)
  t0 <- proc.time() 
  # Corr.Coeff.Table = fastCor(geTable, nSplit = 1, upperTri = FALSE, optBLAS = FALSE, verbose = TRUE)
  Corr.Coeff.Table = bigcor(geTable, size= 2000, fun = "cor")
  print(proc.time() - t0)
  print(dim(Corr.Coeff.Table))

  list.to.return = list(Corr.Coeff.Table,DEgenes,rownames(geTable),length(DEgenes),length(rownames(geTable)),nDESp1,nDESp2,geTable)
  names(list.to.return) = c('corr.coeff', 'DEgenes_intersect','DEgenes_in_analysis','nDEgenes_intersect','nDEgenes_in_analysis','nDEgenes_Sp1','nDEgenes_Sp2','scaled_table')
  return(list.to.return)
}


# Read seurat objects of two different species. 
so_1 = readRDS(snakemake@input[[1]])
so_2 = readRDS(snakemake@input[[2]])

species1 = snakemake@params[["sp1"]]
species2 = snakemake@params[["sp2"]]

# Find marker genes and expression matrix for both. 
markers_so_1 = FindAllMarkers(so_1, only.pos = TRUE, min.pct = 0.25, logfc.threshold = 0.25)
markers_so_2 = FindAllMarkers(so_2, only.pos = TRUE, min.pct = 0.25, logfc.threshold = 0.25)

DEGenes_1 = rownames(markers_so_1)
DEGenes_2 = rownames(markers_so_2)

ExpressionMatrix_1 = as.data.frame(GetAssayData(object = so_1, slot = "counts"))
ExpressionMatrix_2 = as.data.frame(GetAssayData(object = so_2, slot = "counts"))

# Find correlation using DE genes. 
# Edge case: What if there aren't any common DE genes between the two species? 
permuted_corr_coeff = SpPermute(
    ExpressionMatrix_1, 
    species1 = species1, 
    DEGenes_1, 
    ExpressionMatrix_2, 
    species2 = species2, 
    DEGenes_2, 
    nPermutations = 10, 
    genes.use = 'intersect', 
    corr.method = 'spearman'
    )

# Insert appropriate row and column names for the correlation matrix. 
comp_table.intersect <- permuted_corr_coeff[[1]][1:ncol(ExpressionMatrix_1),(ncol(ExpressionMatrix_1)+1):nrow(permuted_corr_coeff[[1]])]
ex_cols_1 <- colnames(ExpressionMatrix_1)
rownames(comp_table.intersect) <- ex_cols_1

ex_cols_2 <- colnames(ExpressionMatrix_2)
colnames(comp_table.intersect) <- ex_cols_2

# Find cluster names for both the species. 
cluster_count_1 <- unique(Idents(object = so_1))
cluster_count_2 <- unique(Idents(object = so_2))

# Calculate the average correlation matrix. 
mat = matrix(0, length(cluster_count_1), length(cluster_count_2))

i = 0
for (x in cluster_count_1){
    i <- i+1
    j = 0
    for (y in cluster_count_2){
        j <- j+1
        rows = colnames(subset(x = so_1, idents = x))
        cols = colnames(subset(x = so_2, idents = y))
        m = comp_table.intersect[rownames(comp_table.intersect) %in% rows, colnames(comp_table.intersect) %in% cols]
        print(dim(m))
        mat[i,j] = mean(m)
    }
}

# Print and save the correlation plot. 
# png(height=1800, width=1800, file="correlation_plot_idents.png", type = "cairo")
corrplot(mat, method="shade", order = "original")
ggsave("corrplot.png",last_plot())
# dev.off()

# Save the correlation matrix to file for further processing. 
saveRDS(seu_dob, file = "integrated_cluster_correlation.rds")


