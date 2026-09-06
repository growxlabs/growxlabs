"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Mic,
  MicOff,
  Video,
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronLeft,
  Sliders,
  Sparkles,
} from "@/components/editor/icons/StudioIcons";
import { toast } from "sonner";

interface WebcamRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (videoBlob: Blob, videoUrl: string) => void;
  initialScript?: string;
}

export function WebcamRecorderModal({
  isOpen,
  onClose,
  onRecordingComplete,
  initialScript = "Today, I want to break down how Rapido engineered their instant ride verification using a constant OTP. While other ride apps send dynamic SMS pins that cause carrier latency, Rapido relies on real-time background GPS proximity. The ride only starts when both devices match coordinates side-by-side. Follow GrowXLabs for more deep systems engineering breakdowns.",
}: WebcamRecorderModalProps) {
  // Media streams & recording
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [isReady, setIsReady] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingState, setRecordingState] = useState<"idle" | "countdown" | "recording" | "paused" | "review">("idle");
  const [countdown, setCountdown] = useState(3);
  const [recordingDuration, setRecordingDuration] = useState(0); // seconds
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Teleprompter state
  const [showTeleprompter, setShowTeleprompter] = useState(true);
  const [teleprompterText, setTeleprompterText] = useState(initialScript);
  const [scrollSpeed, setScrollSpeed] = useState(2); // 1 = slow, 2 = medium, 3 = fast
  const [fontSize, setFontSize] = useState(18); // px
  const [isTeleprompterScrolling, setIsTeleprompterScrolling] = useState(false);
  const teleprompterBoxRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);

  // Initialize camera & mic on modal open
  const startCamera = useCallback(async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          facingMode: "user",
        },
        audio: true,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setHasPermission(true);
      setIsReady(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setHasPermission(false);
      toast.error("Could not access camera/microphone. Please allow browser permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setRecordingState("idle");
      setRecordingDuration(0);
      setRecordedVideoUrl(null);
      setRecordedBlob(null);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Teleprompter auto-scroll loop
  useEffect(() => {
    if (!isTeleprompterScrolling || recordingState !== "recording") {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }

    let lastTime = performance.now();
    const scrollStep = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (teleprompterBoxRef.current) {
        const speedMultiplier = scrollSpeed === 1 ? 25 : scrollSpeed === 2 ? 45 : 70;
        teleprompterBoxRef.current.scrollTop += delta * speedMultiplier;
      }
      scrollAnimRef.current = requestAnimationFrame(scrollStep);
    };

    scrollAnimRef.current = requestAnimationFrame(scrollStep);
    return () => {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [isTeleprompterScrolling, recordingState, scrollSpeed]);

  // Toggle Mic mute
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !t.enabled));
      setIsMicMuted(!isMicMuted);
    }
  };

  // Start countdown before recording
  const handleStartCountdown = () => {
    setRecordingState("countdown");
    setCountdown(3);

    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
      } else {
        clearInterval(interval);
        startActualRecording();
      }
    }, 1000);
  };

  // Start MediaRecorder
  const startActualRecording = () => {
    if (!mediaStreamRef.current) return;

    recordedChunksRef.current = [];

    let mimeType = "video/webm;codecs=vp9,opus";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/mp4";
      }
    }

    try {
      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(finalBlob);
        setRecordedBlob(finalBlob);
        setRecordedVideoUrl(url);
        setRecordingState("review");
      };

      recorder.start(250); // Slice every 250ms
      setRecordingState("recording");
      setRecordingDuration(0);
      setIsTeleprompterScrolling(true);

      // Start duration counter
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("MediaRecorder start error:", err);
      toast.error("Could not start video recording on this browser");
      setRecordingState("idle");
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsTeleprompterScrolling(false);
  };

  // Retake video
  const handleRetake = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    setRecordingDuration(0);
    setRecordingState("idle");
    if (teleprompterBoxRef.current) {
      teleprompterBoxRef.current.scrollTop = 0;
    }
    startCamera();
  };

  // Accept and use recorded video
  const handleAcceptRecording = () => {
    if (recordedBlob && recordedVideoUrl) {
      onRecordingComplete(recordedBlob, recordedVideoUrl);
      toast.success("Recording loaded into studio!");
      onClose();
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl h-[90vh] bg-[#141416] border border-[#2c2c30] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="h-14 px-6 border-b border-[#252528] bg-[#1a1a1e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Camera size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>In-Studio Camera Recorder</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  9:16 HD Reel
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">Record yourself talking with built-in teleprompter</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTeleprompter(!showTeleprompter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                showTeleprompter
                  ? "bg-[#1687f8]/20 text-[#38bdf8] border border-[#1687f8]/40 shadow-sm"
                  : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
              }`}
            >
              <Sparkles size={12} />
              <span>Teleprompter {showTeleprompter ? "ON" : "OFF"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Center Viewport & Teleprompter Workspace */}
        <div className="flex-1 min-h-0 relative flex items-center justify-center bg-[#0a0a0c] overflow-hidden p-6 gap-6">
          {/* Main 9:16 Viewfinder */}
          <div className="relative h-full aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border border-[#2d2d34] flex items-center justify-center">
            {recordingState !== "review" ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* 9:16 Safe Margin Guides */}
                <div className="absolute inset-x-4 top-10 bottom-16 border border-dashed border-white/20 pointer-events-none rounded-xl" />

                {/* Live Recording Red Dot Badge */}
                {recordingState === "recording" && (
                  <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-rose-500/40 text-white text-xs font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold text-rose-400">{formatSeconds(recordingDuration)}</span>
                  </div>
                )}

                {/* Countdown Overlay (3, 2, 1) */}
                {recordingState === "countdown" && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <span className="text-8xl font-black text-white animate-bounce tracking-tighter">
                      {countdown}
                    </span>
                  </div>
                )}
              </>
            ) : (
              /* Review Recorded Video */
              <video
                ref={previewRef}
                src={recordedVideoUrl || ""}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Teleprompter Script Drawer */}
          {showTeleprompter && (
            <div className="w-80 h-full bg-[#18181b] border border-[#2f2f35] rounded-2xl flex flex-col overflow-hidden shadow-xl shrink-0">
              {/* Teleprompter Top Bar */}
              <div className="p-3 border-b border-[#2a2a30] bg-[#1e1e22] flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <Sliders size={13} className="text-[#1687f8]" />
                  <span>Teleprompter Script</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScrollSpeed((prev) => (prev === 3 ? 1 : prev + 1))}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
                    title="Change scroll speed"
                  >
                    Speed: {scrollSpeed === 1 ? "1x" : scrollSpeed === 2 ? "1.5x" : "2x"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize((prev) => (prev >= 24 ? 14 : prev + 2))}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
                    title="Change text size"
                  >
                    A{fontSize}
                  </button>
                </div>
              </div>

              {/* Scrolling Teleprompter Text Area */}
              <div
                ref={teleprompterBoxRef}
                className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-[#141416] text-white leading-relaxed select-none"
                style={{ fontSize: `${fontSize}px` }}
              >
                <div className="h-16" /> {/* Top padding for reading margin */}
                <p className="font-semibold text-neutral-100 tracking-tight whitespace-pre-line">
                  {teleprompterText}
                </p>
                <div className="h-48" /> {/* Bottom padding so text scrolls completely through */}
              </div>

              {/* Edit script info */}
              <div className="p-2 border-t border-[#2a2a30] bg-[#19191d] flex items-center justify-between text-[11px] text-neutral-400">
                <span>Reads near camera lens for natural eye contact</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Controls */}
        <div className="h-20 px-8 border-t border-[#252528] bg-[#18181c] flex items-center justify-between shrink-0">
          {/* Left Mic Control */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMic}
              disabled={recordingState === "review"}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isMicMuted
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300"
              }`}
              title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>

          {/* Center Main Record Trigger */}
          <div className="flex items-center gap-4">
            {recordingState === "idle" && (
              <button
                type="button"
                onClick={handleStartCountdown}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-105"
              >
                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span>Start 9:16 Recording</span>
              </button>
            )}

            {recordingState === "recording" && (
              <button
                type="button"
                onClick={handleStopRecording}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span className="w-3.5 h-3.5 rounded-sm bg-white" />
                <span>Finish Recording ({formatSeconds(recordingDuration)})</span>
              </button>
            )}

            {recordingState === "review" && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={handleAcceptRecording}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-105"
                >
                  <Check size={16} />
                  <span>Use This Recording In Studio</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Status */}
          <div className="text-right">
            <span className="text-xs text-neutral-400 font-mono">
              {recordingState === "recording"
                ? `Recording: ${formatSeconds(recordingDuration)}`
                : recordingState === "review"
                ? `Length: ${formatSeconds(recordingDuration)}`
                : "Ready to record"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
