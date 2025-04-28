import React from 'react';
import { Sidebar, Tooltip } from 'flowbite-react';
import {
  HiArrowSmRight,
  HiUser,
  HiOutlineUsers,
  HiOutlineLightBulb,
  HiOutlineCube,
  HiOutlineTag, 
  HiOutlineShoppingBag,
} from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';
import { motion } from 'framer-motion';

export default function UnifiedSidebar() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.isAdmin;
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const activeTab = query.get('tab') || 'profile';

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <Sidebar
      className="h-screen w-full md:w-64 bg-gray-900/95 backdrop-blur-md text-white shadow-lg"
      aria-label="Home Inventory Sidebar"
    >
      <div className="flex items-center gap-2 p-4 ">
        <span className="text-4xl font-bold text-black hidden md:block dark:text-white">
          Dashboard
        </span>
      </div>

      <Sidebar.Items>
        <Sidebar.ItemGroup>
          {/* Profile */}
          <motion.div
            variants={itemVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Sidebar.Item
              icon={HiUser}
              as={Link}
              to="/dashboard?tab=profile"
              active={activeTab === 'profile'}
              className={`${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#A41FCD] to-[#FC9497] text-white'
                  : 'text-black font-semibold'
              } rounded-lg transition-colors`}
              aria-label="View your profile"
            >
              Profile
            </Sidebar.Item>
          </motion.div>

          {/* User-Specific Items */}
          {!isAdmin && (
            <>
              <motion.div
                variants={itemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                
              
              <Sidebar.Item
              icon={HiOutlineLightBulb}
              as={Link}
              to="/dashboard?tab=dhome"
              active={activeTab === 'dhome'}
              className={`${
                activeTab === 'dhome'
                  ? 'bg-gradient-to-r from-[#A41FCD] to-[#FC9497] text-white'
                  : 'text-black font-semibold'
              } rounded-lg transition-colors`}
              aria-label="View dashhome"
            >
              Home
            </Sidebar.Item>
          </motion.div>
          <motion.div
            variants={itemVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >


                <Sidebar.Item
                  icon={HiOutlineCube}
                  as={Link}
                  to="/dashboard?tab=appliances"
                  active={activeTab === 'appliances'}
                  className={`${
                    activeTab === 'appliances'
                      ? 'bg-gradient-to-r from-[#A41FCD] to-[#FC9497] text-white'
                      : 'text-black font-semibold'
                  } rounded-lg transition-colors`}
                  aria-label="Manage appliances"
                >
                  Appliances
                </Sidebar.Item>
              </motion.div>
              <motion.div
                variants={itemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Sidebar.Item
                  icon={HiOutlineLightBulb}
                  as={Link}
                  to="/dashboard?tab=ai-suggestions"
                  active={activeTab === 'ai-suggestions'}
                  className={`${
                    activeTab === 'ai-suggestions'
                      ? 'bg-gradient-to-r from-[#A41FCD] to-[#FC9497] text-white'
                      : 'text-black font-semibold'
                  } rounded-lg transition-colors`}
                  aria-label="View AI suggestions"
                >
                  AI Suggestions
                </Sidebar.Item>
              </motion.div>
              <motion.div
                variants={itemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Sidebar.Item
                  icon={HiOutlineShoppingBag}
                  as={Link}
                  to="/dashboard?tab=essentials"
                  active={activeTab === 'essentials'}
                  className={`${
                    activeTab === 'essentials'
                      ? 'bg-gradient-to-r from-[#A41FCD] to-[#FC9497] text-white'
                      : 'text-black font-semibold'
                  } rounded-lg transition-colors`}
                  aria-label="Manage essentials"
                >
                  Essentials
                </Sidebar.Item>
              </motion.div>
              <motion.div
                variants={itemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Sidebar.Item
                  icon={HiOutlineTag}
                  as={Link}
                  to="/dashboard?tab=clothing"
                  active={activeTab === 'clothing'}
                  className={`${
                    activeTab === 'clothing'
                      ? 'bg-gradient-to-r from-[#A41FCD] to-[#FC9497] text-white'
                      : 'text-black font-semibold'
                  } rounded-lg transition-colors`}
                  aria-label="Manage clothing"
                >
                  Clothing
                </Sidebar.Item>
              </motion.div>
              <motion.div
                variants={itemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Sidebar.Item
                  icon={HiOutlineCube}
                  as={Link}
                  to="/dashboard?tab=pantry"
                  active={activeTab === 'pantry'}
                  className={`${
                    activeTab === 'pantry'
                      ? 'bg-gradient-to-r from-[#A41FCD] to-[#FC9497] text-white'
                      : 'text-black font-semibold'
                  } rounded-lg transition-colors`}
                  aria-label="Manage pantry"
                >
                  Pantry
                </Sidebar.Item>
              </motion.div>
              <motion.div
                variants={itemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Sidebar.Item
                  icon={HiOutlineCube}
                  as={Link}
                  to="/dashboard?tab=pantry-details"
                  active={activeTab === 'pantry-details'}
                  className={`${
                    activeTab === 'pantry-details'
                      ? 'bg-gradient-to-r from-[#A41FCD] to-[#FC9497] text-white'
                      : 'text-black font-semibold'
                  } rounded-lg transition-colors`}
                  aria-label="View pantry details"
                >
                  Pantry Details
                </Sidebar.Item>
              </motion.div>
            </>
          )}

          {/* Admin-Specific Items */}
          {isAdmin && (
            <motion.div
              variants={itemVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Sidebar.Item
                icon={HiOutlineUsers}
                as={Link}
                to="/admin?tab=users"
                active={activeTab === 'users'}
                className={`${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-[#A41FCD] to-[#FC9497] text-white'
                    : 'text-black font-semibold'
                } rounded-lg transition-colors`}
                aria-label="Manage users"
              >
                Manage Users
              </Sidebar.Item>
            </motion.div>
          )}

          {/* Sign Out */}
          <motion.div
            variants={itemVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Tooltip content="Sign out of your account" placement="right">
              <Sidebar.Item
                icon={HiArrowSmRight}
                className="cursor-pointer text-black font-semibold hover:bg-red-500 rounded-lg"
                onClick={handleSignout}
                aria-label="Sign out"
              >
                Sign Out
              </Sidebar.Item>
            </Tooltip>
          </motion.div>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}