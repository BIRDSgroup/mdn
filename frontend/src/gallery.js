import React from 'react'; 
import ImageGallery from 'react-image-gallery';

// const images = [
//   {
//     original: 'https://picsum.photos/id/1018/1000/600/',
//     thumbnail: 'https://picsum.photos/id/1018/250/150/',
//   },
//   {
//     original: 'https://picsum.photos/id/1015/1000/600/',
//     thumbnail: 'https://picsum.photos/id/1015/250/150/',
//   },
//   {
//     original: 'https://picsum.photos/id/1019/1000/600/',
//     thumbnail: 'https://picsum.photos/id/1019/250/150/',
//   },
// ];

const images = [
  {
  original: "https://i.imgur.com/oSnQKsv.png", 
  thumbnail: "https://i.imgur.com/oSnQKsv.png", 
  }, 
  {
  original: "https://i.imgur.com/WFesTq4.png", 
  thumbnail: "https://i.imgur.com/WFesTq4.png", 
  }, 
  {
  original: "https://i.imgur.com/kky0tuc.png", 
  thumbnail: "https://i.imgur.com/kky0tuc.png", 
  }, 
  {
  original: "https://i.imgur.com/hGl6rbd.png", 
  thumbnail: "https://i.imgur.com/hGl6rbd.png", 
  }, 
  {
  original: "https://i.imgur.com/he5J1sm.png", 
  thumbnail: "https://i.imgur.com/he5J1sm.png", 
  }, 
  {
  original: "https://i.imgur.com/he5J1sm.png", 
  thumbnail: "https://i.imgur.com/he5J1sm.png", 
  }, 
  {
  original: "https://i.imgur.com/Nj3kyvu.png", 
  thumbnail: "https://i.imgur.com/Nj3kyvu.png", 
  }, 
  {
  original: "https://i.imgur.com/5XUUKcw.png", 
  thumbnail: "https://i.imgur.com/5XUUKcw.png", 
  }, 
  {
  original: "https://i.imgur.com/rjzJFm0.png", 
  thumbnail: "https://i.imgur.com/rjzJFm0.png", 
  }, 
  {
  original: "https://i.imgur.com/rlGHP08.png", 
  thumbnail: "https://i.imgur.com/rlGHP08.png", 
  }, 
  {
  original: "https://i.imgur.com/vYVn7iH.png", 
  thumbnail: "https://i.imgur.com/vYVn7iH.png", 
  }, 
  ];

class MyGallery extends React.Component {
  render() {
    return <ImageGallery items={images} />;
  }
}

export default MyGallery; 
