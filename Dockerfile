#Set base image from r-base using R version 4.0.3
FROM r-base:4.0.3

#Install necessary libraries required for R packages and dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends libcurl4-openssl-dev libxml2-dev libssl-dev libssh2-1-dev libfontconfig1-dev \
    libudunits2-dev libcairo2-dev libxt-dev libgeos-dev libgdal-dev libgsl-dev \
    && apt-get clean

#Install all dependencies and necessary R packages.
RUN R -e "install.packages(c('httr','Cairo','plotly','Rfast','BiocManager'),dependencies=TRUE, repos='http://cran.rstudio.com/')"
RUN R -e "BiocManager::install('multtest')"
RUN R -e "remotes::install_github('jlmelville/uwot')"
RUN R -e "remotes::install_github('satijalab/seurat', ref = 'release/4.0.0')"
RUN R -e "remotes::install_github(c('kharchenkolab/pagoda2','mojaveazure/seurat-disk','satijalab/seurat-data'))"
RUN R -e "BiocManager::install('orthogene')"
RUN R -e "BiocManager::install('clustermole')"

COPY . "/home/abhishek"
WORKDIR "/home/abhishek/"
CMD ["bash"]
