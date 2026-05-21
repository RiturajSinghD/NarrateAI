import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Keyboard } from "lucide-react";
import InputPanel from "../components/InputPanel";
import AudioConsole from "../components/AudioConsole";
import { VOICE_OPTIONS } from "../constants/voices";

const BACKEND_BASE = "http://localhost:5000";

export default function TextToAudio() {
  const navigate = useNavigate();

  // Unified component states for text synthesis processing loop
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(
    VOICE_OPTIONS ? VOICE_OPTIONS[0] : null,
  );
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  //Handle Voice Sample Playback Trigger
  const handlePlayPreview = async () => {
    if (!selectedVoice) return;
    setPreviewLoading(true);
    setError("");
    try {
      const response = await fetch(`${BACKEND_BASE}/api/preview-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice: selectedVoice.value,
          sampleText:
            selectedVoice.sampleText || "This is a sample voice preview.",
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch voice sample preview.");

      // Bind audio playback dynamically via browser Audio context
      const previewAudio = new Audio(data.audioUrl);
      await previewAudio.play();
    } catch (err) {
      setError(`Preview Error: ${err.message}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle Master Text-to-Speech Generation Pipeline
  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      setError("Please enter some text before generating audio.");
      return;
    }

    setLoading(true);
    setError("");
    setAudioUrl("");

    try {
      const response = await fetch(`${BACKEND_BASE}/api/generate-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          type: "text",
          text: text,
          voice: selectedVoice?.value,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Speech generation failed.");

      setAudioUrl(data.audioUrl);
    } catch (err) {
      setError(
        err.message ||
          "Could not establish connection to backend synthesis engine.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Back navigation spokeway route link to dashboard grid hub */}
      <button
        onClick={() => navigate("/home")}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-transparent border-none outline-none cursor-pointer transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Dashboard Hub
      </button>

      {/* Header section defining active spokeway node */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 hidden sm:flex">
          <Keyboard className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white dark:text-white">
            Text to Audio
          </h2>
        </div>
      </div>

      {/* Master Grid containing input control modules and output playback console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <InputPanel
          inputType="text"
          text={text}
          setText={setText}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          loading={loading}
          previewLoading={previewLoading}
          error={error}
          setError={setError}
          setAudioUrl={setAudioUrl}
          handlePlayPreview={handlePlayPreview}
          handleGenerateAudio={handleGenerateAudio}
        />

        {/* Console output displaying play variables, download triggers, and save selectors */}
        <AudioConsole
          audioUrl={audioUrl}
          selectedVoice={selectedVoice}
          inputType="text"
          sourceContent={text}
        />
      </div>
    </div>
  );
}
