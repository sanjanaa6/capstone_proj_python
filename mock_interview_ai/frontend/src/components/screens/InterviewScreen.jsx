import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Send, Clock, ChevronRight, ChevronLeft, Volume2, VolumeX, 
  Camera, CameraOff, Sparkles, Cpu, AlertTriangle, CheckCircle2, HelpCircle, 
  Maximize2, RefreshCw
} from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      if (saved !== null) {
        setIsTtsEnabled(saved === 'true');
      }
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

  // Camera & FaceMesh Proctoring Effect
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
          setProctorStatus('Face tracking active');
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

          ctx.fillStyle = 'rgba(99, 102, 241, 0.9)';
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    } catch {
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
    <div className="w-full max-w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="studio-container"
      >
        {/* Full-Screen Top Header Control Bar */}
        <div className="card w-full" style={{ padding: '16px 24px', background: 'rgba(255, 255, 255, 0.95)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Left: Question Counter & Timer */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-indigo-200">
                  AI Studio
                </span>
                <span className="font-bold text-base md:text-lg text-slate-800">
                  Question <span className="text-indigo-600">{questionNumber}</span> of {totalQuestions}
                </span>
              </div>

              <div className="h-5 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-amber-300 text-sm font-bold shadow-inner border border-slate-700">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
            </div>

            {/* Right: Audio, Camera & Question Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* TTS Speaker Toggle */}
              <button
                type="button"
                onClick={() => setIsTtsEnabled((v) => !v)}
                className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${
                  isTtsEnabled
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                }`}
                title={isTtsEnabled ? 'Disable Speech Readout' : 'Enable Speech Readout'}
              >
                {isTtsEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{isTtsEnabled ? 'Audio Active' : 'Audio Off'}</span>
              </button>

              {/* Camera Proctor Toggle */}
              <button
                type="button"
                onClick={() => {
                  setCameraError('');
                  setIsCameraEnabled((v) => !v);
                }}
                className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${
                  isCameraEnabled
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isCameraEnabled ? <Camera className="w-4 h-4 text-emerald-600" /> : <CameraOff className="w-4 h-4" />}
                <span>{isCameraEnabled ? 'Proctor Active' : 'Proctor Off'}</span>
              </button>

              {/* Navigation Controls */}
              {!isReviewMode && (
                <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-2">
                  <button
                    type="button"
                    onClick={onPreviousQuestion}
                    disabled={questionNumber === 1}
                    className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Previous Question"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onNextQuestion}
                    disabled={questionNumber === totalQuestions}
                    className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Next Question"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Animated Gradient Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full mt-3 overflow-hidden" style={{ height: 6 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)',
                height: '100%',
                borderRadius: 9999,
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
              }}
            />
          </div>
        </div>

        {/* 2-Column Full-Screen Grid Layout */}
        <div className="studio-grid">
          
          {/* Main Column (Left): Question & Workspace */}
          <div className="flex flex-col gap-5">
            
            {/* Question Display Card */}
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="card"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                padding: '28px'
              }}
            >
              <div className="flex items-start gap-4">
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'white',
                  fontWeight: 800,
                  fontSize: 18,
                  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
                }}>
                  Q{questionNumber}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-4" style={{ lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                    {currentQuestion}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="pill pill-success">
                      <Sparkles className="w-3.5 h-3.5" />
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
                        <Cpu className="w-3.5 h-3.5" />
                        RL Agent: {rlActionName || 'MAINTAIN_DEEPEN'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Candidate Response Workspace */}
            {!isReviewMode && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="card"
                style={{ padding: '24px' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span>Your Response</span>
                    <span className="text-xs font-normal text-slate-400">| Standard or Speech Input</span>
                  </label>

                  <span className="text-xs font-medium text-slate-500">
                    {answer.length} characters
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer here... (Tip: Press Ctrl+Enter to submit)"
                    className="input-field"
                    style={{
                      minHeight: 180,
                      resize: 'vertical',
                      fontSize: 15,
                      lineHeight: 1.65,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      padding: '16px 20px'
                    }}
                    disabled={isRecording}
                  />
                </div>

                {/* Voice Status Animation */}
                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-rose-50 border border-rose-200 rounded-xl p-3 mt-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 text-rose-700">
                        <div className="flex items-center gap-1">
                          <div className="sound-wave-bar" />
                          <div className="sound-wave-bar" />
                          <div className="sound-wave-bar" />
                          <div className="sound-wave-bar" />
                        </div>
                        <span className="text-xs font-bold">Listening live... Speak clearly into your microphone</span>
                      </div>
                      <span className="text-xs font-semibold text-rose-500 animate-pulse">RECORDING</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Banner */}
                <AnimatePresence>
                  {!!recordingError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3"
                    >
                      <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>{recordingError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Workspace Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-slate-600 font-mono text-xs">Ctrl</kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-slate-600 font-mono text-xs">Enter</kbd>
                    <span>to submit answer</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Voice Input Toggle */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={toggleRecording}
                      type="button"
                      style={{
                        padding: '10px 18px',
                        borderRadius: 14,
                        border: isRecording ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                        background: isRecording ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#ffffff',
                        color: isRecording ? 'white' : '#334155',
                        fontWeight: 700,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: isRecording ? '0 4px 14px rgba(239, 68, 68, 0.4)' : '0 2px 6px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isRecording ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4 text-indigo-600" />}
                      <span>{isRecording ? 'Stop Voice' : 'Voice Input'}</span>
                    </motion.button>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSubmit}
                      disabled={!answer.trim() || isSubmitting}
                      className="btn-primary"
                      style={{ padding: '10px 24px', fontSize: 14 }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Review Mode Notice */}
            {isReviewMode && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="card text-center py-6 bg-slate-900 text-white"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-base">Answer Submitted</span>
                </div>
                <p className="text-xs text-slate-400">
                  Time recorded for this question: <span className="font-mono text-indigo-300 font-bold">{formatTime(timeElapsed)}</span>
                </p>
              </motion.div>
            )}

          </div>

          {/* Right Column: Studio Proctor & AI Telemetry Sidebar */}
          <div className="flex flex-col gap-5">
            
            {/* AI Proctor Video Stream Card */}
            {isCameraEnabled && !isReviewMode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="studio-card"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-400" />
                    <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase">
                      AI Proctor Feed
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCameraEnabled(false)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 border border-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>

                {/* Status Pills */}
                {!cameraError && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className={`py-1.5 px-2 rounded-lg text-center font-extrabold text-xs tracking-wide border ${
                      proctorStatus === 'Face detected'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : proctorStatus === 'Looking away' || proctorStatus === 'No face detected'
                          ? 'bg-rose-500/30 border-rose-500/50 text-rose-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                      {proctorStatus === 'Face detected'
                        ? '🟢 FOCUSED'
                        : proctorStatus === 'Looking away'
                          ? '⚠️ LOOKING AWAY'
                          : proctorStatus === 'No face detected'
                            ? '❌ NO FACE'
                            : String(proctorStatus || '').toUpperCase()}
                    </div>

                    <div className="py-1.5 px-2 rounded-lg text-center font-extrabold text-xs tracking-wide bg-amber-500/20 border border-amber-500/30 text-amber-300">
                      WARNINGS: {warningCount}/6
                    </div>
                  </div>
                )}

                {/* Stream Video & Canvas */}
                <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-video shadow-inner">
                  {cameraError ? (
                    <div className="p-4 text-center text-slate-300 flex flex-col items-center justify-center h-full">
                      <CameraOff className="w-8 h-8 text-rose-400 mb-2" />
                      <span className="text-xs font-bold mb-1">Camera Permission Error</span>
                      <span className="text-[11px] text-slate-400">{cameraError}</span>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        muted
                        playsInline
                        className="w-full h-full object-cover block transform -scale-x-100"
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full transform -scale-x-100"
                      />
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* RL Adaptive Engine Telemetry Panel */}
            {isRLMode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="studio-card"
                style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.9) 100%)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-extrabold tracking-wider text-indigo-200 uppercase">
                    RL Adaptive Engine
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">Current Difficulty</span>
                    <span className="font-bold text-indigo-300">{rlDifficulty}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">Target Action</span>
                    <span className="font-bold text-emerald-400">{rlActionName || 'MAINTAIN_DEEPEN'}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    The RL policy continuously adjusts question complexity and scoring weights based on your speed, confidence, and accuracy.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Pro-Tips Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="card bg-indigo-950/40 border border-indigo-500/20 text-slate-300"
              style={{ padding: '18px' }}
            >
              <div className="flex items-center gap-2 mb-2.5 text-indigo-300">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Interview Tips</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Structure your response using the <strong>STAR</strong> method (Situation, Task, Action, Result).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Speak clearly when using <strong>Voice Input</strong> for maximum AI accuracy.</span>
                </li>
              </ul>
            </motion.div>

          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default InterviewScreen;
