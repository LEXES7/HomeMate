import React from 'react';
import { Sidebar } from 'flowbite-react';
import { HiArrowSmRight, HiUser, HiOutlineUsers, HiOutlineCalendar } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';

export default function UnifiedSidebar() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user); 
  const isAdmin = currentUser?.isAdmin; 

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
          <Sidebar.Item icon={HiUser} as={Link} to="/dashboard?tab=profile">
            Profile
          </Sidebar.Item>

          {/* User Specific Items */}
          {!isAdmin && (
            <>
              <Sidebar.Item icon={HiOutlineCalendar} as={Link} to="/dashboard?tab=appliances">
                Appliances
              </Sidebar.Item>
              <Sidebar.Item icon={HiOutlineCalendar} as={Link} to="/dashboard?tab=ai-suggestions">
                AI Suggestions
              </Sidebar.Item>













              <Sidebar.Item icon={HiOutlineCalendar} as={Link} to="/dashboard?tab=essentials">
               Essentials 
               </Sidebar.Item>


               <Sidebar.Item icon={HiOutlineCalendar} as={Link} to="/dashboard?tab=clothing">
               Clothing 
               </Sidebar.Item>
            </>
          )}

          {/* Admin Specific Items */}
          {isAdmin && (
            <Sidebar.Item icon={HiOutlineUsers} as={Link} to="/admin?tab=users">
              Manage Users
            </Sidebar.Item>
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