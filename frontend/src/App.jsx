import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { VOICE_OPTIONS } from "./constants/voices";
import UserDropdown from "./components/UserDropdown";
import {
  Mic,
  Link2,
  Download,
  PlayCircle,
  Pause,
  AudioLines,
  LogOut,
} from "lucide-react";

// Component Module Imports
import InputPanel from "./components/InputPanel";
import AudioConsole from "./components/AudioConsole";
import AuthModal from "./components/AuthModal"; // Full page gate layout

const BACKEND_BASE = "http://localhost:5000";

export default function App() {
  // Track if a user is cleared to view the console panel
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  //THEME SYNC ENGINE: Pull state settings directly from local storage cache
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  const [inputType, setInputType] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioPlayerRef = useRef(null);
  const previewPlayerRef = useRef(null);

  // Listen for changes to local storage data attributes across components
  useEffect(() => {
    const checkTheme = () => {
      const currentTheme = localStorage.getItem("theme") || "dark";
      setIsDarkMode(currentTheme === "dark");
    };

    // Run baseline check on mount
    checkTheme();

    // Setup listener hook for click event updates inside the user dropdown module
    window.addEventListener("storage", checkTheme);

    // Custom mutation fallback tracking for same-window updates
    const observer = new MutationObserver(() => checkTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    return () => {
      window.removeEventListener("storage", checkTheme);
      observer.disconnect();
    };
  }, []);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    if (audioPlayerRef.current) {
      setCurrentTime(audioPlayerRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioPlayerRef.current) {
      setDuration(audioPlayerRef.current.duration);
    }
  };

  const handlePlayPreview = async () => {
    setPreviewLoading(true);
    setError("");
    try {
      const response = await fetch(`${BACKEND_BASE}/api/preview-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice: selectedVoice.value,
          sampleText: selectedVoice.sampleText,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch preview.");

      if (previewPlayerRef.current) {
        previewPlayerRef.current.src = data.audioUrl;
        previewPlayerRef.current.load();
        previewPlayerRef.current
          .play()
          .catch((err) => console.error("Audio interrupted:", err));
      }
    } catch (err) {
      setError(`Preview Error: ${err.message}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (inputType === "text" && !text.trim()) {
      setError("Please enter some text before generating audio.");
      return;
    }
    if (inputType === "url" && !url.trim()) {
      setError("Please enter a valid article URL.");
      return;
    }

    setLoading(true);
    setError("");
    setAudioUrl("");
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    try {
      const response = await fetch(`${BACKEND_BASE}/api/generate-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          type: inputType,
          text: inputType === "text" ? text : undefined,
          url: inputType === "url" ? url : undefined,
          voice: selectedVoice.value,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setAudioUrl(data.audioUrl);
    } catch (err) {
      setError(err.message || "Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPlay = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleScrubChange = (e) => {
    if (audioPlayerRef.current) {
      const newTime = parseFloat(e.target.value);
      audioPlayerRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setAudioUrl("");
    setText("");
    setUrl("");
  };

  if (!isAuthenticated) {
    return <AuthModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden py-8 px-4 font-sans transition-colors duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] text-white"
          : "bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 text-slate-900"
      }`}
    >
      {/* Dynamic Ambient Background Aura Filters */}
      <div
        className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none blur-[160px] transition-opacity duration-500 ${
          isDarkMode ? "bg-cyan-500/10 opacity-100" : "bg-cyan-500/5 opacity-70"
        }`}
      />
      <div
        className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none blur-[160px] transition-opacity duration-500 ${
          isDarkMode
            ? "bg-purple-500/10 opacity-100"
            : "bg-purple-500/5 opacity-70"
        }`}
      />

      <div className="relative max-w-7xl mx-auto space-y-6 z-10">
        <audio ref={previewPlayerRef} className="hidden" />

        {/* Top Navbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between border-b pb-6 max-w-7xl mx-auto pt-4 mb-4 transition-colors duration-300 ${
            isDarkMode ? "border-white/10" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <img
              src="/favicon.ico"
              alt="NarrateAI Brand Logo"
              className={`w-10 h-10 object-contain filter transition-all duration-300 ${
                isDarkMode
                  ? "drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  : "drop-shadow-[0_2px_8px_rgba(15,23,42,0.1)]"
              }`}
            />{" "}
            <span
              className={`text-3xl sm:text-4xl font-black tracking-tight select-none transition-all duration-300 ${
                isDarkMode
                  ? "bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent"
              }`}
            >
              NarrateAI
            </span>
          </div>

          {/* Interactive Profile Pill Component Hub */}
          <UserDropdown onLogout={handleLogout} />
        </motion.div>

        {/* Core Control Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <InputPanel
            inputType={inputType}
            setInputType={setInputType}
            text={text}
            setText={setText}
            url={url}
            setUrl={setUrl}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            loading={loading}
            previewLoading={previewLoading}
            error={error}
            setError={setError}
            handlePlayPreview={handlePlayPreview}
            handleGenerateAudio={handleGenerateAudio}
          />

          <AudioConsole
            audioUrl={audioUrl}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            progressPercent={progressPercent}
            selectedVoice={selectedVoice}
            formatTime={formatTime}
            handleScrubChange={handleScrubChange}
            handleCustomPlay={handleCustomPlay}
          />
        </div>

        {/* Embedded Audio Stream Controller Hook */}
        <audio
          ref={audioPlayerRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          className="hidden"
          key={audioUrl}
        />
      </div>
    </main>
  );
}
