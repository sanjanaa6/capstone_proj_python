import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Clock, ChevronRight, ChevronLeft, Volume2, VolumeX, Camera, CameraOff } from 'lucide-react';

const InterviewScreen = ({ 
  currentQuestion, 
  questionNumber, 
  totalQuestions, 
  onSubmitAnswer, 
  onNextQuestion, 
  onPreviousQuestion,
  isReviewMode = false,
  isRLMode = false,
  rlDifficulty = 'Medium',
  rlActionName = ''
}) => {
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [proctorStatus, setProctorStatus] = useState('Camera off');
  const [warningCount, setWarningCount] = useState(0);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const latestTranscriptRef = useRef('');
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const rafRef = useRef(null);
  const proctorStatusRef = useRef('Camera off');
  const badSinceRef = useRef(null);
  const warnedForCurrentBadRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem('ttsEnabled');
      if (saved === null) return;
      setIsTtsEnabled(saved === 'true');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('ttsEnabled', String(isTtsEnabled));
    } catch {
      // ignore
    }
    if (!isTtsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isTtsEnabled]);

  useEffect(() => {
    const stopStream = () => {
      if (cameraStreamRef.current) {
        try {
          cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch {
          // ignore
        }
        cameraStreamRef.current = null;
      }
      if (videoRef.current) {
        try {
          videoRef.current.srcObject = null;
        } catch {
          // ignore
        }
      }

      if (rafRef.current) {
        try {
          cancelAnimationFrame(rafRef.current);
        } catch {
          // ignore
        }
        rafRef.current = null;
      }

      if (faceMeshRef.current && typeof faceMeshRef.current.close === 'function') {
        try {
          faceMeshRef.current.close();
        } catch {
          // ignore
        }
      }
      faceMeshRef.current = null;
    };

    if (!isCameraEnabled) {
      setProctorStatus('Camera off');
      badSinceRef.current = null;
      warnedForCurrentBadRef.current = false;
      stopStream();
      return;
    }

    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported in this browser.');
      setIsCameraEnabled(false);
      return;
    }

    setCameraError('');
    setProctorStatus('Starting camera...');
    setWarningCount(0);

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch {
            // ignore
          }
        }

        const FaceMeshCtor = typeof window !== 'undefined' ? window.FaceMesh : null;
        if (!FaceMeshCtor) {
          setProctorStatus('Face tracking unavailable');
          return;
        }

        const faceMesh = new FaceMeshCtor({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMesh.onResults((results) => {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (!canvas || !video) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const w = video.videoWidth || 0;
          const h = video.videoHeight || 0;
          if (!w || !h) return;

          if (canvas.width !== w) canvas.width = w;
          if (canvas.height !== h) canvas.height = h;

          ctx.clearRect(0, 0, w, h);

          const landmarks = results?.multiFaceLandmarks?.[0];
          if (!landmarks || !Array.isArray(landmarks)) {
            setProctorStatus('No face detected');
            return;
          }

          // Simple “looking away” heuristic based on nose position relative to cheeks.
          const leftCheek = landmarks[234];
          const rightCheek = landmarks[454];
          const noseTip = landmarks[1];

          if (leftCheek && rightCheek && noseTip) {
            const faceCenterX = (leftCheek.x + rightCheek.x) / 2;
            const delta = noseTip.x - faceCenterX;
            if (Math.abs(delta) > 0.06) {
              setProctorStatus('Looking away');
            } else {
              setProctorStatus('Face detected');
            }
          } else {
            setProctorStatus('Face detected');
          }

          // Draw a small subset of points (eyes + nose) for visual confirmation.
          ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
          const drawIdx = [33, 133, 362, 263, 1];
          drawIdx.forEach((i) => {
            const p = landmarks[i];
            if (!p) return;
            ctx.beginPath();
            ctx.arc(p.x * w, p.y * h, 2, 0, Math.PI * 2);
            ctx.fill();
          });
        });

        faceMeshRef.current = faceMesh;

        const loop = async () => {
          const video = videoRef.current;
          if (!video || !faceMeshRef.current) return;
          try {
            await faceMeshRef.current.send({ image: video });
          } catch {
            // ignore
          }
          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
      } catch {
        setCameraError('Unable to access camera. Please allow camera permission.');
        setIsCameraEnabled(false);
        setProctorStatus('Camera permission denied');
        stopStream();
      }
    })();

    return () => {
      stopStream();
    };
  }, [isCameraEnabled]);

  useEffect(() => {
    proctorStatusRef.current = proctorStatus;
  }, [proctorStatus]);

  useEffect(() => {
    if (!isCameraEnabled || isReviewMode) return;

    const MAX_WARNINGS = 6;
    const THRESHOLD_MS = 2500;

    const isBadStatus = (status) => status === 'Looking away' || status === 'No face detected';

    const interval = setInterval(() => {
      const status = proctorStatusRef.current;
      const bad = isBadStatus(status);
      const now = Date.now();

      if (bad) {
        if (!badSinceRef.current) badSinceRef.current = now;
        if (!warnedForCurrentBadRef.current && now - badSinceRef.current >= THRESHOLD_MS) {
          warnedForCurrentBadRef.current = true;
          setWarningCount((c) => (c >= MAX_WARNINGS ? c : c + 1));
        }
      } else {
        badSinceRef.current = null;
        warnedForCurrentBadRef.current = false;
      }
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, [isCameraEnabled, isReviewMode]);

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        try {
          cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch {
          // ignore
        }
        cameraStreamRef.current = null;
      }
    };
  }, []);

  const speakQuestion = (text) => {
    if (!isTtsEnabled) return;
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;
    if (!text || typeof text !== 'string') return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Question: ${text}`);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('TTS error:', e);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && !isReviewMode) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isReviewMode]);

  // Start timer when question loads
  useEffect(() => {
    if (!isReviewMode) {
      setTimeElapsed(0);
      setIsTimerRunning(true);
    }
  }, [currentQuestion, isReviewMode]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isReviewMode && isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  useEffect(() => {
    if (!isReviewMode) {
      speakQuestion(currentQuestion);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion, isReviewMode, isTtsEnabled]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (answer.trim() && !isSubmitting) {
      setIsSubmitting(true);
      setIsTimerRunning(false);
      try {
        await onSubmitAnswer(answer, timeElapsed);
        setAnswer('');
        setTimeElapsed(0);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleRecording = () => {
    if (typeof window === 'undefined') return;
    setRecordingError('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecordingError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setAnswer(latestTranscriptRef.current || finalTranscriptRef.current || answer);
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    finalTranscriptRef.current = '';
    latestTranscriptRef.current = '';
    recognitionRef.current = recognition;
    setIsRecording(true);

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const res = event.results[i];
        const text = res && res[0] && res[0].transcript ? res[0].transcript : '';
        if (!text) continue;
        if (res.isFinal) {
          finalTranscriptRef.current += `${text} `;
        } else {
          interim += text;
        }
      }
      const combined = `${finalTranscriptRef.current}${interim}`.trim();
      latestTranscriptRef.current = combined;
      setAnswer(combined);
    };

    recognition.onerror = (e) => {
      setRecordingError(e?.error ? `Speech recognition error: ${e.error}` : 'Speech recognition error');
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setAnswer(latestTranscriptRef.current || finalTranscriptRef.current || answer);
      setIsRecording(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (e) {
      setRecordingError('Unable to start recording. Please try again.');
      setIsRecording(false);
      recognitionRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="screen-inner"
      >
        {/* Progress bar and question counter */}
        <div className="card mb-6" style={{ padding: '20px 24px' }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-slate-800">
                Question {questionNumber} of {totalQuestions}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-200">
                <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCameraError('');
                  setIsCameraEnabled((v) => !v);
                }}
                className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${
                  isCameraEnabled 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' 
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
                type="button"
                aria-label={isCameraEnabled ? 'Disable camera preview' : 'Enable camera preview'}
              >
                {isCameraEnabled ? <Camera className="w-4 h-4 text-emerald-600" /> : <CameraOff className="w-4 h-4" />}
                <span>{isCameraEnabled ? 'Camera Active' : 'Camera Off'}</span>
              </button>

              <button
                onClick={() => setIsTtsEnabled((v) => !v)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isTtsEnabled
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
                type="button"
                aria-label={isTtsEnabled ? 'Disable question announcements' : 'Enable question announcements'}
              >
                {isTtsEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {!isReviewMode && (
                <div className="flex gap-1.5 ml-1">
                  <button
                    onClick={onPreviousQuestion}
                    disabled={questionNumber === 1}
                    className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onNextQuestion}
                    disabled={questionNumber === totalQuestions}
                    className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full" style={{ height: 10, padding: 2, border: '1px solid #e2e8f0' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)',
                height: 6,
                borderRadius: 9999,
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)'
              }}
            />
          </div>
        </div>

        {/* Question card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="card mb-6"
          style={{ padding: '28px' }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'white',
              fontWeight: 800,
              fontSize: 16,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}>
              Q{questionNumber}
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3" style={{ lineHeight: 1.45 }}>
                {currentQuestion}
              </h2>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="pill pill-success">
                  Technical
                </span>
                <span className={`pill ${
                  rlDifficulty === 'Easy' ? 'pill-easy' :
                  rlDifficulty === 'Medium' ? 'pill-medium' :
                  rlDifficulty === 'Hard' ? 'pill-hard' : 'pill-expert'
                }`}>
                  Difficulty: {rlDifficulty || 'Medium'}
                </span>
                {isRLMode && (
                  <span className="pill" style={{ background: 'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)', color: '#7e22ce', border: '1px solid #e9d5ff' }}>
                    ⚡ RL Agent: {rlActionName || 'MAINTAIN_DEEPEN'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Answer input area */}
        {!isReviewMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="card"
          >
            <div className="mb-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Your Answer
              </label>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here... (Ctrl+Enter to submit)"
                className="input-field"
                style={{ minHeight: 140, resize: 'none', fontSize: 15, lineHeight: 1.6 }}
                disabled={isRecording}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                <span className="text-xs text-slate-500 font-medium">
                  {answer.length} characters • Press Ctrl+Enter to submit
                </span>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={toggleRecording}
                    type="button"
                    style={{
                      padding: '10px 18px',
                      borderRadius: 14,
                      border: isRecording ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                      cursor: 'pointer',
                      background: isRecording ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#f8fafc',
                      color: isRecording ? 'white' : '#475569',
                      fontWeight: 600,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: isRecording ? '0 4px 14px rgba(239, 68, 68, 0.4)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isRecording ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4 text-indigo-600" />}
                    <span>{isRecording ? 'Stop Voice' : 'Voice Input'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSubmit}
                    disabled={!answer.trim() || isSubmitting}
                    className="btn-primary"
                    style={{ padding: '10px 22px', fontSize: 14 }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Loading Next Question...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Answer
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Voice recording indicator */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3"
                >
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Recording live voice... Speak clearly into your microphone</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!!recordingError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3"
                >
                  <div className="text-amber-800 text-sm font-medium">{recordingError}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Review mode display */}
        {isReviewMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card bg-slate-50 text-center"
          >
            <p className="text-slate-600 font-medium">
              Answer submitted • Time taken: {formatTime(timeElapsed)}
            </p>
          </motion.div>
        )}

        {/* Floating Always-Open Camera HUD on Top Right */}
        {typeof document !== 'undefined' && (isCameraEnabled || !!cameraError) && !isReviewMode && createPortal(
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            style={{
              position: 'fixed',
              top: 86,
              right: 28,
              zIndex: 9999,
              width: 270,
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.4), 0 0 20px rgba(99, 102, 241, 0.2)',
              borderRadius: 20,
              padding: 14,
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            {/* HUD Header */}
            <div style={{ display: 'flex', itemsCenter: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#10b981', boxShadow: '0 0 8px #10b981' }} className="animate-pulse" />
                <span style={{ color: 'white', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em' }}>AI PROCTOR CAMERA</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCameraEnabled(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94a3b8', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
              >
                Close
              </button>
            </div>

            {!cameraError && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                <div
                  style={{
                    padding: '5px 8px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 800,
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    background:
                      proctorStatus === 'Face detected'
                        ? 'rgba(16, 185, 129, 0.35)'
                        : proctorStatus === 'Looking away' || proctorStatus === 'No face detected'
                          ? 'rgba(239, 68, 68, 0.4)'
                          : 'rgba(107, 114, 128, 0.35)'
                  }}
                >
                  {proctorStatus === 'Face detected'
                    ? '🟢 FOCUSED'
                    : proctorStatus === 'Looking away'
                      ? '⚠️ LOOKING AWAY'
                      : proctorStatus === 'No face detected'
                        ? '❌ NO FACE'
                        : String(proctorStatus || '').toUpperCase()}
                </div>
                <div
                  style={{
                    padding: '5px 8px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 800,
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fde047',
                    background: 'rgba(234, 179, 8, 0.3)'
                  }}
                >
                  WARNINGS: {warningCount}/6
                </div>
              </div>
            )}

            {/* Video preview container */}
            <div
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                position: 'relative',
                border: proctorStatus === 'Looking away' || proctorStatus === 'No face detected'
                  ? '2px solid #ef4444'
                  : '1px solid rgba(255,255,255,0.2)',
                background: '#090d16',
                boxShadow: proctorStatus === 'Looking away' ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'none'
              }}
            >
              {cameraError ? (
                <div style={{ padding: 16, color: 'white', textAlign: 'center' }}>
                  <CameraOff className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Camera Access Required</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{cameraError}</div>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    style={{ width: '100%', height: 155, objectFit: 'cover', display: 'block', transform: 'scaleX(-1)' }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: 155, transform: 'scaleX(-1)' }}
                  />
                </div>
              )}
            </div>
          </motion.div>,
          document.body
        )}
      </motion.div>
    </div>
  );
};

export default InterviewScreen;
