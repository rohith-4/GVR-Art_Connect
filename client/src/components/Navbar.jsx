import React, { useState } from 'react';
import { FaUser, FaShoppingCart, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Home from './Home';
import Artworks from './Artworks'; 
import About from './About';
import Contact from './Contact';
import Artist_profile from './Artist-profile';
import Cart from './Cart';
import '../assets/styles/navbar.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toDirectImageUrl } from '../utils/imageUtils.js';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getRandomColor = () => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  // NEW: call provided onLogout handler (if any), then navigate
  const handleLogout = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      // prefer parent-provided handler (App passes logout from context)
      if (onLogout && typeof onLogout === 'function') {
        await onLogout();
      } else {
        // fallback: call backend directly
        // backendUrl may not be available here; call relative endpoint which works in dev proxy setups,
        // otherwise provide full backendUrl from context or env.
        await axios.post('/api/auth/logout', {}, { withCredentials: true });
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      // close menus and navigate to login/home
      setShowDropdown(false);
      setIsMenuOpen(false);
      navigate('/login');
    }
  };

  console.log({user});
  return (
    
    <nav className="navbar">
      <div className="containerNav">
        <Link to="/" className="logo">ArtGallery</Link>
        
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          {/* Mobile menu header with user info and close button */}
          {isMenuOpen && (
            <div className="mobile-menu-header">
              {user ? (
                <div className="user-profile-mobile">
                  {user.photoURL ? (
                    <img src={toDirectImageUrl(user.photoURL)} alt={user.displayName} onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/placeholder-avatar.png'}} />
                  ) : (
                    <div 
                      className="user-avatar" 
                      style={{ backgroundColor: getRandomColor() }}
                    >
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span>{user.displayName || user.email}</span>
                </div>
              ) : (
                <button className="login-btn-mobile">Login</button>
              )}
              <button className="close-menu" onClick={toggleMenu}>
                <FaTimes />
              </button>
            </div>
          )}

          {/* Regular nav links */}
          <Link to="/">Home</Link>
          <Link to="/artworks">Artworks</Link>
          <Link to="/artist-profile">Artists</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/cart" className="cart-icon">
            <FaShoppingCart />
            <span className="cart-count">0</span>
          </Link>

          {/* Mobile user options */}
          {isMenuOpen && user && (
            <>
              <hr className="mobile-divider" />
              <div className="mobile-user-options">
                <Link to="/profile">Profile</Link>
                <Link to="/settings">Settings</Link>
                {!user.emailVerified && <Link to="/verify-email">Verify Email</Link>}
                {/* changed to button to call handleLogout */}
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            </>
          )}
        </div>

        {/* Desktop user section */}
        <div className="user-section">
          {user ? (
            <div className="user-profile" onClick={toggleDropdown}>
              {user.photoURL ? (
                <img src={toDirectImageUrl(user.photoURL)} alt={user.displayName} onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/placeholder-avatar.png'}} />
              ) : (
                <div 
                  className="user-avatar" 
                  style={{ backgroundColor: getRandomColor() }}
                >
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <FaChevronDown className={`dropdown-arrow ${showDropdown ? 'rotate' : ''}`} />
              
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link to="/profile">Profile</Link>
                  <Link to="/settings">Settings</Link>
                  {!user.emailVerified && <Link to="/verify-email">Verify Email</Link>}
                  {/* changed to button to call handleLogout */}
                  <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={handleLoginClick}>
            Login
          </button>
          )}
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <FaBars />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;