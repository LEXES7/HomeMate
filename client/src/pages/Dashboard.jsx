import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile'; // Profile component
import Appliances from './Appliances/Appliances'; // Appliances component

export default function Dashboard() {
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
    <div className="min-h-screen flex">
      <UnifiedSidebar /> {/* Render the unified sidebar */}
      <div className="flex-1 p-4">
        {/* Render content based on the tab */}
        {tab === 'profile' && <DashProfile />}
        {tab === 'appliances' && <Appliances />}
      </div>
    </div>
  );
}