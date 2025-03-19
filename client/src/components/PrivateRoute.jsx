import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoute({adminOnly = false}) {
    const {currentUser} = useSelector((state) => state.user);

    if(!currentUser){
        return <Navigate to='/signin'/>
    }
    if (adminOnly && !currentUser.isAdmin) {
      return <Navigate to="/dashboard" />; // Redirect non-admins to user dashboard
    }
  
    return <Outlet />;
  }