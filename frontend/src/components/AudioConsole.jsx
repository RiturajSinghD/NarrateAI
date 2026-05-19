import React from "react";
import { Download, PlayCircle, Pause, AudioLines } from "lucide-react";
import { motion } from "framer-motion";

export default function AudioConsole({
  audioUrl,
  isPlaying,
  currentTime,
  duration,
  progressPercent,
  selectedVoice,
  formatTime,
  handleScrubChange,
  handleCustomPlay,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`lg:col-span-5 h-full min-h-[465px] bg-white/5 backdrop-blur-2xl border rounded-[24px] shadow-2xl p-6 flex flex-col justify-between transition-all duration-500 ${
        audioUrl
          ? "border-cyan-400/30 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"
          : "border-white/10"
      }`}
    >
      {!audioUrl ? (
        /* EMPTY DEFAULT SLEEP STATE DISPLAY PANEL */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto h-full min-h-[415px]">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4 animate-pulse">
            <AudioLines className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-300">
            Audio Console Idle
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
            Provide your target text copy or article links on the left panel,
            then hit generate to initialize the waveform console layer.
          </p>
        </div>
      ) : (
        /* ACTIVE STREAM PLAYER CONSOLE LAYER */
        <div className="space-y-6 flex flex-col justify-between h-full min-h-[415px]">
          {/* Header Action Row */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-2.5 py-1 rounded-md font-semibold font-mono tracking-tight">
                MP3 SOURCE READY
              </span>
            </div>
            <a
              href={audioUrl}
              download={`NarrateAI-${Date.now()}.mp3`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs hover:scale-[1.02] transition-all duration-300 shadow-md"
            >
              <Download className="w-4 h-4" />
              Download File
            </a>
          </div>

          {/* Animated Audio Equalizer Visualizer Block */}
          <div className="flex flex-col items-center justify-center py-6 bg-black/30 border border-white/5 rounded-2xl p-6 my-auto">
            <div className="flex items-end gap-1 h-14 mb-8">
              {[16, 28, 20, 38, 26, 32, 18, 42, 24, 36, 22, 30, 16].map(
                (height, i) => (
                  <motion.div
                    key={i}
                    animate={
                      isPlaying
                        ? { height: [height, height + 12, height - 6, height] }
                        : { height: 4 }
                    }
                    transition={
                      isPlaying
                        ? {
                            duration: 0.9,
                            repeat: Infinity,
                            delay: i * 0.04,
                            ease: "easeInOut",
                          }
                        : { duration: 0.1 }
                    }
                    className="w-2 rounded-full bg-gradient-to-t from-cyan-400 via-blue-400 to-purple-400"
                    style={{ height: isPlaying ? height : 4 }}
                  />
                ),
              )}
            </div>

            {/* Scrubbing Custom Slider Control Matrix */}
            <div className="w-full flex items-center gap-3 mb-6">
              <span className="text-[11px] font-mono text-slate-400 w-10 text-left">
                {formatTime(currentTime)}
              </span>

              <div className="relative flex-1 flex items-center">
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full pointer-events-none z-10"
                  style={{ width: `${progressPercent}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.01"
                  value={currentTime}
                  onChange={handleScrubChange}
                  className="w-full h-1 appearance-none bg-white/10 rounded-full outline-none cursor-pointer relative z-20 accent-cyan-400"
                />
              </div>

              <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
                {formatTime(duration)}
              </span>
            </div>

            {/* Core Circular Play/Pause Hub */}
            <button
              onClick={handleCustomPlay}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-300 group"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white group-hover:scale-95 transition-transform" />
              ) : (
                <PlayCircle className="w-5 h-5 text-white fill-white group-hover:scale-105 transition-transform" />
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
