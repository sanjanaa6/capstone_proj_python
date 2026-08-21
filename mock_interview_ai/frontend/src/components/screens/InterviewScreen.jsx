import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Send, Clock, ChevronRight, ChevronLeft, Volume2, VolumeX, 
  Camera, CameraOff, Sparkles, Cpu, AlertTriangle, CheckCircle2, HelpCircle 
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
  const [activeEvaluation, setActiveEvaluation] = useState(null);

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
        const res = await onSubmitAnswer(answer, timeElapsed);
        if (res && res.review) {
          setActiveEvaluation(res);
        } else {
          setAnswer('');
          setTimeElapsed(0);
        }
      } catch (err) {
        console.error('Error submitting answer:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleProceedNext = () => {
    setAnswer('');
    setTimeElapsed(0);
    const wasComplete = activeEvaluation?.isComplete;
    setActiveEvaluation(null);
    if (wasComplete) {
      onNextQuestion();
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
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            
            {/* Left: Question Counter & Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '10px',
                  background: '#4f46e5',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}>
                  AI Studio
                </span>

                <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                  Question <span style={{ color: '#4f46e5' }}>{questionNumber}</span> of {totalQuestions}
                </span>
              </div>

              <div style={{ width: 1, height: 20, background: '#cbd5e1' }} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: '#0f172a',
                color: '#fde047',
                fontSize: '13px',
                fontWeight: 700,
                border: '1px solid #334155'
              }}>
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span style={{ fontFamily: 'monospace' }}>{formatTime(timeElapsed)}</span>
              </div>
            </div>

            {/* Right: Audio, Camera & Question Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* TTS Speaker Toggle */}
              <button
                type="button"
                onClick={() => setIsTtsEnabled((v) => !v)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: isTtsEnabled ? '1px solid #c7d2fe' : '1px solid #cbd5e1',
                  background: isTtsEnabled ? '#e0e7ff' : '#f1f5f9',
                  color: isTtsEnabled ? '#3730a3' : '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={isTtsEnabled ? 'Disable Speech Readout' : 'Enable Speech Readout'}
              >
                {isTtsEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
                <span>{isTtsEnabled ? 'Audio Active' : 'Audio Off'}</span>
              </button>

              {/* Camera Proctor Toggle */}
              <button
                type="button"
                onClick={() => {
                  setCameraError('');
                  setIsCameraEnabled((v) => !v);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: isCameraEnabled ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                  background: isCameraEnabled ? '#d1fae5' : '#f1f5f9',
                  color: isCameraEnabled ? '#065f46' : '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {isCameraEnabled ? <Camera className="w-4 h-4 text-emerald-600" /> : <CameraOff className="w-4 h-4" />}
                <span>{isCameraEnabled ? 'Proctor Active' : 'Proctor Off'}</span>
              </button>

              {/* Navigation Controls */}
              {!isReviewMode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px', paddingLeft: '8px', borderLeft: '1px solid #cbd5e1' }}>
                  <button
                    type="button"
                    onClick={onPreviousQuestion}
                    disabled={questionNumber === 1}
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      cursor: questionNumber === 1 ? 'not-allowed' : 'pointer',
                      opacity: questionNumber === 1 ? 0.35 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Previous Question"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onNextQuestion}
                    disabled={questionNumber === totalQuestions}
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      cursor: questionNumber === totalQuestions ? 'not-allowed' : 'pointer',
                      opacity: questionNumber === totalQuestions ? 0.35 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Next Question"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Animated Gradient Progress Bar */}
          <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '9999px', marginTop: '12px', height: '6px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)',
                height: '100%',
                borderRadius: '9999px',
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
              }}
            />
          </div>
        </div>

        {/* 2-Column Full-Screen Grid Layout */}
        <div className="studio-grid">
          
          {/* Main Column (Left): Question & Workspace */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
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

                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', lineHeight: 1.45, letterSpacing: '-0.01em' }}>
                    {currentQuestion}
                  </h2>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Your Response</span>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>| Standard or Voice Input</span>
                  </label>

                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
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
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '14px',
                        padding: '12px 16px',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b91c1c' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div className="sound-wave-bar" />
                          <div className="sound-wave-bar" />
                          <div className="sound-wave-bar" />
                          <div className="sound-wave-bar" />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>Listening live... Speak clearly into your microphone</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444' }} className="animate-pulse">RECORDING</span>
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
                      style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '12px 16px', marginTop: '12px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '13px', fontWeight: 600 }}>
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>{recordingError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Workspace Action Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                    <kbd style={{ padding: '3px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#334155', fontFamily: 'monospace', fontSize: '11px' }}>Ctrl</kbd>
                    <span>+</span>
                    <kbd style={{ padding: '3px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#334155', fontFamily: 'monospace', fontSize: '11px' }}>Enter</kbd>
                    <span>to submit answer</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span style={{ fontWeight: 800, fontSize: '16px' }}>Answer Submitted</span>
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Time recorded for this question: <span style={{ fontFamily: 'monospace', color: '#a5b4fc', fontWeight: 700 }}>{formatTime(timeElapsed)}</span>
                </p>
              </motion.div>
            )}

          </div>

          {/* Right Column: Studio Proctor & AI Telemetry Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* AI Proctor Video Stream Card */}
            {isCameraEnabled && !isReviewMode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="studio-card"
                style={{ padding: '18px' }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#10b981', boxShadow: '0 0 8px #10b981' }} className="animate-pulse" />
                    <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em', color: '#f8fafc', textTransform: 'uppercase' }}>
                      AI Proctor Feed
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCameraEnabled(false)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#94a3b8',
                      borderRadius: '6px',
                      padding: '3px 10px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    Close
                  </button>
                </div>

                {/* Status Badges Row */}
                {!cameraError && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{
                      padding: '6px 10px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textAlign: 'center',
                      letterSpacing: '0.03em',
                      border: proctorStatus === 'Face detected' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                      background: proctorStatus === 'Face detected' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                      color: proctorStatus === 'Face detected' ? '#6ee7b7' : '#fca5a5'
                    }}>
                      {proctorStatus === 'Face detected'
                        ? '🟢 FOCUSED'
                        : proctorStatus === 'Looking away'
                          ? '⚠️ LOOKING AWAY'
                          : proctorStatus === 'No face detected'
                            ? '❌ NO FACE'
                            : String(proctorStatus || '').toUpperCase()}
                    </div>

                    <div style={{
                      padding: '6px 10px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textAlign: 'center',
                      letterSpacing: '0.03em',
                      border: '1px solid rgba(234, 179, 8, 0.35)',
                      background: 'rgba(234, 179, 8, 0.2)',
                      color: '#fde047'
                    }}>
                      WARNINGS: {warningCount}/6
                    </div>
                  </div>
                )}

                {/* Fixed Height Widescreen 16:9 Camera Feed */}
                <div className="camera-feed-box">
                  {cameraError ? (
                    <div style={{ padding: '16px', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Camera className="w-6 h-6 text-rose-400 mb-1" />
                      <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '2px' }}>Camera Access Required</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{cameraError}</div>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        muted
                        playsInline
                        className="camera-video-elem"
                      />
                      <canvas
                        ref={canvasRef}
                        className="camera-canvas-elem"
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
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.9) 100%)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em', color: '#c7d2fe', textTransform: 'uppercase' }}>
                    RL Adaptive Engine
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#94a3b8' }}>Current Difficulty</span>
                    <span style={{ fontWeight: 800, color: '#818cf8' }}>{rlDifficulty}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#94a3b8' }}>Target Action</span>
                    <span style={{ fontWeight: 800, color: '#34d399' }}>{rlActionName || 'MAINTAIN_DEEPEN'}</span>
                  </div>

                  <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5, paddingTop: '4px' }}>
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
              className="card"
              style={{
                background: 'rgba(30, 27, 75, 0.4)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#e2e8f0',
                padding: '18px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#818cf8' }}>
                <HelpCircle className="w-4 h-4" />
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interview Tips</span>
              </div>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#cbd5e1', paddingLeft: '4px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: '#818cf8', fontWeight: 800 }}>•</span>
                  <span>Structure your response using the <strong>STAR</strong> method (Situation, Task, Action, Result).</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: '#818cf8', fontWeight: 800 }}>•</span>
                  <span>Speak clearly when using <strong>Voice Input</strong> for maximum AI accuracy.</span>
                </li>
              </ul>
            </motion.div>

          </div>

        </div>

        {/* Instant AI Evaluation Feedback Modal */}
        <AnimatePresence>
          {activeEvaluation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  maxWidth: '680px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  padding: '32px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      background: '#ecfdf5',
                      color: '#059669',
                      fontWeight: 800,
                      fontSize: '12px',
                      border: '1px solid #a7f3d0'
                    }}>
                      Answer Submitted ✅
                    </span>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                      Question {questionNumber} of {totalQuestions}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    background: activeEvaluation.review.score >= 7 ? '#f0fdf4' : activeEvaluation.review.score >= 5 ? '#fffbeb' : '#fef2f2',
                    border: `1px solid ${activeEvaluation.review.score >= 7 ? '#bbf7d0' : activeEvaluation.review.score >= 5 ? '#fde68a' : '#fecaca'}`
                  }}>
                    <Sparkles className={`w-5 h-5 ${activeEvaluation.review.score >= 7 ? 'text-emerald-500' : activeEvaluation.review.score >= 5 ? 'text-amber-500' : 'text-red-500'}`} />
                    <span style={{ fontSize: '22px', fontWeight: 900, color: activeEvaluation.review.score >= 7 ? '#15803d' : activeEvaluation.review.score >= 5 ? '#b45309' : '#b91c1c' }}>
                      {typeof activeEvaluation.review.score === 'number' ? activeEvaluation.review.score.toFixed(1) : '7.5'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>/ 10</span>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    AI Response Evaluation
                  </h3>
                  <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.65, background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    {activeEvaluation.review.feedback || 'Good attempt on this question. Continue maintaining structured responses with concrete technical examples.'}
                  </p>
                </div>

                {activeEvaluation.review.strengths?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Strengths</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                      {activeEvaluation.review.strengths.map((s, idx) => (
                        <span key={idx} style={{ padding: '6px 12px', borderRadius: '10px', background: '#f0fdf4', color: '#15803d', fontSize: '13px', fontWeight: 600, border: '1px solid #bbf7d0' }}>
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeEvaluation.review.improvements?.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggestions to Improve</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                      {activeEvaluation.review.improvements.map((imp, idx) => (
                        <span key={idx} style={{ padding: '6px 12px', borderRadius: '10px', background: '#fffbeb', color: '#b45309', fontSize: '13px', fontWeight: 600, border: '1px solid #fde68a' }}>
                          💡 {imp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProceedNext}
                    className="btn-primary"
                    style={{ padding: '12px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>{activeEvaluation.isComplete ? 'View Performance Summary' : `Proceed to Question ${activeEvaluation.nextIndex + 1}`}</span>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default InterviewScreen;
