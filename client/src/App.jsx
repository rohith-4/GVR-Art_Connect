import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Home from './components/Home';
import Artworks from './components/Artworks';
import About from './components/About';
import Contact from './components/Contact';
import Artist_profile from './components/Artist-profile';
import Cart from './components/Cart';
import Footer from './components/Footer';
import Login from './components/login';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { useContext } from 'react';
import { AppContent } from './context/AppContext.jsx';

const App = () => {
  // get logout if your context provides one (safe if undefined)
  const { userData, logout } = useContext(AppContent);
  const user = userData;
  return (
    <div>
      {/* pass logout handler if available */}
      <Navbar user={user} onLogout={logout} />
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artworks" element={<Artworks />} />
        <Route path="/artist-profile" element={<Artist_profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        {/* Add more routes as needed */}
      </Routes>
      <Footer /> 
    </div>
  )
}

export default App