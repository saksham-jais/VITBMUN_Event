import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/RecordMotion.css";
import { backendUrl } from "../App";

const RecordMotion = ({ onAddToCaucus }) => {
  const [motions, setMotions] = useState([
    {
      delegation: "",
      type: "",
      duration: "",
      speakingTime: "",
      topic: "",
      otherDescription: "",
    },
  ]);
  const [delegations, setDelegations] = useState([]);
  const [history, setHistory] = useState([]);

  const ws = useRef(null);

  useEffect(() => {
    try {
      ws.current = new WebSocket(`ws://${backendUrl}`);

      ws.current.onopen = () => {
        console.log("✅ WebSocket connected (RecordMotion)");
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

  useEffect(() => {
    const fetchDelegations = async () => {
      try {
        const res = await axios.get("/api/country/all");
        const countries = res.data.countries || [];
        const allowed = countries.filter(
          (c) =>
            c.attendance === "Present" || c.attendance === "Present and Voting"
        );
        setDelegations(
          allowed.map((c) => ({
            name: c.name,
            id: c.id,
            committeeId: c.committeeId,
          }))
        );
      } catch (err) {
        console.warn("⚠ Could not fetch delegations:", err.message);
        setDelegations([]); 
      }
    };

    fetchDelegations();
    fetchMotionHistory();
  }, []);

  const fetchMotionHistory = async () => {
    try {
      const res = await axios.get("/api/motion/all");
      const motions = res.data.motions || [];

      motions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setHistory(motions);
    } catch (err) {
      console.warn("⚠ Could not fetch motion history:", err.message);
      setHistory([]);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...motions];
    updated[index][field] = value;
    setMotions(updated);
  };

  const handleAdd = async (index) => {
    const motion = motions[index];
    if (
      !motion.type ||
      !motion.delegation ||
      !motion.duration ||
      !motion.speakingTime ||
      !motion.topic
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const selectedCountry = delegations.find(
      (d) => d.name === motion.delegation
    );
    if (!selectedCountry) {
      alert("Delegation not found.");
      return;
    }

    const payload = {
      topic: motion.topic,
      type: motion.type.toLowerCase(),
      totalDuration: Number(motion.duration),
      duration: Number(motion.duration),
      speakingTime: Number(motion.speakingTime),
      countryId: selectedCountry.id,
      committeeId: selectedCountry.committeeId,
      delegation: selectedCountry.name,
      selectedCountry: null,
    };

    if (motion.type.toLowerCase() === "other") {
      if (!motion.otherDescription) {
        alert("Description is required for 'Other' type.");
        return;
      }
      payload.otherDescription = motion.otherDescription;
    }

    try {
      const res = await axios.post("/api/motion/add", payload);
      console.log("✅ Motion submitted:", res.data);

      sendSocketMessage({
        type: "recordmotion",
        data: payload,
        counter: Number(motion.speakingTime),
        totalCounter: Number(motion.duration),
      });
      if (onAddToCaucus) onAddToCaucus(motion);
      fetchMotionHistory();
    } catch (err) {
      console.warn("⚠ Motion submission failed:", err.message);
    }
  };

  const handleHistoryClick = (motion) => {
    const matchedCountry = delegations.find((d) => d.id === motion.countryId);
    if (!matchedCountry) return;

    const updated = [...motions];
    updated[0] = {
      delegation: matchedCountry.name,
      type: motion.type.charAt(0).toUpperCase() + motion.type.slice(1),
      duration: motion.totalDuration, // ✅ in seconds
      speakingTime: motion.speakingTime, // ✅ in seconds
      topic: motion.topic,
      otherDescription: motion.otherDescription || "",
    };
    setMotions(updated);
  };

  const handleAddRow = () => {
    if (motions.length >= 3) {
      alert("You can only add up to 3 motions at a time.");
      return;
    }
    setMotions([
      ...motions,
      {
        delegation: "",
        type: "",
        duration: "",
        speakingTime: "",
        topic: "",
        otherDescription: "",
      },
    ]);
  };

  return (
    <>
      <div className="header">RECORD MOTION</div>
      <div className="main-layout-recordmotion">
        <div className="record-motion-container">
          <button
            className="reset-btn"
            onClick={() =>
              setMotions([
                {
                  delegation: "",
                  type: "",
                  duration: "",
                  speakingTime: "",
                  topic: "",
                  otherDescription: "",
                },
              ])
            }
          >
            Reset All
          </button>

          <div className="motions-wrapper">
            {motions.map((motion, index) => (
              <div key={index} className="motion-row">
                {index > 0 && (
                  <button
                    className="remove-row-btn"
                    onClick={() =>
                      setMotions(motions.filter((_, i) => i !== index))
                    }
                    title="Remove row"
                  >
                    ×
                  </button>
                )}

                <div className="form-group">
                  <label>Delegation</label>
                  <select
                    value={motion.delegation}
                    onChange={(e) =>
                      handleChange(index, "delegation", e.target.value)
                    }
                  >
                    <option value="">--Select--</option>
                    {delegations.map((d, idx) => (
                      <option key={idx} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group radio-group">
                  {["Mod", "Unmod", "Other"].map((type) => (
                    <label key={type}>
                      <input
                        type="radio"
                        name={`type-${index}`}
                        value={type}
                        checked={motion.type === type}
                        onChange={(e) =>
                          handleChange(index, "type", e.target.value)
                        }
                      />
                      {type}
                    </label>
                  ))}
                </div>

                {motion.type === "Other" && (
                  <div className="form-group">
                    <label>Other Description</label>
                    <input
                      type="text"
                      value={motion.otherDescription}
                      onChange={(e) =>
                        handleChange(index, "otherDescription", e.target.value)
                      }
                      placeholder="Enter custom motion description"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Duration (sec)</label>
                  <input
                    type="text"
                    value={motion.duration}
                    onChange={(e) =>
                      handleChange(index, "duration", e.target.value)
                    }
                    placeholder="Duration in seconds"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Speaking Time (sec)</label>
                  <input
                    type="text"
                    value={motion.speakingTime}
                    onChange={(e) =>
                      handleChange(index, "speakingTime", e.target.value)
                    }
                    placeholder="Speaking time in seconds"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Topic</label>
                  <input
                    type="text"
                    value={motion.topic}
                    onChange={(e) =>
                      handleChange(index, "topic", e.target.value)
                    }
                    placeholder="Topic"
                  />
                </div>

                <button className="add-btn" onClick={() => handleAdd(index)}>
                  Add to Caucus
                </button>
              </div>
            ))}
          </div>

          <button className="add-row-btn" onClick={handleAddRow}>
            +
          </button>

          <div className="history-section">
            <h3>Motion History</h3>
            <div className="history-box">
              <table>
                <thead>
                  <tr>
                    <th>SNo.</th>
                    <th>Delegation</th>
                    <th>Type</th>
                    <th>Duration (sec)</th>
                    <th>Speaking (sec)</th>
                    <th>Topic</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((motion, idx) => (
                    <tr
                      key={motion.id || idx}
                      onClick={() => handleHistoryClick(motion)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{idx + 1}</td>
                      <td>{motion.country?.name || "—"}</td>
                      <td>{motion.type}</td>
                      <td>{motion.totalDuration}s</td>
                      <td>{motion.speakingTime}s</td>
                      <td>{motion.topic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecordMotion;
