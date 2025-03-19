import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Image1 from '../assets/image1.jpg';
import Image2 from '../assets/image2.jpg'; 
import Image3 from '../assets/image3.jpg'; 

export default function Home() {
  const images = [Image1, Image2, Image3]; 

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image 3 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh]">
      
      <h1 className="text-7xl font-bold text-center mb-4 mt-10 ">
        <span className="bg-gradient-to-r from-[#A41FCD] to-[#FC9497] bg-clip-text text-transparent font-bold">
          A Simple 
        </span>  Inventory
      </h1>
      <h2 className="text-5xl font-medium text-center mb-8 color-black dark:white">
        Management Software
      </h2>

      {/* Image Slider */}
      <div className="relative w-[150px] h-[100px] sm:w-[200px] sm:h-[150px] lg:w-[500px] lg:h-[300px] overflow-hidden rounded-lg shadow-lg mt-6">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-500"
        />
      </div>

      {/* Dots */}
      <div className="flex justify-center items-center space-x-2 mt-6 mb-6">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? 'bg-[#A41FCD]' : 'bg-gray-400'
            }`}
          ></button>
        ))}
      </div>

      <h2 className="text-lg sm:text-xl font-mono text-center mb-8 text-gray-800 dark:text-gray-200 leading-relaxed">
  <span className="font-semibold">The best inventory software</span> for small businesses <br />
  to <span className="font-semibold">manage their physical inventory</span>, <br />
  <span className="font-semibold">including supplies, materials, tools, and equipment</span>, <br />
  
</h2>

      {/* YouTube Video */}
      <div className="w-full flex justify-center mt-4 mb-8">
  <iframe
    width="1080"
    height="600"
    src="https://www.youtube.com/embed/5ioh6O-gCGM?loop=1&playlist=5ioh6O-gCGM" 
    title="YouTube video player"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="rounded-lg shadow-lg"
  ></iframe>
</div>

      
<div className=" border border-t-4 w-full mt-4 bg-white py-8 px-4 shadow-lg rounded-lg text-center">
  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
  Track and manage 
  </h3>
  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
  your entire inventory 
  </h2>
  <h1 className="text-5xl sm:text-6xl font-extrabold text-[#A41FCD] mb-6">
  with one easy app.
  </h1>
  <Link to="/signup">
  <button className="bg-black text-white font-medium py-2 px-6 rounded-full hover:bg-gray-800 transition duration-300">
    Join
  </button>
  </Link>
</div>
    </div>
  );
}