import '../styles/DelegationSelector.css';
import React, { useState, useEffect, useRef } from 'react';

const countries = [
  "Antigua and Barbuda", "Armenia", "Angola", "Antarctica", "American Samoa",
  "Aland Islands", "Algeria", "Andorra", "Anguilla", "Argentina", "Aruba",
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh",
  "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan"
];

const DelegationSelector = () => {
  const [selectedDelegations, setSelectedDelegations] = useState([]);
  const [selectedToRemove, setSelectedToRemove] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customDelegation, setCustomDelegation] = useState('');
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setShowDropdown(prev => !prev);
  const openDropdown = () => setShowDropdown(true);

  const handleCountryClick = (country) => {
    if (!selectedDelegations.includes(country)) {
      setSelectedDelegations([...selectedDelegations, country]);
    }
  };

  const handleRemove = () => {
    if (selectedToRemove) {
      setSelectedDelegations(selectedDelegations.filter(d => d !== selectedToRemove));
      setSelectedToRemove(null);
    }
  };

  const handleCustomAdd = () => {
    const trimmed = customDelegation.trim();
    if (trimmed !== '' && !selectedDelegations.includes(trimmed)) {
      setSelectedDelegations([...selectedDelegations, trimmed]);
      setCustomDelegation('');
    }
  };

  const handleClear = () => {
    setSelectedDelegations([]);
    setSelectedToRemove(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <div className="header">DELEGATION</div>
    <div className="delegation-container">
      <div className="dropdown-section">
  <div className="dropdown-wrapper" ref={dropdownRef}>
    <div className="dropdown-toggle" onClick={toggleDropdown}>
      Countries / Custom Delegations <span className="arrow">▼</span>
    </div>

    {showDropdown && (
      <div className="dropdown-menu">
        <div className="custom-input">
          <input
            type="text"
            placeholder="Enter custom delegation"
            value={customDelegation}
            onChange={(e) => setCustomDelegation(e.target.value)}
          />
          <button onClick={handleCustomAdd}>Add</button>
        </div>
        {countries.map((country) => (
          <div
            key={country}
            className="dropdown-item"
            onClick={() => handleCountryClick(country)}
          >
            {country}
          </div>
        ))}
      </div>
    )}
  </div>

  <div className="selected-list">
    {selectedDelegations.map((d) => (
      <div
        key={d}
        className={`selected-country ${selectedToRemove === d ? 'selected' : ''}`}
        onClick={() => setSelectedToRemove(d)}
      >
        {d}
      </div>
    ))}
  </div>
</div>


      <div className="button-row">
        <button className="btn" onClick={handleRemove}>Remove</button>
        <button className="btn" onClick={handleClear}>Clear Matrix</button>
        <button className="btn" onClick={openDropdown}>Select From List</button>
      </div>

      <div className="footer-buttons">
        <button className="btn">Save</button>
        <button className="btn" onClick={() => setSelectedToRemove(null)}>Cancel</button>
        <button className="btn">Logout</button>
      </div>
    </div>
    </>
  );
};

export default DelegationSelector;
