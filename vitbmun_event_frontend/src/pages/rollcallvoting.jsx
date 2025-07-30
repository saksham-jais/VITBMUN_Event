import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/rollcallvoting.css';
import { backendUrl } from "../App";

const RollCallVoting = () => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [results, setResults] = useState({ inFavour: 0, against: 0, abstentions: 0, pass: 0 });
  const [votingRights, setVotingRights] = useState([]);
  const [votingHistory, setVotingHistory] = useState([]);
  const [countries, setCountries] = useState([]);
  const [votedCountries, setVotedCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const ws = useRef(null);

  // ✅ WebSocket setup
  useEffect(() => {
    try {
      ws.current = new WebSocket(`ws://${backendUrl}`);

      ws.current.onopen = () => {
        console.log("✅ WebSocket connected (RollCallVoting)");
        sendSocketMessage({ type: "default" });
      };

      ws.current.onclose = () => console.warn("⚠ WebSocket disconnected");
      ws.current.onerror = () => console.warn("⚠ WebSocket connection failed");
    } catch (err) {
      console.warn("⚠ Failed to establish WebSocket:", err.message);
    }

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const sendSocketMessage = (message) => {
    try {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
      } else {
        console.warn("⚠ WebSocket not open. Message skipped.");
      }
    } catch (err) {
      console.warn("⚠ Error sending WebSocket message:", err.message);
    }
  };

  // ✅ Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/country/all");
        const allCountries = res.data.countries || [];
        
        // Filter countries that are present or present and voting
        const presentCountries = allCountries.filter(
          c => c.attendance === "Present" || c.attendance === "Present and Voting"
        );
        
        setCountries(presentCountries);
      } catch (err) {
        console.error("❌ Error fetching countries:", err.message);
        setCountries([]); // Fallback to empty array
      } finally {
        setLoading(false);
      }
    };
    
    fetchCountries();
  }, []);

  const handleVote = (voteType) => {
    if (!selectedCountry) {
      alert("Please select a country before voting");
      return;
    }
    
    // Check if country has already voted
    if (votedCountries.includes(selectedCountry)) {
      alert(`${selectedCountry} has already voted`);
      return;
    }
    
    // Create a timestamp for this vote
    const timestamp = new Date().toLocaleTimeString();
    
    // Update voting history for all vote types
    const historyEntry = `${timestamp}: ${selectedCountry} voted ${voteType}`;
    setVotingHistory([...votingHistory, historyEntry]);
    
    // Update voting results
    const updatedResults = { ...results };
    
    if (voteType === 'Yes' || voteType === 'Yes With Rights') {
      updatedResults.inFavour += 1;
    } 
    else if (voteType === 'No' || voteType === 'No With Rights') {
      updatedResults.against += 1;
    }
    else if (voteType === 'Abstain') {
      updatedResults.abstentions += 1;
    }
    else if (voteType === 'Pass') {
      updatedResults.pass += 1;
    }
    
    setResults(updatedResults);
    
    // For "with rights" votes, add to special rights array
    if (voteType === 'Yes With Rights' || voteType === 'No With Rights') {
      const rightsMessage = `${selectedCountry} voted ${voteType}`;
      setVotingRights([...votingRights, rightsMessage]);
    }
    
    // Add to voted countries to prevent double voting
    setVotedCountries([...votedCountries, selectedCountry]);
    
    // Send WebSocket update to viewers
    sendSocketMessage({
      type: "voting",
      message: `Voting in progress: ${updatedResults.inFavour} in favor, ${updatedResults.against} against, ${updatedResults.abstentions} abstentions, ${updatedResults.pass} pass`
    });
    
    // Clear the selected country after vote
    setSelectedCountry('');
  };

  const resetVote = () => {
    setResults({ inFavour: 0, against: 0, abstentions: 0, pass: 0 });
    setVotingRights([]);
    setVotingHistory([]);
    setVotedCountries([]);
    setSelectedCountry('');
    
    // Notify viewers that voting has been reset
    sendSocketMessage({
      type: "voting",
      message: "Voting has been reset"
    });
  };
  
  const hideResults = () => {
    // Hide results from viewers
    sendSocketMessage({
      type: "stateUpdate",
      state: {
        type: "default"
      }
    });
  };

  // Get remaining countries that haven't voted
  const remainingCountries = countries.filter(
    country => !votedCountries.includes(country.name)
  );

  return (
    <>
      <h1 className="header">ROLL CALL VOTING</h1>
      <div className="main-layout-voting">
        <div className="main-box">
          {/* Left Section */}
          <div className="first-round">
            <h2>First Round</h2>
            {loading ? (
              <p>Loading countries...</p>
            ) : (
              <select
                size="6"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="">-- Select a country --</option>
                {remainingCountries.map((country) => (
                  <option key={country.id} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            )}

            <div className="vote-buttons">
              <button onClick={() => handleVote('Yes')}>Yes</button>
              <button onClick={() => handleVote('No')}>No</button>
              <button onClick={() => handleVote('Yes With Rights')}>Yes With Rights</button>
              <button onClick={() => handleVote('No With Rights')}>No With Rights</button>
              <button onClick={() => handleVote('Pass')}>Pass</button>
              <button onClick={() => handleVote('Abstain')}>Abstain</button>
            </div>
          </div>

          {/* Right Section */}
          <div className="outcome-section">
            <h2>Outcome</h2>
            <div className="actions-voting">
              <button onClick={hideResults}>Hide Results</button>
              <button onClick={resetVote}>Reset Vote</button>
            </div>
            <div className="results-summary">
              <p>In Favour: {results.inFavour}</p>
              <p>Against: {results.against}</p>
              <p>Abstentions: {results.abstentions}</p>
              <p>Pass: {results.pass}</p>
            </div>
            
            <div className="voting-history">
              <h3>Voting History</h3>
              <div className="history-container">
                {votingHistory.map((entry, index) => (
                  <div key={index} className="history-entry">{entry}</div>
                ))}
              </div>
            </div>
            
            <div className="voting-rights">
              <h3>Voting With Rights:</h3>
              <textarea readOnly value={votingRights.join('\n')} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RollCallVoting;
