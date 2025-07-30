import React, { useEffect, useState, useRef } from "react";
import "../styles/Viewer.css";
import vitLogo from "../assets/vitbmun_logo.svg";
import { backendUrl } from "../App";

const Viewer = () => {
  const [view, setView] = useState("default");
  const viewRef = useRef("default");
  const [message, setMessage] = useState("");
  const [motionData, setMotionData] = useState(null);
  const [timer, setTimer] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [speakers, setSpeakers] = useState([]);

  // Update the ref whenever view changes
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socket = new WebSocket(`ws:${backendUrl}`);

    socket.onopen = () => console.log("Connected to session");
    socket.onerror = () => console.log("Connection error occurred");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "stateUpdate") {
        switch (data.state.type) {
          case "default":
            setView("default");
            break;
          case "attendance":
            setMessage(data.state.message);
            setView("attendance");
            break;
          case "recordmotion":
            console.log("Motion data received:", data.state);
            setTimer(data.state.counter);
            setTotalTime(data.state.totalCounter);
            setView("recordmotion");
            setMotionData(data.state.data);
            setSelectedCountry(data.state.data.selectedCountry);
            break;
          case "PrimarySpeakersList":
            setTimer(data.state.counter);
            setTotalTime(data.state.totalCounter);
            setView("PrimarySpeakersList");
            setSelectedCountry(data.state.data.selectedCountry);
            console.log(data);
            if (data.state.data.speakers) {
              setSpeakers(data.state.data.speakers);
            }
            break;
          case "voting":
            setView("voting");
            setMessage(data.state.message);
            break;
        }
      } else if (data.type === "counterUpdate") {
        if (viewRef.current === data.state.type) {
          setTimer(data.state.counter);
          setTotalTime(data.state.totalCounter);
        }
      } else if (data.type === "selectedCountry") {
        setTimer(data.state.data.speakingTime);
        setSelectedCountry(data.state.data.selectedCountry);
      }
    };

    return () => socket.close();
  }, []);

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (!timer || !totalTime) return 0;
    const percentage = (timer / totalTime) * 100;
    return Math.min(percentage, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage < 50) return "#28a745";
    if (percentage < 80) return "#ffc107";
    return "#dc3545";
  };

  return (
    <div className="viewer-wrapper">
      <div className="header">VITBMUN'25</div>

      {view === "default" && (
        <div className="mc-container viewer-default">
          <div className="logo-container">
            <img src={vitLogo} alt="VITBMUN Logo" className="viewer-logo" />
          </div>
          <h1 className="mc-topic">Welcome to the Session</h1>
          <p className="session-message">The proceedings will begin shortly.</p>
        </div>
      )}

      {view === "attendance" && (
        <div className="mc-container">
          <h1 className="mc-topic">Roll Call in Progress</h1>
          {message && <p className="attendance-message">{message}</p>}
        </div>
      )}
      {view === "voting" && (
        <div className="mc-container">
          <h1 className="mc-topic">Voting</h1>
          {message && <p className="attendance-message">{message}</p>}
        </div>
      )}
      {view === "recordmotion" && motionData && (
        <div className="mc-container">
          <h1 className="mc-topic">{motionData.topic}</h1>
          <h2 className="motion-type">
            {motionData.type === "mod"
              ? "Moderated Caucus"
              : "Unmoderated Caucus"}
          </h2>

          <div className="mc-timer-section">
            {motionData.type === "mod" && (
              <div className="mc-timer-card">
                <div className="mc-time">{formatTime(timer)}</div>
                <div className="mc-label">SPEAKING TIME</div>
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${getProgressPercentage()}%`,
                      backgroundColor: getProgressColor(
                        getProgressPercentage()
                      ),
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div className="mc-timer-card">
              <div className="mc-time">{formatTime(totalTime)}</div>
              <div className="mc-label">TOTAL DURATION</div>
              {motionData.type !== "mod" && (
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${getProgressPercentage()}%`,
                      backgroundColor: getProgressColor(
                        getProgressPercentage()
                      ),
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          <div className="mc-board">
            {motionData.type === "mod" ? (
              <div className="viewer-current-speaker">
                <h3 className="speaker-label">Current Speaker</h3>

                <div
                  className={`speaker-highlight ${
                    !selectedCountry ? "no-speaker" : ""
                  }`}
                >
                  {selectedCountry || "No speaker has the floor"}
                </div>
              </div>
            ) : null}

            <div className="viewer-current-speaker">
              <h3 className="speaker-label">Motion Raised By:</h3>
              <div className={`speaker-highlight ${motionData.delegation}`}>
                {motionData.delegation}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "PrimarySpeakersList" && (
        <div className="mc-container">
          <h1 className="mc-topic">General Speakers List</h1>

          <div className="mc-timer-section">
            <div className="mc-timer-card">
              <div className="mc-time">{formatTime(totalTime)}</div>
              <div className="mc-label">SPEAKING TIME</div>
            </div>
          </div>

          <div className="mc-board primary-speakers">
            <div className="viewer-current-speaker">
              <h3 className="speaker-label">Current Speaker</h3>
              <div
                className={`speaker-highlight ${
                  !selectedCountry ? "no-speaker" : ""
                }`}
              >
                {selectedCountry || "No speaker has the floor"}
              </div>
            </div>

            {speakers.length > 0 && (
              <div className="speakers-queue">
                <h3 className="queue-title">Speakers Queue</h3>
                <div className="speakers-list-container">
                  <ol className="speakers-list">
                    {speakers.map((speaker, idx) => (
                      <li
                        key={idx}
                        className={speaker === selectedCountry ? "current" : ""}
                      >
                        {speaker}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="viewer-footer">
        <p>VITBMUN'25 © 2025</p>
      </footer>
    </div>
  );
};

export default Viewer;
