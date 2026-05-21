import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FolderKanban } from "lucide-react";
import InputPanel from "../components/InputPanel";
import AudioConsole from "../components/AudioConsole";
import { VOICE_OPTIONS } from "../constants/voices";

const BACKEND_BASE = "http://localhost:5000";

export default function DocToAudio() {
  const navigate = useNavigate();

  // Core component execution states
  const [file, setFile] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(
    VOICE_OPTIONS ? VOICE_OPTIONS[0] : null,
  );
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  // 🎙️ Handle Voice Sample Playback Trigger
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
            "This is a sample document narration voice profile preview.",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Preview failed.");

      const previewAudio = new Audio(data.audioUrl);
      await previewAudio.play();
    } catch (err) {
      setError(`Preview Error: ${err.message}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  // 🚀 Handle Multipart Document Upload + Audio Synthesis Processing Pipeline
  const handleGenerateAudio = async () => {
    if (!file) {
      setError("Please select or drop a valid document file first.");
      return;
    }

    setLoading(true);
    setError("");
    setAudioUrl("");

    // Utilizing FormData to securely stream binary objects across to Express
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "doc");
    formData.append("voice", selectedVoice?.value || "en-US-AvaNeural");

    try {
      const response = await fetch(`${BACKEND_BASE}/api/generate-audio`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // Note: Avoid setting 'Content-Type' manually when passing FormData;
          // the browser needs to auto-inject the boundary delimiter.
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Document synthesis pipeline failed.");

      setAudioUrl(data.audioUrl);
    } catch (err) {
      setError(err.message || "Failed to parse document knowledge records.");
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
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 hidden sm:flex">
          <FolderKanban className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Docs to Audio
          </h2>
        </div>
      </div>

      {/* Master Processing Grid Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <InputPanel
          inputType="doc"
          file={file}
          setFile={setFile}
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
          selectedVoice={selectedVoice}
          inputType="doc"
          sourceContent={
            file ? `Document Source File Reference: ${file.name}` : ""
          }
        />
      </div>
    </div>
  );
}
