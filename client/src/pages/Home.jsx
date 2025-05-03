import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Carousel } from 'flowbite-react';
import feature1Image from '../assets/image1.jpg'; 
import feature2Image from '../assets/image2.jpg';
import feature3Image from '../assets/image3.jpg';
import feature4Image from '../assets/image3.jpg';
import bgImage from "../assets/bg1.jpg";
import bg2Image from "../assets/bg2.jpg"; // Import background image for testimonial section

const features = [
  {
    title: 'Real-Time Tracking',
    description: 'Monitor your inventory levels instantly with live updates across all devices.',
    image: feature1Image,
  },
  {
    title: 'Notification Alerts',
    description: 'Get notified when stock levels are low or when items are added or removed.',
    image: feature2Image,
  },
  {
    title: 'AI Assistant',
    description: 'Get personalized recommendations and insights based on your inventory data.',
    image: feature1Image,
  },
  {
    title: 'Detailed Reports',
    description: 'Generate customizable reports to gain insights into your inventory performance.',
    image: feature3Image,
  },
  {
    title: 'Team Collaboration',
    description: 'Enable your team to manage inventory together with role-based access.',
    image: feature4Image,
  },
];

export default function Home() {
  const scrollRef = useRef(null);
  const testimonialRef = useRef(null); // Add ref for testimonial section

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

  // Add scroll animation effect for testimonial
  useEffect(() => {
    const testimonialSection = testimonialRef.current;
    if (!testimonialSection) return;

    const handleScroll = () => {
      const rect = testimonialSection.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
      
      if (isVisible) {
        const scrollPosition = window.innerHeight - rect.top;
        const opacity = Math.min(1, scrollPosition / 500); // Fade in effect
        const scale = 0.9 + Math.min(0.1, scrollPosition / 1000); // Slight scale effect
        const translateY = Math.max(0, 50 - scrollPosition / 10); // Move up effect
        
        testimonialSection.style.opacity = opacity;
        testimonialSection.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative w-full h-[80vh]">
        <div className="absolute inset-0 bg-gradient- bg-gray-900/95"></div>
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
<div 
  ref={testimonialRef}
  className="w-full py-32 px-6 text-center relative bg-cover bg-center bg-fixed overflow-hidden transition-all duration-700 opacity-0 min-h-[500px] flex items-center"
  style={{
    backgroundImage: `url(${bg2Image})`,
    transform: 'scale(0.9) translateY(50px)',
  }}
>
  <div className="absolute inset-0 bg-black/60"></div>
  <div className="max-w-4xl mx-auto relative z-10 w-full">
    <div className="bg-white/10 backdrop-blur-sm p-10 rounded-xl shadow-2xl">
      <p className="text-2xl md:text-3xl italic text-white mb-8 font-light leading-relaxed">
        "This app saved us hours managing our stock! It's intuitive and perfect for our small business."
      </p>
      <div className="w-16 h-1 bg-gradient-to-r from-[#A41FCD] to-[#FC9497] mx-auto mb-6"></div>
      <p className="text-white text-lg">- Sarah, Small Business Owner</p>
    </div>
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

      {/* Wave Divider */}
      <div className="w-full bg-gray-900 relative overflow-hidden">
        <svg 
          className="w-full h-24 md:h-32 lg:h-40 fill-current text-gradient-to-r from-[#A41FCD] to-[#FC9497]" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
          style={{
            fill: 'url(#gradient)',
            display: 'block',
            transform: 'rotate(180deg)',
            marginBottom: '-1px'
          }}
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A41FCD" />
              <stop offset="100%" stopColor="#FC9497" />
            </linearGradient>
          </defs>
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" />
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" />
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" />
        </svg>
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

    </div>
  );
}