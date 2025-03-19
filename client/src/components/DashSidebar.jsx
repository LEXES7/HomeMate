import React from 'react';
import { Sidebar } from 'flowbite-react';
import { HiArrowSmRight, HiUser, HiOutlineUsers, HiOutlineCalendar } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';

export default function UnifiedSidebar() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user); // Get user info from Redux
  const isAdmin = currentUser?.isAdmin; // Check if the user is an admin

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

  return (
    <Sidebar className="h-screen w-full md:w-56 bg-gray-800 text-white">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          {/* Common Sidebar Items */}
          <Link to="/dashboard?tab=profile">
            <Sidebar.Item icon={HiUser}>Profile</Sidebar.Item>
          </Link>

          {/* User-Specific Items */}
          {!isAdmin && (
            <Link to="/dashboard?tab=appliances">
              <Sidebar.Item icon={HiOutlineCalendar}>Appliances</Sidebar.Item>
            </Link>
          )}

          {/* Admin-Specific Items */}
          {isAdmin && (
            <Link to="/admin?tab=users">
              <Sidebar.Item icon={HiOutlineUsers}>Manage Users</Sidebar.Item>
            </Link>
          )}

          {/* Sign Out */}
          <Sidebar.Item
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={handleSignout}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}