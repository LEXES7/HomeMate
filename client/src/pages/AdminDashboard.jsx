import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';
import ShowUsers from '../pages/AdminSide/Showusers'; 
import AdminDashHome from '../pages/AdminDashHome';
import AReviews from '../pages/AdminSide/AReviews';


export default function AdminDashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');

    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex pt-16">
      <UnifiedSidebar /> {/* Render the unified sidebar */}
      <div className="flex-1 p-4">
        {/* Render content based on the tab */}
        {tab === 'profile' && <DashProfile />}
        {tab === 'users' && <ShowUsers />}
        {tab === 'adminhome' && <AdminDashHome />}
        {tab === 'reviews' && <AReviews />}

        
      </div>
    </div>
  );
}