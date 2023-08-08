import React from 'react';
import { Carousel } from 'antd';

const contentStyle: React.CSSProperties = {
  height: '160px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#364d79',
};

const Banner: React.FC = () => (
  <Carousel autoplay>
    <div>
      <img src="https://shu-gallery.vercel.app/photos/2.jpg" alt="" />
    </div>
    <div>
      <img src="https://shu-gallery.vercel.app/photos/2.jpg" alt="" />
    </div>
    <div>
      <img src="https://shu-gallery.vercel.app/photos/2.jpg" alt="" />
    </div>
    <div>
      <img src="https://shu-gallery.vercel.app/photos/2.jpg" alt="" />
    </div>
  </Carousel>
);

export default Banner;