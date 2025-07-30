import React, { useRef, useEffect, useState } from 'react';
import '../styles/FloatingButton.css';

const FloatingButton = ({ onClick, icon = "🔄", tooltip = "Reset View" }) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 30, y: 30 });
  const [dragging, setDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const tooltipTimeout = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;

      const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - offset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - offset.current.y));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = (e) => {
      if (!dragging) return;
      setDragging(false);

      const distance = Math.hypot(
        e.clientX - dragStart.current.x,
        e.clientY - dragStart.current.y
      );

      if (distance < 5) {
        onClick?.();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, onClick]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = buttonRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
    };
    setDragging(true);
    setShowTooltip(false);
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!dragging) {
      tooltipTimeout.current = setTimeout(() => {
        setShowTooltip(true);
      }, 500);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        className={`floating-btn ${dragging ? 'dragging' : ''} ${isHovered ? 'hovered' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          position: 'fixed',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label={tooltip}
      >
        <span className="floating-btn-icon " role="img" aria-label="icon">
          {icon}
        </span>
        <div className="floating-btn-ripple"></div>
      </button>
      
      {showTooltip && !dragging && (
        <div 
          className="floating-btn-tooltip"
          style={{
            left: `${position.x + 70}px`,
            top: `${position.y + 15}px`,
            position: 'fixed',
            zIndex: 1001,
          }}
        >
          {tooltip}
        </div>
      )}
    </>
  );
};

export default FloatingButton;
