import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile'; 
import Appliances from './Appliances/Appliances'; 
import AISuggestions from '../components/AISuggestions';
import DashHome from '../pages/DashHome';



import Essentials from "../pages/Essentials/Essentials";

import Clothing  from '../pages/Clothing/clothing';

import Pantry from '../pages/Pantry/Pantry';
import PantryDisplay from "../pages/PantryDisplay/PantryDisplay";

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
    <div className="min-h-screen flex pt-16">
      <UnifiedSidebar /> {/* Render the unified sidebar */}
      <div className="flex-1 p-4">
        {/* Render content based on the tab */}
        {tab === 'profile' && <DashProfile />}
        {tab === 'appliances' && <Appliances />}
        {tab === 'ai-suggestions' && <AISuggestions />}
        {tab === 'dhome' && < DashHome />}




        {tab === 'clothing' && <Clothing /> }




        {tab === 'essentials' && <Essentials />}
        {tab === 'pantry' && <Pantry />}
        {tab === 'pantry-details' && <PantryDisplay />}
      </div>
    </div>
  );
}