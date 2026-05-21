import React, { useState, useRef, useEffect } from "react";
import { Link2, Sparkles, ChevronDown, UploadCloud } from "lucide-react";
import { VOICE_OPTIONS } from "../constants/voices";

export default function InputPanel({
  inputType,
  setInputType,
  text,
  setText,
  url,
  setUrl,
  file,
  setFile,
  selectedVoice,
  setSelectedVoice,
  loading,
  previewLoading,
  error,
  setError,
  handlePlayPreview,
  handleGenerateAudio,
}) {
  const voicesList = VOICE_OPTIONS || [];

  // Custom Dropdown Menu Open/Close States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Auto-close menu when clicking outside of the card component container
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="lg:col-span-7 rounded-[24px] border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6 select-none">
      {/* Dynamic Tab Switcher logic */}
      {inputType !== "text" && inputType !== "url" && inputType !== "doc" && (
        <div className="flex rounded-xl bg-slate-950/60 p-1 border border-white/5">
          <button
            onClick={() => setInputType("text")}
            className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${inputType === "text" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-slate-400"}`}
          >
            Paste Raw Text
          </button>
          <button
            onClick={() => setInputType("url")}
            className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${inputType === "url" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-slate-400"}`}
          >
            Provide Article Link
          </button>
        </div>
      )}

      {/* VOICE SELECTOR PANEL */}
      <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-wider text-cyan-400 pl-1">
          Select Voice Persona
        </label>

        <div className="flex gap-3 relative" ref={dropdownRef}>
          {/* Active Option Button Trigger */}
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all flex items-center justify-between font-bold cursor-pointer text-left shadow-inner"
            >
              <span className="text-white font-bold">
                {selectedVoice
                  ? selectedVoice.name ||
                    selectedVoice.label ||
                    "Selected Persona"
                  : "Select a voice..."}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Custom Options Menu Drawer Panel */}
            {isDropdownOpen && (
              <ul
                className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl border border-white/20 bg-[#090d16] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 divide-y divide-white/5 custom-scrollbar"
                style={{ zIndex: 9999 }}
              >
                {voicesList.map((voice) => (
                  <li
                    key={voice.value}
                    onClick={() => {
                      setSelectedVoice(voice);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-3 rounded-lg text-xs font-black cursor-pointer transition-all text-left mb-0.5 last:mb-0 block w-full ${
                      selectedVoice?.value === voice.value
                        ? "bg-cyan-500 text-slate-950 shadow-md font-extrabold"
                        : "text-white bg-transparent hover:bg-white/10 hover:text-cyan-400"
                    }`}
                  >
                    {voice.name || voice.label || voice.value}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handlePlayPreview}
            disabled={previewLoading || loading}
            className="px-5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white transition-all shrink-0 disabled:opacity-40 cursor-pointer"
          >
            {previewLoading ? "Playing..." : "Listen Sample"}
          </button>
        </div>
      </div>

      {/* Context Area Input Container */}
      <div className="space-y-2">
        {/*FIXED: Dynamic Label mapping based on active route context */}
        <label className="block text-[10px] font-black uppercase tracking-wider text-cyan-400 pl-1">
          {inputType === "text" && "Article / Blog Content"}
          {inputType === "url" && "Target Reference Address"}
          {inputType === "doc" && "Knowledge Store Document Target"}
        </label>

        {/* Workflow Segment 1: Raw Text Input Area */}
        {inputType === "text" && (
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError("");
            }}
            placeholder="Paste your article content, notes, or scripts here..."
            className="w-full h-44 p-4 rounded-xl bg-slate-950/30 border border-white/10 text-xs text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none leading-relaxed"
          />
        )}

        {/* Workflow Segment 2: Scrape URL Web Address Input */}
        {inputType === "url" && (
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              placeholder="https://example.com/article-path-slug"
              className="w-full p-4 pl-12 rounded-xl bg-slate-950/30 border border-white/10 text-xs text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>
        )}

        {/* WORKFLOW SEGMENT 3: Enhanced File Upload Drag & Drop Interface */}
        {inputType === "doc" && (
          <div className="w-full">
            <label className="flex flex-col items-center justify-center w-full h-44 rounded-xl border-2 border-dashed border-white/10 bg-slate-950/20 hover:bg-slate-950/40 hover:border-emerald-500/30 transition-all cursor-pointer group relative overflow-hidden">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 mb-3 group-hover:scale-110 group-hover:border-emerald-500/20 transition-all text-slate-400 group-hover:text-emerald-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <p className="text-xs text-emerald-400 font-bold max-w-[280px] truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Ready
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-300">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      PDF, TXT, DOCX, or MD files down to 10MB
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.txt,.docx,.md"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                    if (error) setError("");
                  }
                }}
              />
            </label>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 pl-1 font-semibold">{error}</p>
      )}

      <button
        onClick={handleGenerateAudio}
        disabled={loading || previewLoading}
        className="w-full py-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:shadow-lg hover:shadow-cyan-500/10 text-white transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          "Synthesizing Master Sound Track..."
        ) : (
          <>
            <Sparkles className="w-4 h-4" /> Generate Audio Track
          </>
        )}
      </button>
    </div>
  );
}
