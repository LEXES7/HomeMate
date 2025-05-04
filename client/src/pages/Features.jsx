import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card } from 'flowbite-react';
import { motion } from 'framer-motion';
import feature1Image from '../assets/realtime.jpg'; 
import feature2Image from '../assets/notifi.jpg';
import feature3Image from '../assets/ai.jpg';
import feature4Image from '../assets/report.jpg';


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
    image: feature3Image,
  },
  {
    title: 'Detailed Reports',
    description: 'Generate customizable reports to gain insights into your inventory performance.',
    image: feature4Image,
  },
  {
    title: 'Team Collaboration',
    description: 'Enable your team to manage inventory together with role-based access.',
    image: feature4Image,
  },
];

export default function FeaturesPage() {
  return (
    <div className="relative w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh]">
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Powerful <span className="bg-gradient-to-r from-[#A41FCD] to-[#FC9497] bg-clip-text text-transparent">Features</span> for Your Inventory
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300">
            Discover the tools that make inventory management simple, efficient, and scalable.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
          Our inventory management software is designed to streamline your operations, whether you're tracking supplies, tools, or equipment. Explore the features below to see how we can help your business thrive.
        </p>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card
                className="bg-gray-800 border-none shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-105"
                imgAlt={feature.title}
              >
                <div className="w-full h-48 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title.toUpperCase()}</h3>
                <Badge color="purple" className="mb-4">
                  Inventory Feature
                </Badge>
                <p className="text-gray-300 text-base leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </div>
  );
}