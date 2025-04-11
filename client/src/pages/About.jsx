import React from 'react';


export default function About() {



  return (
    <div className="flex flex-col items-center">
      {/* Dark Background Section */}
      <div className="w-full bg-gray-900 text-white flex justify-center items-center h-[300px]">
        <h1 className="text-4xl sm:text-5xl font-bold">ABOUT US</h1>
      </div>

      {/* Additional Content */}
      <div className="w-full p-8 text-center">
        <p className="text-lg text-gray-700 dark:text-white">
        About HomeMate

Welcome to HomeMate, your all-in-one home inventory management system designed to simplify the way you organize and track household essentials. Whether you're managing groceries, appliances, medications, or everyday items, HomeMate helps you stay on top of it all with ease.

With intuitive features like maintenance tracking, warranty reminders, and inventory insights, HomeMate ensures that you never run out of necessities or miss an important repair. Built with the latest MERN stack technology, HomeMate is fast, secure, and accessible anytime, anywhere. <br />
Features: <br />
<br />
<li>
              Pantry & Grocery Management
            </li> <br />
<li>Appliances & Tools Inventory</li> <br />
<li>Medications & Personal Items Management</li> <br />
<li>User & Admin Dashboard for Seamless Control</li> <br />

At HomeMate, we believe in smart living through better organization. Let us help you take control of your home effortlessly!        </p>
      </div>
    </div>
  );
}