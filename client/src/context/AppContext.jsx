import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  // ensure axios sends cookies for cross-site requests
  axios.defaults.withCredentials = true;

  const [userData, setUserData] = useState(null);
  const [isLoggedin, setIsLoggedin] = useState(false);

  const getUserData = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/data`, { withCredentials: true });
      if (res?.data?.success) {
        setUserData(res.data.userData);
        setIsLoggedin(true);
        return res.data;
      }
      // not authorized or no user
      setUserData(null);
      setIsLoggedin(false);
      return res.data;
    } catch (err) {
      setUserData(null);
      setIsLoggedin(false);
      // optional: show toast only when appropriate
      console.warn('getUserData error', err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      const res = await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
      if (res?.data?.success) {
        setUserData(null);
        setIsLoggedin(false);
        toast.success(res.data.message || 'Logged out');
      } else {
        // server returned failure but still clear client state
        setUserData(null);
        setIsLoggedin(false);
        toast.info(res.data.message || 'Logged out');
      }
      return res.data;
    } catch (err) {
      // clear client state even if server call failed
      setUserData(null);
      setIsLoggedin(false);
      toast.error(err.response?.data?.message || err.message || 'Logout failed');
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    // try to load user once at app start
    getUserData();
  }, []);

  return (
    <AppContent.Provider value={{ backendUrl, userData, setUserData, isLoggedin, setIsLoggedin, getUserData, logout }}>
      {children}
    </AppContent.Provider>
  );
};

export { AppContextProvider as AppProvider };
export default AppContextProvider;