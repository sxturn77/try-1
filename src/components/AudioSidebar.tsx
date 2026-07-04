import React from "react";
import { X, Volume2, VolumeX, Music, Sliders, Play, Square } from "lucide-react";

interface AudioSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeAmbientId: string | null;
  setActiveAmbientId: (id: string | null) => void;
  ambientVolume: number;
  setAmbientVolume: (vol: number) => void;
  ambientTone: number;
  setAmbientTone: (tone: number) => void;
}

const STUDY_SOUNDS = [
  { id: "rain", name: "Forest Rain", desc: "Soothing rainfall and damp woodland breeze" },
  { id: "ocean", name: "Ocean Waves", desc: "Rhythmic seaside tides for cognitive pacing" },
  { id: "river", name: "Babbling River", desc: "Freshwater stream for natural acoustic comfort" },
  { id: "white_noise", name: "White Noise", desc: "Bright, consistent static to mask sharp room noises" },
  { id: "brown_noise", name: "Brown Noise", desc: "Deep, static rumble to isolate distractions" },
  { id: "binaural", name: "Focus Binaural", desc: "4Hz delta beats to encourage deep focus states" },
];

export default function AudioSidebar({
  isOpen,
  onClose,
  activeAmbientId,
  setActiveAmbientId,
  ambientVolume,
  setAmbientVolume,
  ambientTone,
  setAmbientTone,
}: AudioSidebarProps) {
  if (!isOpen) return null;

  const currentVolumePercent = Math.round(ambientVolume * 100);
  const toneLabel = ambientTone < 0.3 ? "Warm & Deep" : ambientTone < 0.7 ? "Balanced & Natural" : "Bright & Crisp";

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-all cursor-pointer"
        onClick={onClose}
        id="audio-overlay"
      />

      {/* Elegant, Simple Slide-out Sidebar */}
      <div 
        className="fixed right-0 top-0 h-screen w-full max-w-sm bg-[var(--theme-card)] border-l border-[var(--theme-border)]/45 shadow-xl z-50 flex flex-col font-sans animate-slideIn"
        id="audio-modal"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--theme-border)]/15 flex items-center justify-between bg-[var(--theme-beige)]/10">
          <div>
            <h3 className="text-sm font-semibold text-[var(--theme-text-dark)] flex items-center gap-1.5">
              <Music size={16} className="text-[var(--theme-accent)]" />
              <span>Study Ambient Audio</span>
            </h3>
            <p className="text-xs text-[var(--theme-text-main)] opacity-75 mt-1">Configure acoustic environments & volume</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] p-1.5 rounded-full hover:bg-[var(--theme-beige)]/40 transition cursor-pointer border-none bg-transparent"
            id="close-audio-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-6 overflow-y-auto">
          
          {/* Active Status Banner */}
          <div className="bg-[var(--theme-beige)]/20 border border-[var(--theme-border)]/45 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--theme-text-main)] opacity-75">Current Atmosphere</span>
              <span className="text-xs font-semibold text-[var(--theme-text-dark)] block truncate mt-0.5">
                {activeAmbientId 
                  ? STUDY_SOUNDS.find(s => s.id === activeAmbientId)?.name 
                  : "Silent Runway (Audio Off)"}
              </span>
            </div>
            {activeAmbientId ? (
              <button
                onClick={() => setActiveAmbientId(null)}
                className="text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/15 px-2.5 py-1.5 rounded-lg border-none cursor-pointer flex items-center gap-1 shrink-0 transition"
                title="Stop ambient audio"
              >
                <Square size={10} fill="currentColor" />
                <span>Stop</span>
              </button>
            ) : (
              <span className="text-[10px] text-[var(--theme-text-main)] font-mono opacity-50 shrink-0">SILENT</span>
            )}
          </div>

          {/* Simple Clean Volume Slider */}
          <div className="space-y-3 bg-[var(--theme-beige)]/15 border border-[var(--theme-border)]/20 p-4 rounded-xl">
            <div className="flex justify-between items-center text-[11px] font-semibold text-[var(--theme-text-dark)] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Volume2 size={13} className="text-[var(--theme-accent)]" />
                <span>Audio Volume</span>
              </span>
              <span className="font-mono text-xs">{currentVolumePercent}%</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setAmbientVolume(ambientVolume === 0 ? 0.25 : 0)}
                className={`p-1.5 rounded-lg border cursor-pointer shrink-0 transition ${
                  ambientVolume === 0 
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/15" 
                    : "bg-[var(--theme-beige)] border-[var(--theme-border)] text-[var(--theme-text-dark)] hover:bg-[var(--theme-beige-dark)]"
                }`}
                title={ambientVolume === 0 ? "Unmute" : "Mute"}
              >
                {ambientVolume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-[var(--theme-beige-dark)] rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)] transition-all"
              />
            </div>
            
            <div className="flex justify-between text-[9px] text-[var(--theme-text-main)] font-mono opacity-50">
              <span>Muted</span>
              <span>Half</span>
              <span>Full Blast</span>
            </div>
          </div>

          {/* Simple Clean Tone / Acoustic Texture Slider */}
          <div className="space-y-3 bg-[var(--theme-beige)]/15 border border-[var(--theme-border)]/20 p-4 rounded-xl">
            <div className="flex justify-between items-center text-[11px] font-semibold text-[var(--theme-text-dark)] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sliders size={13} className="text-[var(--theme-accent)]" />
                <span>Acoustic Profile</span>
              </span>
              <span className="font-mono text-[10px] text-[var(--theme-accent)]">{toneLabel}</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={ambientTone}
                onChange={(e) => setAmbientTone(parseFloat(e.target.value))}
                className="w-full h-1 bg-[var(--theme-beige-dark)] rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)] transition-all"
              />
            </div>
            
            <div className="flex justify-between text-[9px] text-[var(--theme-text-main)] font-mono opacity-50">
              <span>◄ Deep & Cozy</span>
              <span>Balanced</span>
              <span>Bright & Crisp ►</span>
            </div>
          </div>

          {/* Sound Library List */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-wider text-[var(--theme-text-main)] uppercase">Acoustic Environments</h4>
            <div className="space-y-2">
              {STUDY_SOUNDS.map((sound) => {
                const isSelected = activeAmbientId === sound.id;
                return (
                  <button
                    key={sound.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setActiveAmbientId(null);
                      } else {
                        setActiveAmbientId(sound.id);
                        if (ambientVolume === 0) setAmbientVolume(0.25); // Auto unmute
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[var(--theme-accent-light)] border-[var(--theme-accent)]/30 shadow-xs translate-x-[2px]"
                        : "bg-[var(--theme-card)] hover:bg-[var(--theme-beige)]/40 border-[var(--theme-border)]/70 hover:border-[var(--theme-border)]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className={`text-xs font-semibold block ${isSelected ? "text-[var(--theme-accent)]" : "text-[var(--theme-text-dark)]"}`}>
                        {sound.name}
                      </span>
                      <span className="text-[10px] text-[var(--theme-text-main)] opacity-75 mt-0.5 block truncate">
                        {sound.desc}
                      </span>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition ${
                      isSelected ? "bg-[var(--theme-accent)] text-[var(--theme-bg)]" : "bg-[var(--theme-beige)] text-[var(--theme-text-main)]"
                    }`}>
                      {isSelected ? <Volume2 size={12} className="animate-pulse" /> : <Play size={10} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--theme-border)]/15 bg-[var(--theme-beige)]/10 text-center text-[10px] text-[var(--theme-text-main)] font-mono opacity-60">
          <span>Enhances mental flow & focus consistency</span>
        </div>
      </div>
    </>
  );
}
