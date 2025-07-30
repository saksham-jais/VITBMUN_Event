import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RollCallPage from "./pages/RollCallPage";
import Viewer from "./pages/Viewer";
import Navbar from "./components/Navbar";
import FloatingButton from "./components/FloatingButton";
import CaucusManagerPage from "./components/CaucusManager";
import ModCaucus from "./pages/ModeratedCaucus";
import UnModCaucus from "./pages/UnModeratedCaucus";
import PrimarySpeaker from "./pages/primarySpeaker";
import RollCallVoting from "./pages/rollcallvoting";
import { MotionProvider } from "./components/MotionContext";

export const backendUrl = "10.149.95.108:8080"; //Give your backend URL here

function App() {
  const handleFloatingClick = () => {
    const ws = new WebSocket(`ws://${backendUrl}`);
    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      ws.send(JSON.stringify({ type: "default" }));
    };
    
  };

  return (
    <MotionProvider>
      <Router>
        <Routes>
          {/* ✅ Viewer Route without Navbar or FloatingButton */}
          <Route path="/viewer" element={<Viewer />} />

          {/* ✅ All other routes with Navbar + FloatingButton */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <FloatingButton onClick={handleFloatingClick} />
                <Routes>
                  <Route path="/" element={<RollCallPage />} />
                  <Route path="/caucus" element={<CaucusManagerPage />} />
                  <Route path="/modcaucus" element={<ModCaucus />} />
                  <Route path="/unmodcaucus" element={<UnModCaucus />} />
                  <Route path="/primaryspeaker" element={<PrimarySpeaker />} />
                  <Route path="/rollcallvoting" element={<RollCallVoting />} />
                  <Route path="/viewer" element={<Viewer/>} />
                </Routes>
              </>
            }
          />
        </Routes>
      </Router>
    </MotionProvider>
  );
}

export default App;
