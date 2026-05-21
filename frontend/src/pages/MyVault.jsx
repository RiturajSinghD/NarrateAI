import React, { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Edit3,
  Play,
  Pause,
  Download,
  FolderHeart,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";

export default function MyVault() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Audio Playback Synchronization Tracking
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  // Dialog configuration management caches
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [newNameInput, setNewNameInput] = useState("");

  const fetchVaultTracks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/vault/tracks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (response.ok) setTracks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultTracks();

    // Clean up audio thread instance on component unmount
    return () => {
      audioRef.current.pause();
    };
  }, []);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Row-Level Playback Engine Toggling
  const handleTogglePlay = (track) => {
    if (activeTrackId === track._id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      // Swapping track indices: pause old, load fresh binary track address path
      audioRef.current.pause();
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setActiveTrackId(track._id);
          setIsPlaying(true);
        })
        .catch(() =>
          triggerToast("Cannot initiate sound file streaming channel."),
        );

      // Handle automatic resetting when the audio track reaches its end
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setActiveTrackId(null);
      };
    }
  };

  // Secure Cross-Origin Asset Stream Blob Fetcher Downloader
  const handleDownloadTrack = async (track) => {
    try {
      const response = await fetch(track.audioUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${track.contentPreview.replace(/[^a-zA-Z0-9]/g, "_") || "vault-track"}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      triggerToast("Download compilation pipeline dropped.");
    }
  };

  const executeDeleteTrack = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/vault/tracks/${deleteTargetId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (response.ok) {
        if (activeTrackId === deleteTargetId) {
          audioRef.current.pause();
          setIsPlaying(false);
          setActiveTrackId(null);
        }
        setTracks(tracks.filter((t) => t._id !== deleteTargetId));
        triggerToast("Narration track discarded cleanly.");
      }
    } catch (err) {
      triggerToast("Operational database access failure.");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const executeRenameTrack = async () => {
    if (!renameTarget || !newNameInput.trim()) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/vault/tracks/${renameTarget._id}/rename`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ customName: newNameInput.trim() }),
        },
      );
      if (response.ok) {
        setTracks(
          tracks.map((t) =>
            t._id === renameTarget._id
              ? { ...t, contentPreview: newNameInput.trim() }
              : t,
          ),
        );
        triggerToast("File label modified successfully.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRenameTarget(null);
      setNewNameInput("");
    }
  };

  return (
    <div className="space-y-6 py-2 relative text-white">
      {toast && (
        <div className="fixed top-6 right-6 px-4 py-3 rounded-xl bg-slate-950 border border-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center gap-2 shadow-2xl z-50">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          {toast}
        </div>
      )}

      {/* DELETE MODAL OVERLAY */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 text-center space-y-4">
            <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="text-sm font-bold">Discard Narration Asset?</h3>
            <p className="text-xs text-slate-400">
              This action will erase the track from your vault storage
              repository permanently.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="w-full py-2.5 rounded-xl bg-white/5 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteTrack}
                className="w-full py-2.5 rounded-xl bg-red-500 font-bold text-xs text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL OVERLAY */}
      {renameTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-4">
            <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider">
              Modify File Name Profile
            </h3>
            <input
              type="text"
              value={newNameInput}
              onChange={(e) => setNewNameInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRenameTarget(null)}
                className="w-full py-2.5 rounded-xl bg-white/5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={executeRenameTrack}
                className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs"
              >
                Save Update
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <FolderHeart className="text-purple-400 w-6 h-6" /> Your Audio Vault
        </h2>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500 font-medium">
          Reading vault index registers...
        </p>
      ) : tracks.length === 0 ? (
        <p className="text-xs text-slate-500 py-12 text-center border border-dashed border-white/5 rounded-2xl">
          Your storage vault is empty.
        </p>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => (
            <div
              key={track._id}
              className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-4 text-left">
                {/* ADDED: Inline Play/Pause Trigger Control */}
                <button
                  onClick={() => handleTogglePlay(track)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                    activeTrackId === track._id && isPlaying
                      ? "bg-cyan-500 border-cyan-400 text-slate-950"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  {activeTrackId === track._id && isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  )}
                </button>

                <div>
                  <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-purple-500/20 text-purple-400">
                    {track.inputType}
                  </span>
                  <h4 className="text-xs font-bold text-white mt-1.5">
                    {track.contentPreview}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    {track.voice}
                  </p>
                </div>
              </div>

              {/* Action Buttons Hub Group Wrapper */}
              <div className="flex items-center gap-1">
                {/* ADDED: Secure Inline Download Track Trigger Button */}
                <button
                  onClick={() => handleDownloadTrack(track)}
                  className="p-2 rounded-lg bg-white/0 hover:bg-white/5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                  title="Download File Assets"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setRenameTarget(track);
                    setNewNameInput(track.contentPreview);
                  }}
                  className="p-2 rounded-lg bg-white/0 hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Rename Title"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTargetId(track._id)}
                  className="p-2 rounded-lg bg-white/0 hover:bg-white/5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete Asset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
