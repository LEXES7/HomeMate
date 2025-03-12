import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React from 'react'
import Home from './pages/Home'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Headers from './components/Header'
import Features from './pages/Features'


export default function App() {
  return (
    <BrowserRouter>
    <Headers/>
      <Routes>
        <Route path="/home" element={<Home/>} />
        <Route path="/signin" element={<Signin/>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
      </Routes>
    </BrowserRouter>
    
  )
}
