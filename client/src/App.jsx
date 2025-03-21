import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import Home from './pages/Home';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Headers from './components/Header';
import Features from './pages/Features';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Headers />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard route */}
        </Route>

        <Route element={<PrivateRoute adminOnly={true} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}