import { useState, useRef } from "react";
import { Mic, Link2, Download, PlayCircle, Pause } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_BASE = "http://localhost:5000";

const VOICE_OPTIONS = [
  {
    label: "Aarti (Empathetic Female - Indo-English/Hindi)",
    value: "en-IN-AartiNeural",
    sampleText:
      "Hmm, hello there! My name is Aarti. I can narrate your text with a very soft, natural, and conversational tone.",
  },
  {
    label: "Arjun (Natural Male - Indo-English/Hindi)",
    value: "en-IN-ArjunNeural",
    sampleText:
      "Hey! I am Arjun. My voice is engineered to sound incredibly natural, handling pauses just like a human reader.",
  },
  {
    label: "Jane (Expressive Female - US)",
    value: "en-US-JaneNeural", // FIXED: Cleared the invalid Dragon HD colon formatting
    sampleText:
      "Hello! I am Jane, powered by Azure's expressive neural engine for premium speech synthesis.",
  },
  {
    label: "Davis (Audiobook Male - US)",
    value: "en-US-DavisNeural", // FIXED: Replaced with valid Azure core voice string
    sampleText:
      "Welcome. I am Davis. I provide high-fidelity speech synthesis, perfect for long-form articles and storytelling.",
  },
  {
    label: "Ava (Expressive Female - US)",
    value: "en-US-AvaNeural", // FIXED
    sampleText: "Hello! I am Ava, your standard expressive voice option.",
  },
  {
    label: "Brian (Natural Male - US)",
    value: "en-US-BrianNeural", // FIXED
    sampleText:
      "Hey there! I am Brian, a natural sounding conversational voice.",
  },
  {
    label: "Aarav (Clear Male - Indian English)",
    value: "en-IN-AaravNeural",
    sampleText:
      "Namaste! I am Aarav, providing clear speech with an Indian accent.",
  },
  {
    label: "Ananya (Professional Female - Indian English)",
    value: "en-IN-AnanyaNeural",
    sampleText: "Hello! I am Ananya, your professional narrator voice.",
  },
];

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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] py-12 px-4 font-sans text-white">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/20 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/20 blur-[140px] rounded-full" />

      <div className="relative max-w-4xl mx-auto space-y-8 z-10">
        <audio ref={previewPlayerRef} className="hidden" />

        {/* Hero Banner Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent pt-6">
            NarrateAI
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Listen to your favorite web articles, blogs, and documents on the
            go.
          </p>
        </motion.div>

        {/* Configuration Panel Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Format Selection Tabs */}
          <div className="flex p-3 gap-3 border-b border-white/10 bg-black/20">
            <button
              onClick={() => {
                setInputType("text");
                setError("");
              }}
              className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                inputType === "text"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              Paste Raw Text
            </button>
            <button
              onClick={() => {
                setInputType("url");
                setError("");
              }}
              className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                inputType === "url"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              Provide Article Link
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Persona Setup */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-cyan-300 mb-3">
                <Mic className="w-4 h-4" />
                Select Voice Persona
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-lg"
                  value={selectedVoice.value}
                  onChange={(e) => {
                    const matched = VOICE_OPTIONS.find(
                      (v) => v.value === e.target.value,
                    );
                    if (matched) setSelectedVoice(matched);
                  }}
                  disabled={loading || previewLoading}
                >
                  {VOICE_OPTIONS.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="bg-slate-900"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handlePlayPreview}
                  disabled={loading || previewLoading}
                  className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  {previewLoading ? "Loading..." : "Listen Sample"}
                </button>
              </div>
            </div>

            {/* Input Toggle Rendering */}
            {inputType === "text" ? (
              <div>
                <label className="block text-sm font-semibold text-cyan-300 mb-3">
                  Article / Blog Content
                </label>
                <textarea
                  rows={8}
                  className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  placeholder="Paste your article, blog, or notes here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={loading || previewLoading}
                />
              </div>
            ) : (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-cyan-300 mb-3">
                  <Link2 className="w-4 h-4" />
                  Web Article URL
                </label>
                <input
                  type="url"
                  className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="https://example.com/blog-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading || previewLoading}
                />
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm">
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateAudio}
              disabled={loading || previewLoading}
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]`}
            >
              {loading ? "Generating AI Narration..." : "Generate Audio"}
            </motion.button>
          </div>
        </motion.div>

        {/* Clean, Dynamic Audio Player Panel Display */}
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-2xl border border-cyan-400/20 rounded-[32px] p-8 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[120px] rounded-full" />

            <div className="relative z-10 space-y-6">
              {/* Top Row Header containing ONLY Download Button aligned right */}
              <div className="flex items-center justify-end gap-6 w-full">
                <a
                  href={audioUrl}
                  download={`NarrateAI-${Date.now()}.mp3`}
                  className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.45)] transition-all duration-300 text-sm"
                >
                  <Download className="w-5 h-5" />
                  Download Audio
                </a>
              </div>

              {/* Functional Audio Controller Interface Layout */}
              <div className="flex flex-col items-center justify-center gap-6 py-4 bg-black/20 border border-white/5 rounded-2xl p-6">
                {/* Dynamically Controlled Animated Equalizer Track */}
                <div className="flex items-end gap-1 h-12">
                  {[18, 30, 22, 40, 28, 34, 20, 44, 26, 38, 24, 32, 18].map(
                    (height, i) => (
                      <motion.div
                        key={i}
                        animate={
                          isPlaying
                            ? {
                                height: [
                                  height,
                                  height + 10,
                                  height - 6,
                                  height,
                                ],
                              }
                            : { height: 4 }
                        }
                        transition={
                          isPlaying
                            ? {
                                duration: 1.0,
                                repeat: Infinity,
                                delay: i * 0.05,
                                ease: "easeInOut",
                              }
                            : { duration: 0.1 }
                        }
                        className="w-2 rounded-full bg-gradient-to-t from-cyan-500 to-blue-400"
                        style={{ height: isPlaying ? height : 4 }}
                      />
                    ),
                  )}
                </div>

                {/* Interactive Scrubbing Custom Timeline Progress Bar Container */}
                <div className="w-full max-w-xl flex items-center gap-4">
                  <span className="text-xs font-mono text-slate-400 w-12 text-left">
                    {formatTime(currentTime)}
                  </span>

                  <div className="relative flex-1 flex items-center">
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full pointer-events-none z-10"
                      style={{ width: `${progressPercent}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      step="0.01"
                      value={currentTime}
                      onChange={handleScrubChange}
                      className="w-full h-1.5 appearance-none bg-white/10 rounded-full outline-none cursor-pointer relative z-20 accent-cyan-400"
                    />
                  </div>

                  <span className="text-xs font-mono text-slate-400 w-12 text-right">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Controls: ONLY Play/Pause Trigger Remaining */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={handleCustomPlay}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_35px_rgba(59,130,246,0.45)] hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white fill-white" />
                    ) : (
                      <PlayCircle className="w-6 h-6 text-white fill-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Invisible HTML5 Core media node hosting standard stream events */}
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
              />
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
