import React, { useEffect, useRef } from 'react';

const Modal = ({ children, onClose }) => {
  const modalRef = useRef();

  // Close the modal if the click is outside of the modalRef area
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      // Check if the clicked element is part of the Autocomplete dropdown
      if (!event.target.closest('.MuiAutocomplete-popper')) {
        onClose();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div ref={modalRef}>
        {children}
        <button onClick={onClose} style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "none",
          border: "none",
          fontSize: "1.5em",
          cursor: "pointer",
        }}>×</button>
      </div>
    </div>
  );
};

export default Modal;