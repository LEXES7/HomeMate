import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Carousel } from 'flowbite-react';
import feature1Image from '../assets/image1.jpg'; // Replace with feature-specific images
import feature2Image from '../assets/image2.jpg';
import feature3Image from '../assets/image3.jpg';

// Feature data
const features = [
  {
    title: 'Real-Time Tracking',
    description: 'Monitor your inventory levels in real-time with instant updates.',
    image: feature1Image,
  },
  {
    title: 'Barcode Scanning',
    description: 'Quickly add or update items using our built-in barcode scanner.',
    image: feature2Image,
  },
  {
    title: 'Detailed Reports',
    description: 'Generate insights with customizable inventory reports.',
    image: feature3Image,
  },
];

export default function Home() {
  const scrollRef = useRef(null);

  // Auto-scroll for features (inspired by Architecture page)
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollWidth = scrollContainer.scrollWidth / 2;
    let scrollPosition = 0;

    const scroll = () => {
      scrollPosition += 2;
      if (scrollPosition >= scrollWidth) {
        scrollPosition = 0;
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft = scrollPosition;
      }
    };

    const interval = setInterval(scroll, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative w-full h-[80vh]">
     
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Simplify Your <span className="bg-gradient-to-r from-[#A41FCD] to-[#FC9497] bg-clip-text text-transparent">Inventory</span> Management
          </h1>
          <p className="text-lg md:text-xl mb-6">
            The easiest way for small businesses to track supplies, tools, and equipment.
          </p>
          <div className="flex gap-4">
            <Link to="/signup">
              <Button gradientDuoTone="purpleToPink" size="lg">
                Get Started
              </Button>
            </Link>
            <Button color="light" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="w-full bg-gray-100 py-12 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg md:text-xl italic text-gray-800 mb-4">
            “This app saved us hours managing our stock! It’s intuitive and perfect for our small business.”
          </p>
          <p className="text-right text-gray-600">- Sarah, Small Business Owner</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-10 text-center">Why Choose Us?</h2>
          <div
            ref={scrollRef}
            className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
          >
            {[...features, ...features].map((feature, index) => (
              <div
                key={`${feature.title}-${index}`}
                className="flex-none w-72 bg-gray-800 rounded-xl shadow-lg overflow-hidden snap-center"
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title.toUpperCase()}</h3>
                  <Badge color="purple" className="mb-3">
                    Inventory Feature
                  </Badge>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="w-full py-12 px-4 bg-white text-center">
        <h2 className="text-3xl font-bold mb-6">See How It Works</h2>
        <div className="w-full max-w-4xl mx-auto">
          <iframe
            className="w-full aspect-video rounded-lg shadow-lg"
            src="https://www.youtube.com/embed/ndqUB5W75qg?loop=1&playlist=ndqUB5W75qg"
            title="Inventory Management Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="w-full bg-gradient-to-r from-[#A41FCD] to-[#FC9497] py-12 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Inventory?</h2>
        <p className="text-lg mb-6">Join thousands of small businesses managing their stock effortlessly.</p>
        <Link to="/signup">
          <Button color="dark" size="xl" className="hover:bg-gray-800">
            Start Free Trial
          </Button>
        </Link>
      </div>
    </div>
  );
}