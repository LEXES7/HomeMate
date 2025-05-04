import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Dropdown, Navbar, TextInput, Tooltip } from 'flowbite-react';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { motion } from 'framer-motion';
import Logo from '../assets/logo.png'; 

export default function Header() {
  const path = useLocation().pathname;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  // Handle sign-out
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

  // Animation variants for nav links
  const linkVariants = {
    initial: { y: -10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <Navbar
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-900/95' : 'bg-gradient-to-r from-[#EA8973] via-[#C66E9F] to-[#9F52CE]'
      }`}
      fluid
    >
      {/* Logo */}
      <Link to="/home" className="flex items-center gap-3">
        <img
          src={Logo}
          alt="Home Inventory Logo"
          className="h-8 sm:h-10 w-auto transition-transform duration-300 hover:scale-105"
        />
        <span className="text-white text-xl font-bold tracking-tight hidden md:block">
          HomeMate
        </span>
      </Link>


      <Navbar.Collapse className="mx-auto">
        {['home', 'features', 'about', 'review'].map((item) => (
          <motion.div
            key={item}
            variants={linkVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Navbar.Link
              active={path === `/${item}`}
              as={'div'}
              className={`text-white text-base font-medium uppercase tracking-wide ${
                path === `/${item}`
                  ? 'bg-gradient-to-r from-[#A41FCD] to-[#FC9497] bg-clip-text text-transparent'
                  : 'hover:text-gray-300'
              }`}
            >
              <Link to={`/${item}`}>{item}</Link>
            </Navbar.Link>
          </motion.div>
        ))}
      </Navbar.Collapse>


      <div className="flex items-center gap-2 md:gap-4">

        <form onSubmit={handleSearch} className="hidden lg:flex items-center">
          <TextInput
            type="text"
            placeholder="Search inventory..."
            rightIcon={AiOutlineSearch}
            className="w-48 xl:w-64 bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-[#A41FCD]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search inventory items"
          />
        </form>


        <Tooltip content="Search Inventory" placement="bottom">
          <Button
            className="w-10 h-10 lg:hidden bg-gray-800 hover:bg-gray-700"
            pill
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Toggle search"
          >
            <AiOutlineSearch className="text-lg text-white" />
          </Button>
        </Tooltip>


        {searchOpen && (
          <form onSubmit={handleSearch} className="lg:hidden w-full mt-2">
            <TextInput
              type="text"
              placeholder="Search inventory..."
              rightIcon={AiOutlineSearch}
              className="w-full bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-[#A41FCD] transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search inventory items"
            />
          </form>
        )}

        {/* Theme Toggle */}
        <Tooltip content={theme === 'light' ? 'Dark Mode' : 'Light Mode'} placement="bottom">
          <Button
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700"
            pill
            onClick={() => dispatch(toggleTheme())}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-gray-300" />
            )}
          </Button>
        </Tooltip>

        {/* User Dropdown*/}
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt={`${currentUser.username}'s profile`}
                img={currentUser.profilePicture}
                rounded
                className="hover:ring-2 hover:ring-[#A41FCD] transition"
              />
            }
            className="bg-gray-800 border-gray-700 text-white"
          >
            <Dropdown.Header>
              <span className="block text-sm font-medium text-gray-200">
                @{currentUser.username}
              </span>
              <span className="block text-sm text-gray-400 truncate">
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Link to="/dashboard?tab=profile">
              <Dropdown.Item className="hover:bg-gray-700">Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignout} className="hover:bg-gray-700">
              Sign Out
            </Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/signin">
            <Button
              gradientDuoTone="purpleToPink"
              pill
              className="font-medium hover:shadow-lg transition-shadow"
            >
              Sign In
            </Button>
          </Link>
        )}

        <Navbar.Toggle
          className="text-white hover:bg-gray-700"
          aria-label="Toggle navigation menu"
        />
      </div>
    </Navbar>
  );
}