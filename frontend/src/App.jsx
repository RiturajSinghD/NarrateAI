import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { VOICE_OPTIONS } from "./constants/voices";

// Component Module Imports
import InputPanel from "./components/InputPanel";
import AudioConsole from "./components/AudioConsole";

const BACKEND_BASE = "http://localhost:5000";

export default function App() {
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
        headers: { "Content-Type": "application/json" },
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] py-8 px-4 font-sans text-white">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-6 z-10">
        <audio ref={previewPlayerRef} className="hidden" />

        {/* Top Navbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between border-b border-white/5 pb-4"
        >
          <div className="flex items-center gap-3">
            <img
              src="/favicon.ico"
              alt="NarrateAI Logo"
              className="w-7 h-7 object-contain"
            />

            <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              NarrateAI
            </span>
          </div>
        </motion.div>

        {/* Modular Grid Container */}
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

        {/* Core Media Node */}
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
          key={audioUrl} // Forces re-render on new file generation
        />
      </div>
    </main>
  );
}
