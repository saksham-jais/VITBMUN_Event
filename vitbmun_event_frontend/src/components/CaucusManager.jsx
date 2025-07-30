import React, { useState } from 'react';
import RecordMotion from '../pages/RecordMotionPage';
import ModeratedCaucus from '../pages/ModeratedCaucus';
import UnmoderatedCaucus from '../pages/UnModeratedCaucus';
import Sidebar from '../components/sidebar';
import { useMotion } from '../components/MotionContext'; // ✅ Import context

const CaucusManager = () => {
  const { selectedMotion, setSelectedMotion } = useMotion(); // ✅ Use context
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddToCaucus = (motion) => {
    console.log("Motion passed:", motion);
    if (motion.type === "Mod") {
      setSelectedMotion(motion);
    }
    else if (motion.type === "Unmod") {
      setSelectedMotion(motion);
    }
    else {
      alert("Only Moderated Caucus is supported at this time.");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {!selectedMotion ? (
        <RecordMotion onAddToCaucus={handleAddToCaucus} />
      ) : selectedMotion.type === "Mod" ? (
        <ModeratedCaucus motion={selectedMotion} />
      ) : selectedMotion.type === "Unmod" ? (
        <UnmoderatedCaucus motion={selectedMotion} />
      ) : null}

    </>
  );
};

export default CaucusManager;
