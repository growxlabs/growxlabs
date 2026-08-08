"use client";

import { useState, useEffect, useRef } from "react";
const alfa = { className: "font-serif" };
const dmSans = { className: "font-sans" };

type ReelState = "idle" | "countdown" | "hook" | "teaser-video" | "game-video" | "cta";

export default function ReelRecorderPage() {
  const [state, setState] = useState<ReelState>("idle");
  const [countdown, setCountdown] = useState(3);
  const [videoFit, setVideoFit] = useState<"contain" | "cover">("contain");
  const teaserVideoRef = useRef<HTMLVideoElement>(null);
  const gameVideoRef = useRef<HTMLVideoElement>(null);

  // Playback flow trigger
  useEffect(() => {
    if (state === "countdown") {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            setState("hook");
            return 3;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    if (state === "hook") {
      const timer = setTimeout(() => {
        setState("teaser-video");
      }, 3500); // Show hook for 3.5 seconds
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Video play controller
  useEffect(() => {
    if (state === "teaser-video" && teaserVideoRef.current) {
      teaserVideoRef.current.play().catch((e) => console.log("Teaser play error:", e));
    } else if (state === "game-video" && gameVideoRef.current) {
      gameVideoRef.current.play().catch((e) => console.log("Game play error:", e));
    }
  }, [state]);

  function startRecordingFlow() {
    setState("countdown");
    setCountdown(3);

    // Prime both video elements so they are whitelisted by the browser for unmuted autoplay
    if (teaserVideoRef.current) {
      teaserVideoRef.current.muted = false;
      teaserVideoRef.current.load();
      teaserVideoRef.current.play().then(() => {
        teaserVideoRef.current?.pause();
      }).catch((e) => console.log("Priming teaser video blocked:", e));
    }
    if (gameVideoRef.current) {
      gameVideoRef.current.muted = false;
      gameVideoRef.current.load();
      gameVideoRef.current.play().then(() => {
        gameVideoRef.current?.pause();
      }).catch((e) => console.log("Priming game video blocked:", e));
    }
  }

  function resetFlow() {
    if (teaserVideoRef.current) {
      teaserVideoRef.current.pause();
      teaserVideoRef.current.currentTime = 0;
    }
    if (gameVideoRef.current) {
      gameVideoRef.current.pause();
      gameVideoRef.current.currentTime = 0;
    }
    setState("idle");
  }

  return (
    <main className={`reel-recorder-container ${dmSans.className}`}>
      {/* Background aesthetics */}
      <div className="dark-bg-pattern" />

      {/* Control Panel (Hidden during playback to allow clean screen-recording) */}
      {state === "idle" && (
        <div className="control-panel">
          <h2>Reel Recording Simulator</h2>
          <p>This page mimics a mobile phone (9:16) for clean Instagram Reel recording.</p>
          <ol>
            <li>Start your screen recording software.</li>
            <li>Crop the recording window to the phone frame.</li>
            <li>Select your preferred video display ratio.</li>
            <li>Click <strong>Start Record Flow</strong>.</li>
          </ol>

          <div className="settings-group">
            <label>Game Video Display Ratio:</label>
            <div className="toggle-buttons">
              <button 
                type="button"
                className={videoFit === "contain" ? "active" : ""} 
                onClick={() => setVideoFit("contain")}
              >
                Letterbox (16:9)
              </button>
              <button 
                type="button"
                className={videoFit === "cover" ? "active" : ""} 
                onClick={() => setVideoFit("cover")}
              >
                Fill Screen (9:16 Crop)
              </button>
            </div>
          </div>

          <button className="primary-btn" onClick={startRecordingFlow}>Start Record Flow</button>
        </div>
      )}

      {/* Active Playback Indicator & Reset Button */}
      {state !== "idle" && (
        <div className="recording-controls">
          <span className="status-badge">● RECORDING SIMULATION ACTIVE</span>
          <button className="reset-btn" onClick={resetFlow}>
            Reset & Show Options
          </button>
        </div>
      )}

      {/* Mobile Device Frame */}
      <div className={`phone-frame ${state !== "idle" ? "playing" : ""}`}>
        <div className="phone-screen">
          {/* STATE: IDLE */}
          {state === "idle" && (
            <div className="screen-idle">
              <span className="phone-camera-lens" />
              <h3>Instagram Reel Preview</h3>
              <p>Ready to simulate: Hook → Teaser → Game → CTA</p>
            </div>
          )}

          {/* STATE: COUNTDOWN */}
          {state === "countdown" && (
            <div className="screen-countdown">
              <div className="countdown-number">{countdown}</div>
              <p>Get ready to record...</p>
            </div>
          )}

          {/* STATE: HOOK (First 3 seconds) */}
          {state === "hook" && (
            <div className="screen-hook">
              <div className="vignette-effect" />
              <div className="hook-text-container">
                <h1 className={`${alfa.className} hook-glow-text`}>
                  Do NOT Make <br />
                  A Wish On The <br />
                  <span className="text-red">One Wish Willow...</span>
                </h1>
                <p className="hook-sub">I did, and now I'm cursed.</p>
              </div>
            </div>
          )}

          {/* STATE: TEASER & GAME VIDEO (Dual Video Player to prevent reload/lag and bypass browser autoplay block) */}
          <div className={`screen-video ${(state === "teaser-video" || state === "game-video") ? "active" : ""}`}>
            <video
              ref={teaserVideoRef}
              className="cover-video"
              src="/videos/obsession-video.mp4"
              playsInline
              preload="auto"
              style={{ display: state === "teaser-video" ? "block" : "none" }}
              onEnded={() => {
                setState("game-video");
              }}
            />
            <video
              ref={gameVideoRef}
              className={videoFit === "contain" ? "contain-video" : "cover-video"}
              src="/videos/gxl-wish-game-22.mp4"
              playsInline
              preload="auto"
              style={{ display: state === "game-video" ? "block" : "none" }}
              onEnded={() => {
                setState("cta");
              }}
            />
            {state === "teaser-video" && (
              <div className="video-reel-caption">
                <p className={alfa.className}>OBSESSION</p>
              </div>
            )}
            {state === "game-video" && (
              <div className="video-reel-caption">
                <p className={alfa.className}>WISH GAME</p>
              </div>
            )}
          </div>

          {/* STATE: CTA (End Screen) */}
          {state === "cta" && (
            <div className="screen-cta">
              <div className="cta-vignette" />
              <div className="cta-card">
                <div className="horror-icon">✉</div>
                <h2 className={alfa.className}>Dare to test it?</h2>
                <p className="cta-instructions">
                  Comment <strong className="glow-word">"WISH"</strong> below <br />
                  and I will DM you the game link instantly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .reel-recorder-container {
          background: #0f0c08;
          color: #ffffff;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 20px;
          overflow: hidden;
        }

        .dark-bg-pattern {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, #1e150b 0%, #080503 100%);
          opacity: 0.8;
          z-index: 0;
        }

        /* Control Panel */
        .control-panel {
          position: absolute;
          left: 4%;
          max-width: 380px;
          background: rgba(30, 20, 10, 0.9);
          border: 2px solid #5a1212;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
          z-index: 10;
        }

        .control-panel h2 {
          color: #ff3333;
          margin-bottom: 12px;
        }

        .control-panel p {
          font-size: 0.95rem;
          color: #ccc;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .control-panel ol {
          margin-bottom: 20px;
          padding-left: 20px;
          color: #eee;
          font-size: 0.9rem;
        }

        .control-panel li {
          margin-bottom: 8px;
        }

        .control-panel button {
          background: #cc1f1f;
          border: none;
          color: white;
          padding: 12px 24px;
          font-weight: bold;
          font-size: 1rem;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          transition: background 200ms;
        }

        .control-panel button:hover {
          background: #ff3333;
        }

        /* Recording Top Bar Controls */
        .recording-controls {
          position: absolute;
          top: 20px;
          display: flex;
          gap: 15px;
          align-items: center;
          z-index: 10;
        }

        .status-badge {
          background: #cc1f1f;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          animation: pulse 1s infinite alternate;
        }

        .reset-btn {
          background: #333;
          border: 1px solid #555;
          color: white;
          padding: 6px 14px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .reset-btn:hover {
          background: #444;
        }

        /* Phone Mockup Frame */
        .phone-frame {
          width: 360px;
          height: 640px;
          border: 10px solid #222;
          border-radius: 40px;
          background: #000;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(204, 31, 31, 0.15);
          position: relative;
          z-index: 1;
          overflow: hidden;
          transition: border-color 300ms ease;
        }

        .phone-frame.playing {
          border-color: #111;
        }

        .phone-screen {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          background: #000000;
        }

        .phone-camera-lens {
          width: 12px;
          height: 12px;
          background: #111;
          border-radius: 50%;
          position: absolute;
          top: 15px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          box-shadow: inset 0 1px 2px rgba(255,255,255,0.2);
        }

        /* State Styles: Idle */
        .screen-idle {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 30px;
          text-align: center;
          background: #110d0a;
        }

        .screen-idle h3 {
          font-size: 1.3rem;
          color: #cc1f1f;
          margin-bottom: 8px;
        }

        .screen-idle p {
          color: #888;
          font-size: 0.9rem;
        }

        /* State Styles: Countdown */
        .screen-countdown {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #000;
        }

        .countdown-number {
          font-size: 8rem;
          font-weight: 900;
          color: #cc1f1f;
          line-height: 1;
          animation: scaleUp 1s infinite;
        }

        .screen-countdown p {
          color: #666;
          font-size: 0.9rem;
          margin-top: 10px;
        }

        /* State Styles: Hook */
        .screen-hook {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          background: #0d0905;
        }

        .vignette-effect {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, transparent 20%, #000 100%);
          pointer-events: none;
        }

        .hook-text-container {
          z-index: 2;
          text-align: center;
          animation: fadeSlideIn 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hook-glow-text {
          font-size: 2.15rem;
          line-height: 1.15;
          text-shadow: 0 0 15px rgba(204, 31, 31, 0.4);
          color: #ffffff;
        }

        .text-red {
          color: #cc1f1f;
          text-shadow: 0 0 20px rgba(204, 31, 31, 0.8);
        }

        .hook-sub {
          font-family: monospace;
          color: #888;
          margin-top: 18px;
          font-size: 0.9rem;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* State Styles: Video */
        .screen-video {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 300ms ease;
        }

        .screen-video.active {
          opacity: 1;
          pointer-events: auto;
        }

        .screen-video video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .contain-video {
          object-fit: contain !important;
        }

        .cover-video {
          object-fit: cover !important;
        }

        /* Settings group on control panel */
        .settings-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .settings-group label {
          font-size: 0.85rem;
          font-weight: bold;
          color: #ff3333;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .toggle-buttons {
          display: flex;
          gap: 10px;
        }

        .toggle-buttons button {
          flex: 1;
          background: #22150a !important;
          border: 1px solid #5a1212 !important;
          color: #999 !important;
          font-size: 0.75rem !important;
          padding: 8px 10px !important;
          min-height: auto !important;
          cursor: pointer !important;
          box-shadow: none !important;
          border-radius: 4px !important;
          text-transform: uppercase !important;
        }

        .toggle-buttons button.active {
          background: #cc1f1f !important;
          border-color: #cc1f1f !important;
          color: white !important;
          font-weight: bold !important;
        }

        .primary-btn {
          margin-top: 10px;
        }

        .video-reel-caption {
          position: absolute;
          bottom: 30px;
          left: 20px;
          z-index: 2;
          background: rgba(0,0,0,0.6);
          padding: 6px 12px;
          border-left: 3px solid #cc1f1f;
        }

        .video-reel-caption p {
          font-size: 0.85rem;
          color: #fff;
          letter-spacing: 1px;
        }

        /* State Styles: CTA */
        .screen-cta {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          background: #0a0806;
          animation: fadeBg 500ms ease-out forwards;
        }

        .cta-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, transparent 30%, #000 100%);
          pointer-events: none;
        }

        .cta-card {
          width: 100%;
          background: #14100c;
          border: 2px solid #cc1f1f;
          border-radius: 16px;
          padding: 24px 16px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.8), 0 0 15px rgba(204, 31, 31, 0.25);
          z-index: 2;
          animation: scaleUp 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .horror-icon {
          font-size: 3rem;
          color: #cc1f1f;
          line-height: 1;
          margin-bottom: 12px;
          animation: float 2s ease-in-out infinite alternate;
        }

        .cta-card h2 {
          font-size: 1.5rem;
          color: #ffffff;
          margin-bottom: 10px;
          text-shadow: 2px 2px 0 #000;
        }

        .cta-instructions {
          font-size: 0.95rem;
          color: #ccc;
          line-height: 1.4;
          margin-bottom: 18px;
        }

        .glow-word {
          color: #ff3333;
          font-size: 1.1rem;
          text-shadow: 0 0 10px rgba(255,51,51,0.6);
        }

        .mock-chat-bubble,
        .mock-chat-reply {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1f1a14;
          border-radius: 8px;
          padding: 8px 12px;
          font-family: monospace;
          font-size: 0.8rem;
          margin-bottom: 8px;
          text-align: left;
        }

        .mock-chat-bubble {
          border-left: 2px solid #ff3333;
          animation: slideInRight 1.5s ease-out 1s forwards;
          opacity: 0;
        }

        .mock-chat-reply {
          border-left: 2px solid #555;
          margin-bottom: 0;
          animation: slideInRight 1.5s ease-out 2.5s forwards;
          opacity: 0;
        }

        .mock-user {
          color: #888;
          font-weight: bold;
        }

        .mock-comment {
          color: #ff3333;
          font-weight: bold;
        }

        .mock-reply {
          color: #00ff66;
        }

        /* Keyframes */
        @keyframes pulse {
          0% { opacity: 0.8; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1.02); }
        }

        @keyframes scaleUp {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeSlideIn {
          0% { transform: translateY(15px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes fadeBg {
          0% { background: #000; }
          100% { background: #0a0806; }
        }

        @keyframes float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }

        @keyframes slideInRight {
          0% { transform: translateX(20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </main>
  );
}
