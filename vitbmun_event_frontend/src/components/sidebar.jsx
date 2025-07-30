import React from "react";
import "../styles/sidebar.css";
import { useNavigate } from 'react-router-dom';
import { useMotion } from '../components/MotionContext'; // ✅ Import context

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const userEmail = localStorage.getItem('userEmail');
  const navigate = useNavigate();
  const { resetMotion } = useMotion(); // ✅ Use it

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={toggleSidebar}>×</button>
      <ul>
        <li onClick={() => { navigate('/'); toggleSidebar(); }}>Delegations Present</li>
          <li onClick={() => {
            resetMotion(); // ✅ Reset motion
            navigate('/caucus');
            toggleSidebar();
          }}>Record Motion</li>
          <li onClick={() => { navigate('/modcaucus'); toggleSidebar(); }}>Moderated Caucus</li>
          <li onClick={() => { navigate('/unmodcaucus'); toggleSidebar(); }}>Unmoderated Caucus</li>
          <li onClick={() => { navigate('/primarySpeaker'); toggleSidebar(); }}>Primary Speaker</li>
          <li onClick={() => { navigate('/rollcallvoting'); toggleSidebar(); }}>Roll Call Voting</li>
        {/* <li onClick={() => { navigate('/delegation'); toggleSidebar(); }}>Admin</li> */}
      </ul>
    </div>
  );
};

export default Sidebar;