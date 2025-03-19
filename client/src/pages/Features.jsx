import React from 'react';
import { FaShoppingCart, FaTools, FaPills, FaUserShield } from 'react-icons/fa'; // Import icons from React Icons

export default function Features() {
  return (
    <div className="flex flex-col items-center">
      {/* white area  */}
      <div className="w-full border-4 bg-gray-900 text-white flex justify-center items-center h-[200px]">
        <h1 className="text-4xl sm:text-5xl font-bold">OUR FEATURES</h1>
      </div>

      {/* Features  */}
      <div className="w-full border-4 p-8 text-center">
        <p className=" text-gray-700 dark:text-white mb-10">
          Explore the powerful features of HomeMate that make managing your home inventory effortless.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg gap-6">
            <FaShoppingCart className="text-5xl text-[#A41FCD] mb-10" />
            <h3 className="text-xl font-semibold mb-2">Pantry & Grocery</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Keep track of your groceries and pantry items with ease.
            </p>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-10 ">
            With HomeMate, you can easily monitor your grocery stock levels, avoid overbuying, and reduce waste.
          </p>

          <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg gap-6">
            <FaTools className="text-5xl text-[#A41FCD] mb-10" />
            <h3 className="text-xl font-semibold mb-2">Appliances & Tools</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Organize and manage your appliances and tools inventory.
            </p>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Keep a detailed record of your appliances and tools, ensuring you never lose track of essential items.
          </p>

          <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg gap-6">
            <FaPills className="text-5xl text-[#A41FCD] mb-10" />
            <h3 className="text-xl font-semibold mb-2">Medications & Items</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track medications and personal items effortlessly.
            </p>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Stay on top of your health by managing your medications and personal care items efficiently.
          </p>

          <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg gap-6">
            <FaUserShield className="text-5xl text-[#A41FCD] mb-10" />
            <h3 className="text-xl font-semibold mb-2">User & Admin Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Seamlessly manage your inventory with advanced dashboards.
            </p>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Gain insights into your inventory with user-friendly dashboards designed for both users and admins.
          </p>
        </div>
      </div>
    </div>
  );
}