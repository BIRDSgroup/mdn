import React from 'react'; 
import ImageGallery from 'react-image-gallery';
import { useLocation } from 'react-router-dom';

// const images = [
//   {
//   original: "https://i.imgur.com/oSnQKsv.png", 
//   thumbnail: "https://i.imgur.com/oSnQKsv.png", 
//   }, 
//   {
//   original: "https://i.imgur.com/WFesTq4.png", 
//   thumbnail: "https://i.imgur.com/WFesTq4.png", 
//   }, 
//   {
//   original: "https://i.imgur.com/kky0tuc.png", 
//   thumbnail: "https://i.imgur.com/kky0tuc.png", 
//   }, 
//   {
//   original: "https://i.imgur.com/hGl6rbd.png", 
//   thumbnail: "https://i.imgur.com/hGl6rbd.png", 
//   }, 
//   {
//   original: "https://i.imgur.com/he5J1sm.png", 
//   thumbnail: "https://i.imgur.com/he5J1sm.png", 
//   }, 
//   {
//   original: "https://i.imgur.com/he5J1sm.png", 
//   thumbnail: "https://i.imgur.com/he5J1sm.png", 
//   }, 
//   {
//   original: "https://i.imgur.com/Nj3kyvu.png", 
//   thumbnail: "https://i.imgur.com/Nj3kyvu.png", 
//   }, 
//   {
//   original: "https://i.imgur.com/5XUUKcw.png", 
//   thumbnail: "https://i.imgur.com/5XUUKcw.png", 
//   }, 
//   {
//   original: "https://i.imgur.com/rjzJFm0.png", 
//   thumbnail: "https://i.imgur.com/rjzJFm0.png", 
//   }, 
//   {
//   original: "https://i.imgur.com/rlGHP08.png", 
//   thumbnail: "https://i.imgur.com/rlGHP08.png", 
//   }, 
//   {
//   original: "https://i.imgur.com/vYVn7iH.png", 
//   thumbnail: "https://i.imgur.com/vYVn7iH.png", 
//   }, 
//   ];

function AnalysisGallery(){

  const location = useLocation()
  const { hash, species} = location.state; 


  var images = [
    {
      original: `/output/${hash}/${species}_intermediate/dimplot-pca.png`, 
      thumbnail: `/output/${hash}/${species}_intermediate/dimplot-pca.png`, 
    }, 
    {
      original: `/output/${hash}/${species}_intermediate/dimplot-umap.png`, 
      thumbnail: `/output/${hash}/${species}_intermediate/dimplot-umap.png`, 
    }, 
    {
      original: `/output/${hash}/${species}_intermediate/dimplot-tsne.png`, 
      thumbnail: `/output/${hash}/${species}_intermediate/dimplot-tsne.png`, 
    }, 
    {
      original: `/output/${hash}/${species}_intermediate/top-10-genes-cluster.png`, 
      thumbnail: `/output/${hash}/${species}_intermediate/top-10-genes-cluster.png`, 
    }, 
  ]
  return <ImageGallery items={images} />;
}

export default AnalysisGallery; 
