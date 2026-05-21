import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Download,
  CloudLightning,
  RefreshCw,
  Volume2,
  CheckCircle2,
  X,
} from "lucide-react";

const formatTime = (secs) => {
  if (isNaN(secs)) return "0:00";
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default function AudioConsole({
  audioUrl,
  selectedVoice,
  inputType,
  sourceContent,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [saveLoading, setSaveLoading] = useState(false);

  // Custom Modal & Notification States
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
    }
  }, [audioUrl]);

  // Trigger floating UI toast notifications elegantly
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const togglePlay = () => {
    if (!audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  // 🔥 IMAGE 3 FIXED: Forces direct native browser file stream download bypassing Express proxy route errors
  const handleForceDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = customName.trim()
        ? `${customName.trim()}.mp3`
        : `narrate-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      triggerToast("⚠️ Download compilation pipeline dropped.");
    }
  };

  // 🔥 IMAGE 1 & 2 FIXED: Custom Modal pipeline replaces old system alert prompts
  const handleSaveToVault = async () => {
    if (!audioUrl) return;
    setSaveLoading(true);
    setShowSaveModal(false);
    try {
      const response = await fetch("http://localhost:5000/api/vault/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          audioUrl,
          inputType,
          voice: selectedVoice?.value || "Default Voice",
          contentPreview: sourceContent?.substring(0, 100),
          customName: customName.trim() || "New Voice Track File",
        }),
      });
      if (!response.ok) throw new Error("Vault error.");

      // ✅ SUCCESS TOAST DISPLAY: Exactly as requested!
      triggerToast("✅ Track saved to vault successfully!");
    } catch (err) {
      triggerToast("❌ Failed to commit save records.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="lg:col-span-5 rounded-[24px] border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl flex flex-col justify-between min-h-[360px] text-white relative select-none">
      {/* 🌟 FLOATING SUCCESS TOAST COMPONENT */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 shadow-2xl z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* 🌟 EMBEDDED NAME CONFIGURATION MODAL DIALOG */}
      {showSaveModal && (
        <div className="absolute inset-0 rounded-[24px] bg-slate-950/90 backdrop-blur-md z-50 flex flex-col justify-center p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400">
              Configure Vault Meta Label
            </h4>
            <button
              onClick={() => setShowSaveModal(false)}
              className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Enter file name layout..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={handleSaveToVault}
            className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer"
          >
            Confirm Safe Commit
          </button>
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-purple-400">
          Playback Console
        </h3>

        {!audioUrl ? (
          <div className="flex flex-col items-center justify-center pt-16 text-slate-500 text-center space-y-3">
            <div className="p-4 rounded-full bg-slate-950/40 border border-white/5 animate-pulse">
              <Volume2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold max-w-[200px]">
              Audio Console Idle.
            </p>
          </div>
        ) : (
          <div className="space-y-8 mt-12 pt-4">
            <div className="space-y-2">
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 transition-all shadow-xl cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {audioUrl && (
        <div className="grid grid-cols-2 gap-3 mt-8">
          <button
            onClick={handleForceDownload}
            className="p-3.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-center flex items-center justify-center gap-2 hover:bg-white/10 text-white transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={saveLoading}
            className="p-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold flex items-center justify-center gap-2 text-white hover:shadow-xl transition-all disabled:opacity-40 cursor-pointer"
          >
            {saveLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CloudLightning className="w-4 h-4" />
            )}
            {saveLoading ? "Saving..." : "Cloud Save"}
          </button>
        </div>
      )}
    </div>
  );
}
