import React, { useState, useEffect } from "react";
import { UserProfile, Subject, ModuleProgress, ActivityLog, ModuleStatus } from "../types";
import { FLAT_MODULES } from "../curriculum";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  X, 
  GraduationCap, 
  Maximize2,
  Volume2,
  VolumeX,
  Music,
  Award,
  Sparkles,
  Sliders
} from "lucide-react";
import GrowthTree from "./GrowthTree";
import FullscreenTimer from "./FullscreenTimer";

const DASHBOARD_QUOTES = [
  "Deep focus is the ultimate competitive advantage.",
  "The pain of study is temporary, but the pride of passing CFA Level I is forever.",
  "Consistency beats intensity. 2 hours daily beats a 14-hour weekend cram.",
  "Focus is a muscle, and today you are building it. No distractions, just progress.",
  "Amateurs wait for inspiration. Professionals get to work. Start ur Prep!",
  "Your future self is thanking you for what you're doing right now.",
  "The CFA exam is not a test of intelligence; it is a test of character and discipline.",
  "Success is the sum of small efforts, repeated day in and day out."
];

const STUDY_SOUNDS = [
  { id: "rain", name: "Rain", path: "/audio/rain.mp3" },
  { id: "ocean", name: "Ocean", path: "/audio/Ocean .mp3" },
  { id: "river", name: "River", path: "/audio/River.mp3" },
  { id: "white_noise", name: "White Noise", path: "/audio/White Noise.mp3" },
  { id: "brown_noise", name: "Brown Noise", path: "/audio/Brown Noise .mp3" },
  { id: "binaural", name: "Binaural", path: "synth" },
];

interface DashboardProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  subjects: Subject[];
  progress: Record<string, ModuleProgress>;
  activityLogs: ActivityLog[];
  onLogStudySession: (moduleId: string, durationMinutes: number, type: "study" | "quiz", score?: number) => void;
  // Timer props
  timerSeconds: number;
  setTimerSeconds: React.Dispatch<React.SetStateAction<number>>;
  isTimerRunning: boolean;
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreenTimerOpen: boolean;
  setIsFullscreenTimerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  timerModuleId: string;
  setTimerModuleId: React.Dispatch<React.SetStateAction<string>>;
  // Ambient Sound Props
  activeAmbientId: string | null;
  setActiveAmbientId: React.Dispatch<React.SetStateAction<string | null>>;
  ambientVolume: number;
  setAmbientVolume: React.Dispatch<React.SetStateAction<number>>;
  ambientTone: number;
  setAmbientTone: React.Dispatch<React.SetStateAction<number>>;
  isAudioSidebarOpen?: boolean;
  setIsAudioSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Dashboard({
  userProfile,
  setUserProfile,
  subjects,
  progress,
  activityLogs,
  onLogStudySession,
  timerSeconds,
  setTimerSeconds,
  isTimerRunning,
  setIsTimerRunning,
  isFullscreenTimerOpen,
  setIsFullscreenTimerOpen,
  timerModuleId,
  setTimerModuleId,
  activeAmbientId,
  setActiveAmbientId,
  ambientVolume,
  setAmbientVolume,
  ambientTone,
  setAmbientTone,
  isAudioSidebarOpen,
  setIsAudioSidebarOpen
}: DashboardProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);

  // Rotate dashboard motivation quote
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuoteIdx((prev) => (prev + 1) % DASHBOARD_QUOTES.length);
    }, 25000); // 25s rotation
    return () => clearInterval(interval);
  }, []);

  // 1. Countdown calculations
  const calculateDaysRemaining = () => {
    const today = new Date();
    const examDate = new Date(userProfile.targetExamDate);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateDaysTotal = () => {
    const start = new Date(userProfile.studyStartDate);
    const end = new Date(userProfile.targetExamDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const daysRemaining = calculateDaysRemaining();
  const totalDays = calculateDaysTotal();
  const elapsedDays = Math.max(0, totalDays - daysRemaining);
  const timeProgressPct = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  // 2. Studies Statistics
  const totalStudyMinutes = activityLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const totalStudyHrs = (totalStudyMinutes / 60).toFixed(2);

  // Daily calculations
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const dailyMinutes = activityLogs
    .filter(log => new Date(log.timestamp) >= todayStart)
    .reduce((sum, log) => sum + log.durationMinutes, 0);
  const dailyHrs = (dailyMinutes / 60).toFixed(2);
  const dailyHrsNum = parseFloat(dailyHrs);
  const dailyTargetVal = Math.max(0.5, userProfile.dailyTargetHours || 2);
  const dailyProgressPct = Math.min(
    100,
    (dailyHrsNum / dailyTargetVal) * 100
  );

  // Module completion stats
  const totalModules = 93;
  const completedModules = FLAT_MODULES.filter(
    (m) => progress[m.id]?.status === ModuleStatus.COMPLETED
  ).length;
  const inProgressModules = FLAT_MODULES.filter(
    (m) => progress[m.id]?.status === ModuleStatus.IN_PROGRESS
  ).length;
  const curriculumPercentage = Math.round((completedModules / totalModules) * 100);

  // Subject-level analysis
  const subjectScores = subjects.map(subj => {
    const mods = subj.modules;
    const completed = mods.filter(m => progress[m.id]?.status === ModuleStatus.COMPLETED);
    const scores = completed
      .map(m => progress[m.id]?.quizScore)
      .filter((s): s is number => s !== null);
    
    return {
      id: subj.id,
      name: subj.name,
      completed: completed.length,
      total: mods.length,
      avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      color: subj.color
    };
  });

  const weakSubjects = subjectScores.filter(s => s.avgScore !== null && s.avgScore < 70);

  // 3. Studying Stopwatch Timer State
  const [selectedModuleId, setSelectedModuleId] = useState(FLAT_MODULES[0]?.id || "");
  const [manualMinutes, setManualMinutes] = useState("30");
  const [loggedScore, setLoggedScore] = useState("");
  const [sessionType, setSessionType] = useState<"study" | "quiz">("study");

  // Dynamically sync active stopwatch duration to Minutes state
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0 && timerModuleId === selectedModuleId) {
      const minsVal = Math.round(timerSeconds / 60) || 1;
      setManualMinutes(minsVal.toString());
    }
  }, [timerSeconds, isTimerRunning, timerModuleId, selectedModuleId]);

  const toggleTimer = () => {
    const nextRunning = !isTimerRunning;
    setIsTimerRunning(nextRunning);
    setTimerModuleId(selectedModuleId);
    if (nextRunning) {
      setIsFullscreenTimerOpen(true);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handleSaveUnifiedSession = () => {
    const duration = parseInt(manualMinutes, 10);
    if (!duration || duration <= 0) {
      alert("Please enter a valid study duration in minutes.");
      return;
    }
    const parsedScore = loggedScore ? parseInt(loggedScore, 10) : undefined;
    onLogStudySession(selectedModuleId, duration, sessionType, parsedScore);
    
    // Clear & reset inputs safely, preserving default minutes block
    setManualMinutes("30");
    setLoggedScore("");
    setIsFullscreenTimerOpen(false);
    resetTimer();
  };

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className="space-y-12">
        {/* Dashboard Top Title with Settings Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-6">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-[44px] lg:text-[48px] font-bold text-[var(--theme-text-dark)] tracking-tighter leading-none">
                Study Dashboard
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 bg-[var(--theme-card)] hover:bg-[var(--theme-beige)] border border-[var(--theme-border)] text-[var(--theme-text-dark)] text-xs font-semibold h-10 px-4 rounded-xl transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 cursor-pointer shadow-xs"
          >
            <Settings size={14} className="animate-spin-slow text-[var(--theme-accent)]" />
            <span>Plan Settings</span>
          </button>
        </div>

        {/* Asymmetrical Upper Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Hero element (Exam Countdown): No border, no fill, giant typography */}
          <div className="lg:col-span-2 p-0 flex flex-col justify-center min-h-[160px] relative">
            <p className="text-xs font-semibold text-[var(--theme-accent)] uppercase tracking-wider mb-2">Runway Remaining</p>
            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="text-[90px] lg:text-[110px] font-bold text-[var(--theme-text-dark)] leading-none tracking-tighter">
                {daysRemaining}
              </span>
              <span className="text-sm font-normal text-[var(--theme-text-main)] opacity-85">
                days left until your target exam
              </span>
            </div>
            <div className="mt-6 w-full max-w-xl">
              <div className="flex justify-between text-xs text-[var(--theme-text-main)] mb-2 opacity-80">
                <span>Runway completed ({elapsedDays} of {totalDays} days)</span>
                <span className="font-semibold">{Math.round(timeProgressPct)}%</span>
              </div>
              <div className="w-full bg-[var(--theme-beige)] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[var(--theme-accent)] h-full rounded-full transition-all duration-700" 
                  style={{ width: `${timeProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Compact Stats Side Strip: Separated by a hairline rule & custom border box */}
          <div className="bg-gradient-to-br from-[var(--theme-card)] to-[var(--theme-card)]/95 border border-[var(--theme-border)]/55 rounded-3xl p-7 flex flex-col gap-6 divide-y divide-[var(--theme-border)]/40 shadow-sm">
            {/* Total Study Time (Flat, separated by rule) */}
            <div className="flex items-center justify-between pt-0 pb-1">
              <div>
                <span className="text-xs text-[var(--theme-text-main)] block font-medium">Total Study Hours</span>
                <span className="text-3xl font-bold text-[var(--theme-text-dark)] mt-1 block leading-none">{totalStudyHrs}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 inline">Syllabus Runway</span>
                <span className="text-xs font-semibold text-[var(--theme-accent)] ml-1 inline">
                  {Math.floor(totalStudyMinutes / 60)}h {Math.round(totalStudyMinutes % 60)}m
                </span>
              </div>
            </div>

            {/* Today's Effort (Flat, separated by rule) */}
            <div className="flex items-center justify-between pt-4 pb-1">
              <div>
                <span className="text-xs text-[var(--theme-text-main)] block font-medium">Today's Study Time</span>
                <span className="text-3xl font-bold text-[var(--theme-text-dark)] mt-1 block leading-none">{dailyHrs}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Daily Target ({userProfile.dailyTargetHours}h)</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md mt-1 inline-block">
                  {Math.round(dailyProgressPct)}% Goal
                </span>
              </div>
            </div>

            {/* Syllabus Coverage (Custom ring, flat layout) */}
            <div className="flex items-center justify-between pt-4 pb-0">
              <div>
                <span className="text-xs text-[var(--theme-text-main)] block font-medium">Syllabus Coverage</span>
                <span className="text-3xl font-bold text-[var(--theme-text-dark)] mt-1 block leading-none">{curriculumPercentage}%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">{completedModules} / 93 modules complete</span>
              </div>
              <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    className="stroke-[var(--theme-beige)] fill-none"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    className="stroke-[var(--theme-accent)] fill-none transition-all duration-1000 ease-out"
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - curriculumPercentage / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[9px] font-mono font-medium text-[var(--theme-accent)]">
                  {curriculumPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Bento Grid: Study Logger and Interactive Growth Tree */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Unified Interactive Study Logger - Occupies 1 column */}
          <div 
            id="tour-study-tracker" 
            className="bg-gradient-to-b from-[var(--theme-card)] to-[var(--theme-card)]/95 border border-[var(--theme-border)]/50 rounded-3xl p-7 shadow-sm flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-bold text-[var(--theme-text-dark)] mb-6 tracking-tight">
                Study Session
              </h3>

              <div className="space-y-6">
                
                {/* Group 1: Module Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[var(--theme-text-main)] opacity-90">
                    Curriculum module
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full bg-[var(--theme-beige)]/40 text-[var(--theme-text-dark)] border border-[var(--theme-border)] rounded-xl h-10 px-3 text-sm outline-none focus:border-[var(--theme-accent)] transition font-sans cursor-pointer shadow-xs"
                  >
                    {subjects.map((subj) => (
                      <optgroup key={subj.id} label={`${subj.name} (${subj.weight})`} className="bg-[var(--theme-card)] text-[var(--theme-text-dark)]">
                        {subj.modules.map((m) => (
                          <option key={m.id} value={m.id} className="bg-[var(--theme-card)] text-[var(--theme-text-dark)]">
                            M{m.order}: {m.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Group 2: Focus Clock Controls */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[var(--theme-text-main)] opacity-90">
                      Live focus tracker
                    </span>
                    {isTimerRunning && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-sans animate-pulse flex items-center gap-1.5 font-medium border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Big Digital Clock Display */}
                  <div className="font-mono text-5xl lg:text-[52px] font-bold text-center py-2 text-[var(--theme-text-dark)] tracking-wider">
                    {formatTimer(timerSeconds)}
                  </div>

                  {/* Toggle focus timer button */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={toggleTimer}
                      className={`w-full h-11 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer border-none shadow-xs flex items-center justify-center gap-2 hover:-translate-y-[1px] active:translate-y-0 ${
                        isTimerRunning
                          ? "bg-amber-600 hover:bg-amber-500 text-white"
                          : "bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white"
                      }`}
                    >
                      {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                      <span>{isTimerRunning ? "Pause Session" : "Start Live Study"}</span>
                    </button>

                    {/* Small Action Controls Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsFullscreenTimerOpen(true)}
                        className="h-10 rounded-xl border border-[var(--theme-border)] bg-transparent hover:bg-[var(--theme-beige)]/30 text-[var(--theme-text-dark)] text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer hover:-translate-y-[1px] active:translate-y-0"
                        title="Enter Fullscreen Focus mode"
                      >
                        <Maximize2 size={13} className="opacity-50" />
                        <span>Maximize</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={resetTimer}
                        disabled={timerSeconds === 0}
                        className={`h-10 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none hover:-translate-y-[1px] active:translate-y-0 ${
                          timerSeconds === 0
                            ? "bg-[var(--theme-beige)]/20 text-[var(--theme-text-main)]/30 cursor-not-allowed"
                            : "bg-[var(--theme-beige)]/50 hover:bg-[var(--theme-beige)] text-[var(--theme-text-dark)]"
                        }`}
                        title="Reset Stopwatch"
                      >
                        <RotateCcw size={13} className="opacity-50" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Group 3: Manual Session Logger */}
                <div className="border-t border-[var(--theme-border)]/45 pt-6 space-y-4">
                  <span className="text-xs font-semibold text-[var(--theme-text-main)] opacity-90 block">
                    Log completed session
                  </span>

                  {/* Study Mode & Quiz Score Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[var(--theme-text-main)] opacity-90">
                        Session type
                      </label>
                      <select
                        value={sessionType}
                        onChange={(e) => setSessionType(e.target.value as "study" | "quiz")}
                        className="w-full bg-[var(--theme-beige)]/40 text-[var(--theme-text-dark)] border border-[var(--theme-border)] rounded-xl h-10 px-3 text-xs outline-none focus:border-[var(--theme-accent)] transition font-sans cursor-pointer"
                      >
                        <option value="study" className="bg-[var(--theme-card)]">Study Review</option>
                        <option value="quiz" className="bg-[var(--theme-card)]">Practice Quiz</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[var(--theme-text-main)] opacity-90">
                        Quiz score (%)
                      </label>
                      <input
                        type="number"
                        placeholder="Optional"
                        min="0"
                        max="100"
                        value={loggedScore}
                        disabled={sessionType !== "quiz"}
                        onChange={(e) => setLoggedScore(e.target.value)}
                        className="w-full bg-[var(--theme-beige)]/40 border border-[var(--theme-border)] rounded-xl h-10 px-3 text-xs text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] transition placeholder:text-[var(--theme-text-main)]/30"
                      />
                    </div>
                  </div>

                  {/* Session Duration Selector & Inputs */}
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div className="space-y-2 col-span-1">
                      <label className="block text-xs font-medium text-[var(--theme-text-main)] opacity-90">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        placeholder="Min"
                        min="1"
                        step="1"
                        value={manualMinutes}
                        onChange={(e) => {
                          setManualMinutes(e.target.value);
                          if (isTimerRunning) {
                            setIsTimerRunning(false);
                          }
                        }}
                        className="w-full bg-[var(--theme-beige)]/40 border border-[var(--theme-border)] rounded-xl h-10 px-3 text-xs text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] transition"
                      />
                    </div>
                    
                    <div className="col-span-2 grid grid-cols-4 gap-1 h-10 items-center pb-[1px]">
                      {[15, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            setManualMinutes(mins.toString());
                            if (isTimerRunning) {
                              setIsTimerRunning(false);
                            }
                          }}
                          className={`text-xs h-10 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center hover:-translate-y-[1px] active:translate-y-0 ${
                            manualMinutes === mins.toString()
                              ? "bg-[var(--theme-accent-light)] border-[var(--theme-accent)]/20 text-[var(--theme-accent)] font-semibold"
                              : "bg-[var(--theme-beige)]/40 border-[var(--theme-border)] hover:bg-[var(--theme-beige)] text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)]"
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Manual study session Button */}
                  <button
                    type="button"
                    onClick={handleSaveUnifiedSession}
                    className="w-full h-10 rounded-xl bg-transparent hover:bg-[var(--theme-beige)]/30 text-[var(--theme-accent)] border border-[var(--theme-accent)]/30 font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer hover:-translate-y-[1px] active:translate-y-0"
                  >
                    <CheckCircle size={15} />
                    <span>Log Manual Session</span>
                  </button>
                </div>

                {/* Group 4: Study Sounds selection */}
                <div className="border-t border-[var(--theme-border)]/45 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--theme-text-main)] opacity-95 flex items-center gap-1.5">
                      <Music size={13} className="opacity-60 text-[var(--theme-accent)]" />
                      Study ambient audio
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAudioSidebarOpen && setIsAudioSidebarOpen(true)}
                      className="text-[11px] font-medium text-[var(--theme-accent)] hover:text-[var(--theme-accent-dark)] transition flex items-center gap-1 bg-[var(--theme-accent-light)] px-2.5 py-1 rounded-full border border-[var(--theme-accent)]/15 cursor-pointer"
                      title="Open side bar controller"
                    >
                      <Sliders size={10} />
                      <span>Tune Sidebar</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
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
                            }
                          }}
                          className={`flex items-center justify-center h-10 px-1 rounded-xl border text-xs tracking-wide transition-all duration-200 cursor-pointer hover:-translate-y-[1px] active:translate-y-0 ${
                            isSelected
                              ? "bg-[var(--theme-accent-light)] border-[var(--theme-accent)]/30 text-[var(--theme-accent)] font-semibold"
                              : "bg-[var(--theme-beige)]/40 border-[var(--theme-border)] hover:bg-[var(--theme-beige)] text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)]"
                          }`}
                          title={`Play ${sound.name} on repeat`}
                        >
                          <span className="truncate">{sound.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {activeAmbientId && (
                    <div className="flex flex-col gap-2 p-3.5 bg-[var(--theme-beige)]/20 rounded-xl border border-[var(--theme-border)]/45 shadow-inner">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[var(--theme-text-main)] uppercase tracking-wider">
                        <span>Ambient Volume</span>
                        <span>{Math.round(ambientVolume * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAmbientVolume(ambientVolume === 0 ? 0.25 : 0)}
                          className="text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] transition-all cursor-pointer p-1 rounded-full hover:bg-[var(--theme-beige)]/40"
                          title={ambientVolume === 0 ? "Unmute sound" : "Mute sound"}
                        >
                          {ambientVolume === 0 ? (
                            <VolumeX size={14} className="text-rose-500 animate-pulse" />
                          ) : (
                            <Volume2 size={14} className="text-[var(--theme-accent)]" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={ambientVolume}
                          onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[var(--theme-beige)] rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)] transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Group 5: Runway Motivation Quote Section */}
                <div className="border-t border-[var(--theme-border)]/45 pt-4">
                  <div className="bg-[var(--theme-beige)]/20 p-4 rounded-xl border border-[var(--theme-border)]/35 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-accent)]">
                      <span>Daily encouragement</span>
                    </div>
                    <p className="text-xs text-[var(--theme-text-dark)] leading-relaxed italic opacity-90">
                      "{DASHBOARD_QUOTES[activeQuoteIdx]}"
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Growth Tree - Occupies 2 columns */}
          <div className="lg:col-span-2">
            <GrowthTree subjects={subjects} progress={progress} totalStudyTime={totalStudyMinutes} isDashboard={true} />
          </div>
        </div>

        {/* 3. Analytics on Weak Subjects & Logs inside soft elevated panel */}
        <div className="bg-gradient-to-b from-[var(--theme-card)] to-[var(--theme-card)]/95 border border-[var(--theme-border)]/50 rounded-3xl p-7 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weak Areas Alerts */}
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-[var(--theme-text-dark)] mb-4 tracking-tight">
                Attention Areas <span className="text-xs text-rose-500 font-mono font-medium block mt-1">running score under 70%</span>
              </h3>

              {weakSubjects.length === 0 ? (
                <div className="bg-[var(--theme-beige)]/20 p-6 rounded-2xl text-center flex-1 flex flex-col items-center justify-center border border-[var(--theme-border)]/45">
                  <CheckCircle size={20} className="mb-2 text-emerald-500 opacity-80" />
                  <p className="text-sm font-semibold text-[var(--theme-text-dark)]">Exemplary scores maintained</p>
                  <p className="text-xs text-[var(--theme-text-main)] mt-1.5 leading-relaxed max-w-[200px] opacity-75 font-normal">No subject averages have slumped behind the 70% threshold yet.</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                  <p className="text-xs text-[var(--theme-text-main)] leading-relaxed mb-1 font-normal opacity-80">
                    Subjects with averages below target:
                  </p>
                  {weakSubjects.map((s) => (
                    <div key={s.id} className="bg-[var(--theme-beige)]/30 border border-[var(--theme-border)]/45 p-3.5 rounded-xl flex items-center justify-between transition-all duration-200 hover:-translate-y-[1px]">
                      <div className="min-w-0 pr-2">
                        <span className="text-sm font-semibold text-[var(--theme-text-dark)] block truncate">{s.name}</span>
                        <span className="text-xs text-[var(--theme-text-main)] opacity-75 mt-0.5 block">
                          {s.completed} of {s.total} complete
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-[6px] border border-rose-500/10 shrink-0">
                        {s.avgScore}% avg
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Logs history table */}
            <div className="lg:col-span-2 flex flex-col">
              <h3 className="text-lg font-bold text-[var(--theme-text-dark)] mb-4 tracking-tight">
                Session Activity Registers <span className="text-xs text-[var(--theme-text-main)] font-mono font-medium block mt-1">most recent logs</span>
              </h3>

              {activityLogs.length === 0 ? (
                <div className="p-8 text-center bg-[var(--theme-beige)]/20 border border-[var(--theme-border)]/45 rounded-2xl text-[var(--theme-text-main)] opacity-70 text-xs flex-1 flex items-center justify-center">
                  No sessions registered. Use the stopwatch or Study Logger to file data.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[300px] scrollbar-thin flex-1">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[var(--theme-border)]/45 text-xs text-[var(--theme-text-main)] opacity-70">
                        <th className="py-2.5 px-3 font-semibold">Date</th>
                        <th className="py-2.5 px-3 font-semibold">Subject</th>
                        <th className="py-2.5 px-3 font-semibold">Module Topic</th>
                        <th className="py-2.5 px-3 font-semibold">Spent</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--theme-border)]/30">
                      {activityLogs.slice(0, 8).map((log) => (
                        <tr key={log.id} className="hover:bg-[var(--theme-beige)]/30 transition-colors">
                          <td className="py-2.5 px-3 text-xs text-[var(--theme-text-main)] opacity-80 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--theme-accent-light)] text-[var(--theme-accent)]">
                              {log.subjectName}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[var(--theme-text-dark)] font-medium max-w-[220px] truncate">
                            {log.moduleName}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--theme-text-main)] opacity-80">{log.durationMinutes}m</td>
                          <td className="py-2.5 px-3 text-right">
                            {log.score !== undefined ? (
                              <span className={`font-semibold ${log.score >= 70 ? "text-emerald-500" : "text-rose-500"}`}>
                                {log.score}%
                              </span>
                            ) : (
                              <span className="text-[var(--theme-text-main)] opacity-30">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Settings Modal Triggered from Title Header - Changes ONLY allowed here! */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/60 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-[var(--theme-border)]/50 pb-3">
                <h3 className="text-sm font-semibold text-[var(--theme-text-dark)] flex items-center gap-1.5">
                  <Settings size={14} className="text-[var(--theme-accent)]" />
                  Adjust Runway Goals
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] hover:bg-[var(--theme-beige)] p-1.5 rounded-full text-xs transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--theme-text-main)] uppercase tracking-wider opacity-75 mb-1.5 font-mono">
                    Candidate Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={userProfile.email}
                    className="w-full bg-[var(--theme-beige)]/30 border border-[var(--theme-border)]/80 text-[var(--theme-text-main)] text-xs px-3.5 py-2.5 rounded-xl outline-none font-mono cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[var(--theme-text-main)] uppercase tracking-wider opacity-75 mb-1.5 font-mono">
                    Daily Study Goal (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={userProfile.dailyTargetHours}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 2;
                      setUserProfile({ ...userProfile, dailyTargetHours: val });
                      localStorage.setItem(`cfa_profile_${userProfile.email}`, JSON.stringify({
                        ...userProfile,
                        dailyTargetHours: val
                      }));
                    }}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text-dark)] text-xs px-3.5 py-2.5 rounded-xl font-mono outline-none focus:border-[var(--theme-accent)] transition shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[var(--theme-text-main)] uppercase tracking-wider opacity-75 mb-1.5 font-mono">
                    CFA Target Exam Date
                  </label>
                  <input
                    type="date"
                    value={userProfile.targetExamDate}
                    onChange={(e) => {
                      const chosen = e.target.value;
                      setUserProfile({ ...userProfile, targetExamDate: chosen });
                      // Also store inside local storage to match persistence constraints
                      localStorage.setItem(`cfa_profile_${userProfile.email}`, JSON.stringify({
                        ...userProfile,
                        targetExamDate: chosen
                      }));
                    }}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text-dark)] text-xs px-3.5 py-2.5 rounded-xl font-mono outline-none focus:border-[var(--theme-accent)] transition shadow-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--theme-border)]/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full sm:w-auto bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] text-xs font-semibold px-5 py-2.5 rounded-xl transition border-none shadow-sm cursor-pointer"
                >
                  Save & Lock Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
