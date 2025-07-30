import React, { createContext, useContext, useState } from "react";

const MotionContext = createContext();

export const useMotion = () => useContext(MotionContext);

export const MotionProvider = ({ children }) => {
  const [selectedMotion, setSelectedMotion] = useState(null);

  const resetMotion = () => setSelectedMotion(null);

  return (
    <MotionContext.Provider value={{ selectedMotion, setSelectedMotion, resetMotion }}>
      {children}
    </MotionContext.Provider>
  );
};
