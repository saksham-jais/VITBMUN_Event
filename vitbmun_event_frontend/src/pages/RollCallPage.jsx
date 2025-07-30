import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RollCallPage.css";
import { backendUrl } from "../App";

const RollCallPage = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const ws = useRef(null);

  // ✅ Setup WebSocket safely
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
  const messageQueue = [];
  const sendSocketMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
        console.log("✅ Sent:", message);
      } catch (err) {
        console.warn("⚠ Failed to send message:", err.message);
      }
    } else {
      messageQueue.push(message);
    }
  };
  useEffect(() => {
    let socket;

    // ✅ Fetch countries from API
    axios
      .get("/api/country/all")
      .then((res) => {
        const countries = res.data.countries || [];
        const initialized = countries.map((country) => ({
          id: country.id,
          name: country.name,
          present:
            country.attendance === "Present" ||
            country.attendance === "Present and Voting",
          voting: country.attendance === "Present and Voting",
        }));
        setAttendance(initialized);
      })
      .catch((err) => {
        console.error("Error fetching countries:", err);
      });
  }, []);
  const updateAttendanceStatus = async (countryId, status) => {
    try {
      await axios.post("/api/country/update", {
        attendanceStatus: status,
        countryId: countryId,
      });
      console.log(`✅ Status updated: ${status}`);
    } catch (error) {
      console.warn(`⚠ Cannot update status for ${countryId}. Backend offline.`);
    }
  };

  const togglePresent = (index) => {
    const current = attendance[index];
    const newPresent = !current.present;

    const updated = attendance.map((d, i) =>
      i === index
        ? { ...d, present: newPresent, voting: newPresent ? d.voting : false }
        : d
    );
    setAttendance(updated);

    const status = newPresent
      ? current.voting
        ? "Present and Voting"
        : "Present"
      : "Absent";

    updateAttendanceStatus(current.id, status);
    sendSocketMessage({
      type: "attendance",
      message: `Delegate ${current.name} is ${status}`,
    });
  };

  const toggleVoting = (index) => {
    const current = attendance[index];
    const newVoting = !current.voting;

    const updated = attendance.map((d, i) =>
      i === index
        ? { ...d, voting: newVoting, present: newVoting ? true : d.present }
        : d
    );
    setAttendance(updated);

    const status = newVoting
      ? "Present and Voting"
      : current.present
      ? "Present"
      : "Absent";

    updateAttendanceStatus(current.id, status);
    sendSocketMessage({
      type: "attendance",
      message: `Delegate ${current.name} is ${status}`,
    });
  };

  const deselectAll = () => {
    const updated = attendance.map((d) => ({
      ...d,
      present: false,
      voting: false,
    }));
    setAttendance(updated);

    updated.forEach((d) => updateAttendanceStatus(d.id, "Absent"));
    sendSocketMessage({
      type: "attendance",
      message: "All delegates marked as Absent",
    });
  };

  return (
    <>
      <div className="header">DELEGATIONS PRESENT / ROLL CALL</div>
      <div className="main-layout">
        <div className="rollcall-container">
          <div className="table-container">
            <table className="rollcall-table">
              <thead>
                <tr>
                  <th>Delegation</th>
                  <th>Present</th>
                  <th>Present and Voting</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((delegation, index) => (
                  <tr key={delegation.id}>
                    <td>{delegation.name}</td>
                    <td>
                      <button
                        className={`toggle-btn ${
                          delegation.present ? "active" : ""
                        }`}
                        onClick={() => togglePresent(index)}
                      ></button>
                    </td>
                    <td>
                      <button
                        className={`toggle-btn ${
                          delegation.voting ? "active" : ""
                        }`}
                        onClick={() => toggleVoting(index)}
                      ></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="actions">
            <button className="link-button" onClick={deselectAll}>
              Deselect All
            </button>
          </div>
        </div>

        <div className="stats-panel">
          <h2>Stats</h2>
          <div className="attendance-count">
            {attendance.filter((d) => d.present).length}/{attendance.length}
          </div>

          <div className="section">
            <h4>No Present</h4>
            <div className="card-box">
              {attendance
                .filter((d) => !d.present)
                .map((d) => (
                  <div className="country-box" key={d.id}>
                    {d.name}
                  </div>
                ))}
            </div>
          </div>

          <div className="section">
            <br />
            <h4>Present</h4>
            <div className="card-box">
              {attendance
                .filter((d) => d.present)
                .map((d) => (
                  <div className="country-box" key={d.id}>
                    {d.name}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RollCallPage;
