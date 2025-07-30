import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/primarySpeaker.css";
import { backendUrl } from "../App";

const PrimarySpeakersList = () => {
  const [speakingTime, setSpeakingTime] = useState(60);
  const [speakers, setSpeakers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressColor, setProgressColor] = useState("green");

  const intervalRef = useRef(null);
  const ws = useRef(null);

  const totalSeconds = Number(speakingTime) || 0;

  // WebSocket setup
  useEffect(() => {
    ws.current = new WebSocket(`ws://${backendUrl}`);

    ws.current.onopen = () => {
      console.log("✅ WebSocket connected");
      sendSocketMessage({
        type: "PrimarySpeakersList",
        totalCounter: speakingTime,
        counter: 0,
        data: {
          speakingTime: 0,
          duration: speakingTime,
        },
      });
    };

    ws.current.onclose = () => console.warn("⚠ WebSocket disconnected");
    ws.current.onerror = () => console.warn("⚠ WebSocket error");

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const sendSocketMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all countries
        const res = await axios.get("/api/country/all");
        
        // Filter for present countries (for dropdown)
        const presentCountries = res.data.countries.filter(
          c => c.attendance === "Present" || c.attendance === "Present and Voting"
        );
        setCountries(presentCountries);

        // Filter for queued countries (for speakers list)
        const queuedCountries = res.data.countries.filter(
          c => (c.attendance === "Present" || c.attendance === "Present and Voting") && 
               c.gsl === "queued"
        );
        setSpeakers(queuedCountries);

        // Select the first queued country if available
        if (queuedCountries.length > 0) {
          setSelectedId(queuedCountries[0].id);
        }
      } catch (err) {
        console.warn("⚠ Could not fetch countries:", err.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev < totalSeconds) {
            const newTime = prev + 1;
            const percentage = (newTime / totalSeconds) * 100;
            setProgress(percentage);
            setProgressColor(
              percentage < 50 ? "green" : percentage < 80 ? "orange" : "red"
            );
            return newTime;
          } else {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return prev;
          }
        });
        const currentSpeaker = speakers.find((s) => s.id === selectedId);
        if (currentSpeaker) {
          sendSocketMessage({
            action: "updateTimer",
          });
        }
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, totalSeconds, selectedId, speakers]);

  const yieldSpeaker = async () => {
    if (!selectedId) return;
    const current = speakers.find((s) => s.id === selectedId);
    if (!current) return;

    try {
      await axios.post(`/api/gsl/update`, {
        country_Id: current.id,
        gslValue: "spoken",
      });
    } catch (err) {
      console.warn("⚠ Failed to mark spoken:", err.message);
    }

    // Remove the yielded speaker from the list
    const updatedSpeakers = speakers.filter((s) => s.id !== selectedId);
    setSpeakers(updatedSpeakers);

    // Select the next speaker if available
    const nextSpeaker = updatedSpeakers.length > 0 ? updatedSpeakers[0].id : null;
    setSelectedId(nextSpeaker);
    
    sendSocketMessage({
      action: "selectedCountry",
      selectedCountry: nextSpeaker ? updatedSpeakers[0].name : null,
    });
    sendSocketMessage({
      action: "resetTimer",
    });
    resetTimer();
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setTimer(0);
    setIsRunning(false);
    setProgress(0);
    setProgressColor("green");
  };

  const handleRemoveSpeaker = async () => {
    if (!selectedId) return;
    
    try {
      // Update the country's gsl status to "open"
      await axios.post(`/api/gsl/update`, {
        country_Id: selectedId,
        gslValue: "open",  // Changed from "queued" to "open"
      });

      // Remove from speakers list
      setSpeakers((prev) => prev.filter((s) => s.id !== selectedId));
      
      // Select the next speaker if available
      const nextSpeaker = speakers.length > 1 
        ? speakers.find(s => s.id !== selectedId)?.id 
        : null;
      setSelectedId(nextSpeaker);
      
      resetTimer();
      
      // Update WebSocket
      sendSocketMessage({
        action: "selectedCountry",
        selectedCountry: nextSpeaker ? speakers.find(s => s.id === nextSpeaker)?.name : null,
      });
      sendSocketMessage({
        action: "resetTimer",
      });
      
    } catch (err) {
      console.warn("⚠ Failed to remove speaker:", err.message);
    }
  };

  const clearAll = () => {
    setSpeakers([]);
    setSelectedId(null);
    resetTimer();
    sendSocketMessage({
      action: "resetTimer",
    });
    sendSocketMessage({
      type: "PrimarySpeakersList",
      totalCounter: speakingTime,
      data: {
        speakingTime: 0,
        duration: speakingTime,
      },
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <>
      <div className="header">PRIMARY SPEAKERS LIST</div>
      <div className="main-layout-speakerlst">
        <div className="content">
          <div className="timer-section">
            <div className="current-speaker">
              {selectedId
                ? `Current Speaker: ${
                    speakers.find((s) => s.id === selectedId)?.name
                  }`
                : "No Speaker Selected"}
            </div>
            <div className="timer-display">
              {formatTime(timer)} / {speakingTime}s
            </div>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${progress}%`, background: progressColor }}
              ></div>
            </div>
          </div>

          <div className="control-panel">
            <div className="form-groupp">
              <label>Speaking Time</label>
              <input
                type="number"
                value={speakingTime}
                onChange={(e) => {
                  setSpeakingTime(e.target.value);
                  sendSocketMessage({
                    type: "PrimarySpeakersList",
                    totalCounter: e.target.value,
                    data: {
                      speakingTime: 0,
                      duration: e.target.value,
                    },
                  });
                }}
                placeholder="Enter time in seconds"
                min="1"
              />
            </div>

            <select
              onChange={async (e) => {
                const selectedId = e.target.value;
                if (!selectedId) return;

                const country = countries.find((c) => c.id === selectedId);
                if (!country) return;

                if (!speakers.find((s) => s.id === country.id)) {
                  const updatedList = [...speakers, country];
                  setSpeakers(updatedList);
                  setSelectedId(country.id);

                  try {
                    await axios.post("/api/gsl/update", {
                      country_Id: country.id,
                      gslValue: "queued",
                    });
                  } catch (err) {
                    console.warn("⚠ Failed to update GSL:", err.message);
                  }
                }
                e.target.value = "";
              }}
            >
              <option value="">Add Country to Primary Speakers List</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name} {country.gsl === "queued"}
                </option>
              ))}
            </select>
            
            <ul className="speaker-list">
              {speakers.map((speaker, idx) => (
                <li
                  key={speaker.id}
                  className={speaker.id === selectedId ? "active-speaker" : ""}
                  onClick={() => {
                    setSelectedId(speaker.id)
                    sendSocketMessage({
                      action: "resetTimer",
                    });
                    resetTimer();
                  }}
                >
                  {idx + 1}. {speaker.name} {speaker.gsl === "queued"}
                </li>
              ))}
            </ul>

            <div className="buttons">
              <button
                onClick={() => {
                  if (!selectedId) return;
                  setIsRunning(true);
                  const currentSpeaker = speakers.find(
                    (s) => s.id === selectedId
                  );
                  if (currentSpeaker) {
                    sendSocketMessage({
                      action: "selectedCountry",
                      selectedCountry: currentSpeaker.name,
                    });
                    // sendSocketMessage({
                    //   action: "resetTimer",
                    // });
                  }
                }}
              >
                Start
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                }}
              >
                Pause
              </button>
              <button onClick={yieldSpeaker}>Yield</button>
              <button
                onClick={handleRemoveSpeaker}
              >
                Remove
              </button>
              <button onClick={clearAll}>Clear All</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrimarySpeakersList;