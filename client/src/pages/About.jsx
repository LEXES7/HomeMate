import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from 'flowbite-react';
import { motion } from 'framer-motion';
import teamPlaceholder from '../assets/mem.jpg';

const teamMembers = [
  { name: 'Sachintha Bhashitha', role: 'Lead Developer', image: teamPlaceholder },
  { name: 'Thiyaana Vidanaarachchi', role: 'UI/UX Designer', image: teamPlaceholder },
  { name: 'Kaveesha', role: 'Backend Developer', image: teamPlaceholder },
  { name: 'Naveen Gunasekara', role: 'Project Manager', image: teamPlaceholder },
];

export default function AboutPage() {
  return (
    <div className="relative w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh]">
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            About <span className="bg-gradient-to-r from-[#A41FCD] to-[#FC9497] bg-clip-text text-transparent">Us</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300">
            Learn about our mission to simplify inventory management and the team behind it.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gray-800 rounded-xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-6">Our Story</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            Home Inventory was born out of a passion for simplifying business operations. Developed as part of an Information Technology Project Management (ITPM) initiative, our goal is to empower small businesses with an intuitive, powerful tool to manage their physical inventory—supplies, materials, tools, and equipment.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            We understand the challenges of keeping track of stock in a fast-paced environment. That’s why we’ve built a platform that combines real-time tracking, barcode scanning, and insightful reporting to make inventory management effortless. Trusted by over 500 businesses, we’re committed to helping you focus on what matters most—growing your business.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-800 rounded-xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Our mission is to provide small businesses with a seamless, affordable solution to manage their inventory with confidence. We aim to eliminate the complexity of stock management, enabling businesses to save time, reduce errors, and scale efficiently.
          </p>
        </motion.div>

        {/* Our Team*/}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-8 text-center">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className="bg-gray-800 border-none shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-105"
                  imgSrc={member.image}
                  imgAlt={member.name}
                >
                  <h3 className="text-xl font-semibold text-white text-center">{member.name}</h3>
                  <p className="text-gray-400 text-sm text-center">{member.role}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        
      </div>
    </div>
  );
}