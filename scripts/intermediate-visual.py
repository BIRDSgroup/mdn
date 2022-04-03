intermediate_out = {'qc_metrics_voilin.png': 'description', 
'combine-plot-features.png': 'description', 
'combine-plot-variable-features.png': 'description', 
'viz-dim-loadings-pca.png': 'description', 
'dimplot-pca.png': 'description', 
'dimheatmap-pca-1.png': 'description', 
'dimheatmap-pca-1:15.png': 'description', 
'jackstraw-plot-1:15.png': 'description', 
'elbow-plot.png': 'description', 
'dimplot-umap.png': 'description', 
'top-10-genes-cluster.png': 'description'}


html_template = """
<div class="figure">
    <p><img src="{src}"
      width="600" height="400"
      alt="{alt}">
    <p>{caption}
  </div>

"""

html_header = """
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"

<head>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/picnic@7.1.0/picnic.min.css">

<style>

div.figure {
  float: left;
  width: 40%;
  text-align: center;
  font-style: italic;
  font-size: smaller;
  text-indent: 0;
  border: thin silver solid;
  margin: 0.5em;
  padding: 0.5em;
}

.figure > img:hover {
  width: 500px;
  height: 200px;
}


</style>
</head>
<body>
"""

with open('intermediate.html', 'w') as f:
    f.write(html_header)
    i = 0
    for k,v in intermediate_out.items():
        f.write(html_template.format(src=k, caption=v, alt=i))
        i += 1
    f.write("</body>")
