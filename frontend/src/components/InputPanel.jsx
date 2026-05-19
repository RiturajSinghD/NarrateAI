import React from "react";
import { Mic, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { VOICE_OPTIONS } from "../constants/voices";

export default function InputPanel({
  inputType,
  setInputType,
  text,
  setText,
  url,
  setUrl,
  selectedVoice,
  setSelectedVoice,
  loading,
  previewLoading,
  error,
  setError,
  handlePlayPreview,
  handleGenerateAudio,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="lg:col-span-7 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Format Input Switch Tabs */}
      <div className="flex p-2 gap-2 bg-black/20 border-b border-white/5">
        <button
          onClick={() => {
            setInputType("text");
            setError("");
          }}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            inputType === "text"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
              : "bg-white/0 text-slate-400 hover:bg-white/5"
          }`}
        >
          Paste Raw Text
        </button>
        <button
          onClick={() => {
            setInputType("url");
            setError("");
          }}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            inputType === "url"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
              : "bg-white/0 text-slate-400 hover:bg-white/5"
          }`}
        >
          Provide Article Link
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Voice Avatar Form Node */}
        <div>
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
            <Mic className="w-3.5 h-3.5" />
            Select Voice Persona
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-lg cursor-pointer"
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
              className="px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shrink-0"
            >
              {previewLoading ? "Loading..." : "Listen Sample"}
            </button>
          </div>
        </div>

        {/* Text / Link Input Box Toggles */}
        {inputType === "text" ? (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Article / Blog Content
            </label>
            <textarea
              rows={7}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-500 resize-none h-[220px]"
              placeholder="Paste your article content, notes, or essays here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading || previewLoading}
            />
          </div>
        ) : (
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              <Link2 className="w-3.5 h-3.5" />
              Web Article URL Link
            </label>
            <input
              type="url"
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-500 h-[52px]"
              placeholder="https://blogs.microsoft.com/ai-news-update"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading || previewLoading}
            />
            <div className="mt-2 text-[11px] text-slate-500">
              Our backend crawler dynamically parses out peripheral ads, menus,
              and script bloat automatically.
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs">
            {error}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleGenerateAudio}
          disabled={loading || previewLoading}
          className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:shadow-[0_0_30px_rgba(69,10,246,0.3)] shadow-md text-white"
        >
          {loading ? "Generating AI Narration File..." : "Generate Audio Track"}
        </motion.button>
      </div>
    </motion.div>
  );
}
