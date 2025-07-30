import "../styles/ModeratedCaucus.css";
import React, { useState, useEffect, useRef } from "react";
import { Pause, Play, RotateCw } from "lucide-react";
import { backendUrl } from "../App";
import { sendSocketMessage } from "../utils/socketUtils";
const ModeratedCaucus = ({ motion }) => {
  const [topic, setTopic] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Raised By");
  const [delegateName, setDelegateName] = useState("Current Speaker");
  const [speakingTime, setSpeakingTime] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [speakerTimeLeft, setSpeakerTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [presentCountries, setPresentCountries] = useState([]);

  const intervalRef = useRef(null);
  const ws = useRef(null);
  useEffect(() => {
    try {
      ws.current = new WebSocket(`ws://${backendUrl}`);
      ws.current.onclose = () => console.warn("⚠ WebSocket disconnected");
      ws.current.onerror = () => console.warn("⚠ WebSocket connection failed");
    } catch (err) {
      console.warn("⚠ Failed to establish WebSocket:", err.message);
    }

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("/api/country/all"); // Replace with actual API URL
        const data = await res.json();

        const filtered = data.countries.filter(
          (c) =>
            c.attendance === "Present" || c.attendance === "Present and Voting"
        );

        setPresentCountries(filtered.map((c) => c.name));
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (motion) {
      setTopic(motion.topic || "");
      setDelegateName(motion.delegation || "");
      setSpeakingTime(motion.speakingTime || "");
      setTotalDuration(motion.duration || "");
      setSpeakerTimeLeft(parseTime(motion.speakingTime));
      setTotalTimeLeft(parseTime(motion.duration));
      setIsRunning(false);
    }
  }, [motion]);

  useEffect(() => {
    if (isRunning && speakerTimeLeft > 0 && totalTimeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSpeakerTimeLeft((prev) => prev - 1);
        setTotalTimeLeft((prev) => prev - 1);
        sendSocketMessage(ws.current, {
          action: "updateTimer",
        });
      }, 1000);
    } else if (isRunning) {
      setIsRunning(false);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, speakerTimeLeft, totalTimeLeft]);

  const parseTime = (val) => {
    if (val === undefined || val === null) return 0;
    const str = val.toString();
    if (str.includes(":")) {
      const [min, sec] = str.split(":").map(Number);
      return (min || 0) * 60 + (sec || 0);
    }
    return Number(str) || 0;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (!speakingTime || !totalDuration || !selectedCountry) {
      alert("Fill all fields");
      return;
    }
    if (speakerTimeLeft === 0) {
      setSpeakerTimeLeft(parseTime(speakingTime));
    }

    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    sendSocketMessage(ws.current, {
      action: "resetTimer",
    });
    pauseTimer();
    setSpeakerTimeLeft(parseTime(speakingTime));
    setTotalTimeLeft(parseTime(totalDuration));
  };

  const handleCountrySelect = (name) => {
    if (totalTimeLeft > 0) {
      setSelectedCountry(name);
      sendSocketMessage(ws.current, {
        action: "selectedCountry",
        selectedCountry: name,
      });
      setSpeakerTimeLeft(parseTime(speakingTime));
      setIsRunning(false);
    } else {
      alert("The caucus time has ended.");
    }
  };

  return (
    <>
      <div className="mc-header">Moderated Caucus</div>
      <div className="mc-container">
        <h1 className="mc-topic">{topic || "TOPIC"}</h1>

        <div className="mc-timer-section">
          <div className="mc-timer-card">
            <div className="mc-time">{formatTime(speakerTimeLeft)}</div>
            <div className="mc-label">SPEAKING TIME</div>
          </div>

          <div className="mc-timer-card">
            <div className="mc-time">{formatTime(totalTimeLeft)}</div>
            <div className="mc-label">TOTAL DURATION</div>
          </div>
        </div>

        <div className="mc-controls">
          <button onClick={pauseTimer} className="mc-icon-button">
            <Pause />
          </button>
          <button onClick={startTimer} className="mc-play-button">
            <Play />
          </button>
          <button onClick={resetTimer} className="mc-icon-button">
            <RotateCw />
          </button>
        </div>

        <div className="mc-board">
          <div className="mc-board-grid">
            {presentCountries.map((name, i) => (
              <div
                key={i}
                className={`mc-country ${
                  selectedCountry === name ? "selected" : ""
                }`}
                onClick={() => handleCountrySelect(name)}
              >
                {name}
              </div>
            ))}
          </div>

          <div className="mc-right-column-grid">
            <div className="mc-right-cell">
              <div className="mc-right-column-title">{selectedCountry}</div>
            </div>
            <div className="mc-right-cell">
              <div className="mc-right-column-title">{delegateName}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModeratedCaucus;
