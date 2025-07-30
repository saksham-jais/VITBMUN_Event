import React, { useState, useEffect } from "react";
import axios from 'axios';
import Sidebar from "../components/sidebar";
import "../styles/Navbar.css";

const TopNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [committeeName, setCommitteeName] = useState(''); // Default empty

  useEffect(() => {
    const fetchCommittee = async () => {
      try {
        const res = await axios.get('/api/committee/');

        // ✅ Handle if response is correct
        if (res.data?.committee?.name) {
          setCommitteeName(res.data.committee.name);
        } else {
          console.warn("⚠ No committee name found in API response.");
          setCommitteeName(''); // fallback
        }
      } catch (error) {
        // ✅ Handle any error (500, network issue, etc.)
        console.warn("⚠ Backend error or unreachable:", error.message);
        setCommitteeName(''); // fallback so UI won't break
      }
    };

    fetchCommittee();
  }, []);

  return (
    <div className="top-navbar">
      <button className="hamburger" onClick={toggleSidebar}>☰</button>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="title-section">
        <br />
        {/* ✅ Always show something even if API fails */}
        <h1 className="title">{committeeName ? `${committeeName} COMMITTEE` : "COMMITTEE"}</h1>
      </div>
    </div>
  );
};

export default TopNavbar;
