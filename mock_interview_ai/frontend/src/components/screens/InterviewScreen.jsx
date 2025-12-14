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
  isReviewMode = false 
}) => {
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
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

  const handleSubmit = () => {
    if (answer.trim()) {
      setIsTimerRunning(false);
      onSubmitAnswer(answer, timeElapsed);
      setAnswer('');
      setTimeElapsed(0);
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">Question {questionNumber} of {totalQuestions}</span>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCameraError('');
                  setIsCameraEnabled((v) => !v);
                }}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                type="button"
                aria-label={isCameraEnabled ? 'Disable camera preview' : 'Enable camera preview'}
              >
                {isCameraEnabled ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsTtsEnabled((v) => !v)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                type="button"
                aria-label={isTtsEnabled ? 'Disable question announcements' : 'Enable question announcements'}
              >
                {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {!isReviewMode && (
                <div className="flex gap-2">
                  <button
                    onClick={onPreviousQuestion}
                    disabled={questionNumber === 1}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onNextQuestion}
                    disabled={questionNumber === totalQuestions}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full" style={{ background: '#e5e7eb', borderRadius: 9999, height: 8 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
              style={{ background: '#2563eb', height: 8, borderRadius: 9999 }}
            />
          </div>
        </div>

        {/* Question card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="card mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div style={{ width: 32, height: 32, borderRadius: 9999, background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#2563eb', fontWeight: 600, fontSize: 14 }}>
              {questionNumber}
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                {currentQuestion}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Technical
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Medium
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Answer input area */}
        {!isReviewMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here... (Ctrl+Enter to submit)"
                className="input-field"
                style={{ minHeight: 120, resize: 'none' }}
                disabled={isRecording}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  {answer.length} characters • Press Ctrl+Enter to submit
                </span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleRecording}
                    className={`rounded-full ${
                      isRecording 
                        ? ''
                        : ''
                    }`}
                    style={{
                      padding: 12,
                      border: 'none',
                      cursor: 'pointer',
                      background: isRecording ? '#ef4444' : '#f3f4f6',
                      color: isRecording ? 'white' : '#4b5563',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Submit Answer
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
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording... Click the mic button to stop</span>
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
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3"
                >
                  <div className="text-yellow-800 text-sm font-medium">{recordingError}</div>
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
            className="card bg-gray-50"
          >
            <p className="text-gray-600 italic">
              Answer submitted • Time taken: {formatTime(timeElapsed)}
            </p>
          </motion.div>
        )}

        {typeof document !== 'undefined' && (isCameraEnabled || !!cameraError) && !isReviewMode && createPortal(
          <div
            style={{
              position: 'fixed',
              top: 16,
              right: 16,
              zIndex: 9999,
              width: 280
            }}
          >
            {!cameraError && (
              <div style={{ display: 'grid', gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: 'white',
                    background:
                      proctorStatus === 'Face detected'
                        ? 'rgba(34, 197, 94, 0.35)'
                        : proctorStatus === 'Looking away' || proctorStatus === 'No face detected'
                          ? 'rgba(239, 68, 68, 0.35)'
                          : 'rgba(107, 114, 128, 0.35)'
                  }}
                >
                  {proctorStatus === 'Face detected'
                    ? 'LOOKING AT SCREEN'
                    : proctorStatus === 'Looking away'
                      ? 'LOOKING AWAY'
                      : proctorStatus === 'No face detected'
                        ? 'NO FACE DETECTED'
                        : String(proctorStatus || '').toUpperCase()}
                </div>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 800,
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: 'white',
                    background: 'rgba(234, 179, 8, 0.35)'
                  }}
                >
                  WARNING {warningCount}/6
                </div>
              </div>
            )}

            <div
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(17, 24, 39, 0.95)'
              }}
            >
              {cameraError ? (
                <div style={{ padding: 12, color: 'white' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Camera</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{cameraError}</div>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: 170 }}
                  />
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </motion.div>
    </div>
  );
};

export default InterviewScreen;
