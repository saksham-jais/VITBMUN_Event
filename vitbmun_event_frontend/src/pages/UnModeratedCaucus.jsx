import '../styles/ModeratedCaucus.css';
import React, { useState, useEffect, useRef } from 'react';
import { Pause, Play, RotateCw } from 'lucide-react';
import { sendSocketMessage } from '../utils/socketUtils';
import { backendUrl } from '../App'; // Make sure this import exists

const UnModeratedCaucus = ({ motion }) => {
    // Move presentCountries inside the component
    const presentCountries = [
        'Brazil', 'Canada', 'Carthage', 'China', 'France',
        'Germany', 'Mexico', 'Qing Dynasty', 'Republic of Rome', 'Russia'
    ];
    
    const [topic, setTopic] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('Country');
    const [delegateName, setDelegateName] = useState('Current Speaker');
    const [totalDuration, setTotalDuration] = useState('');
    const [totalTimeLeft, setTotalTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const intervalRef = useRef(null);
    const ws = useRef(null);
    
    // Move WebSocket setup inside the component
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
        if (motion) {
            setTopic(motion.topic || '');
            setDelegateName(motion.delegation || '');
            setTotalDuration(motion.duration || '');
            // Set the actual numeric timers when motion changes
            setTotalTimeLeft(parseTime(motion.duration));
            setIsRunning(false);  // pause timer on load, user can start it manually
        }
    }, [motion]);

    useEffect(() => {
        if (isRunning && totalTimeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTotalTimeLeft(prev => prev - 1);
                sendSocketMessage(ws.current, {
                    action: "updateTimer",
                });
            }, 1000);
        } else if (isRunning && totalTimeLeft <= 0) {
            // Stop the timer if total time runs out
            setIsRunning(false);
            clearInterval(intervalRef.current);
        }
        
        return () => clearInterval(intervalRef.current);
    }, [isRunning, totalTimeLeft, totalDuration]);

    const parseTime = (str) => {
        if (!str) return 0;
        str = String(str).trim();
        if (str.includes(':')) {
            const [min, sec] = str.split(':').map(Number);
            return (min || 0) * 60 + (sec || 0);
        }
        return Number(str) || 0;
    };
    
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const startTimer = () => {
        if (!totalDuration) {
            alert('Total duration is required');
            return;
        }
    
        // Only reset if timer is at 0 (new session)
        if (totalTimeLeft === 0) {
            setTotalTimeLeft(parseTime(totalDuration));
        }
    
        setIsRunning(true);
    };

    const pauseTimer = () => setIsRunning(false);
    
    const resetTimer = () => {
        pauseTimer();
        setTotalTimeLeft(parseTime(totalDuration));
        
        sendSocketMessage(ws.current, {
            action: "resetTimer",
        });
    };

    return (
        <>
            <div className="mc-header">Unmoderated Caucus</div>
            <div className="mc-container">
                <h1 className="mc-topic">{topic || 'TOPIC'}</h1>

                <div className="mc-timer-section">
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

                <div className="unmodmc-board">
                    <div className="unmod_mc-right-column-grid">
                        <div className="mc-right-cell">
                            <div className="mc-right-column-title">{delegateName}</div>
                            <div className="mc-blank-box" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UnModeratedCaucus;
